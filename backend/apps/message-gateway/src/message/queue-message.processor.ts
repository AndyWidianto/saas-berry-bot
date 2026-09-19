import { PrismaService } from "@library/prisma/prisma.service";
import { InjectQueue, Processor, WorkerHost } from "@nestjs/bullmq";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Logger } from "@nestjs/common";
import { downloadContentFromMessage, WAMessage, WAMessageKey, WAPresence } from "@whiskeysockets/baileys";
import { Job, Queue } from "bullmq";
import type { Cache } from "cache-manager";
import { KnowledgeChunk, WhatsappBayliesSetting, WorkspaceWithModels } from "@library/types";
import { GeminiService } from "@library/agent/gemini.service";
import { BillingService } from "@library/billing/billing.service";
import { ChatbotService } from "../chatbot/chatbot.service";
import { AIModel, Contact, CreditTransactionType, StatusIntegration, WorkspaceBalance } from "@prisma/client";
import { MessageMediaDto, MessageTextDto } from "@library/dto/message.dto";
import { ChattingService } from "@library/chatting/chatting.service";
import { OrderService } from "@library/order/order.service";
import { OrderCache } from "@library/dto/order.dto";
import { StorageService } from "@library/storage/storage.service";
import { v4 as uuid } from "uuid";


export interface UsedToken {
    totalCost: number;
    totalUsedToken: number;
}

@Processor("message-queue")
export class MessageProcessor extends WorkerHost {
    private readonly logger = new Logger();
    constructor(
        private prisma: PrismaService,
        private billingService: BillingService,
        private chattingService: ChattingService,
        private orderService: OrderService,
        private readonly storage: StorageService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        @InjectQueue("whatsapp-outgoing-queue") private messageQueue: Queue,
        @InjectQueue("notification-queue") private notifQueue: Queue,
        @InjectQueue("queue") private serviceQueue: Queue
    ) {
        super();
    }

    async process(job: Job, token?: string): Promise<any> {
        this.logger.log(`Memproses job id: ${job.id} dengan tipe: ${job.name}`);
        try {
            const data = job.data;
            switch (job.name) {
                case "process-incoming-msg":
                    await this.handleMessage(data.workspaceId, data.instanceName, data.message);
                    break;
                case "update-integration":
                    await this.updateIntegration(data.instanceName, data.status, data.phoneNumber);
                    break;
                default:
                    break;
            }
        } catch (err) {
            throw err;
        }
    }

    private markdownToWA(text: string) {
        if (!text) return '';

        return text
            .replace(/~~(.*?)~~/g, '~$1~')
            .replace(/`([^`\n]+)`/g, '```$1```')
            .replace(/(?<!\*)\*(?!\*)\s*([^*]+?)\s*(?<!\*)\*(?!\*)/g, '_$1_')
            .replace(/\*\*(.*?)\*\*/g, '*$1*')
            .replace(/^#{1,6}\s+(.+)$/gm, (_, title) => `*${title.trim().toUpperCase()}*`);
    }

    private async upsertContact(workspaceId: string, remote: string, message: string, pushName?: string) {
        const now = new Date();
        return this.prisma.contact.upsert({
            where: {
                workspaceId_senderId: { workspaceId, senderId: remote },
            },
            update: {
                lastActiveAt: now,
                lastMessage: message,
                lastMessageAt: now,
                unreadCount: { increment: 1 },
            },
            create: {
                workspaceId,
                senderId: remote,
                phoneNumber: remote ? remote.split("@")[0] : null,
                name: pushName ?? remote,
                lastActiveAt: now,
                lastMessage: message,
                lastMessageAt: now,
                unreadCount: 1,
            },
        });
    }

    private async handleMissingModelNotification(workspace: any) {
        const cooldownKey = `notif:model:${workspace.id}`;
        await this.notifQueue.add("notif-model", {
            workspaceId: workspace.id,
            name: workspace.name,
        }, { removeOnComplete: true });
        await this.cacheManager.set(cooldownKey, true, 1000 * 60 * 60 * 24);
    }

    private async handleFailedAiResponse(workspaceId: string, balanceId: string, ownerId: string, chatModel: any, embeddingCost: any) {
        await this.prisma.$transaction([
            this.prisma.workspaceBalance.update({
                where: { workspaceId, id: balanceId },
                data: { amount: { decrement: embeddingCost.totalCost } },
            }),
            this.prisma.creditLedger.create({
                data: {
                    amount: -embeddingCost.totalCost,
                    tokensUsed: embeddingCost.totalUsedToken,
                    description: `Penggunaan RAG Embedding (${embeddingCost.totalUsedToken} token)`,
                    type: CreditTransactionType.USAGE_RAG,
                    workspaceId,
                },
            }),
        ]);

        await this.notifQueue.add("notif-model-error", { workspaceId, model: chatModel, ownerId });
    }

    private async createMessage(workspaceId: string, message: string, remote: string, contact: Contact, fromMe: boolean) {
        return await this.prisma.message.create({
            data: {
                content: message,
                platform: "WHATSAPP_BAYLIES",
                workspaceId,
                status: "read",
                type: "text",
                fromMe: fromMe,
                senderId: remote,
                contactId: contact.id,
            },
        });
    }

    private async triggerWhatsAppEvents(instanceName?: string, remote?: string, data?: any, settings?: any, status: WAPresence = "composing") {
        if (!settings) return;

        if (status === "composing" && settings.autoRead && data?.key) {
            await this.messageQueue.add("read-message", {
                instanceName,
                data: {
                    remoteJid: remote,
                    id: data.key.id,
                    participant: data.key.participant,
                },
            }, { removeOnComplete: true, attempts: 3 });
        }

        if (Array.isArray(settings.event) && settings.event.includes("presence.update")) {
            await this.messageQueue.add("presence-update", {
                instanceName,
                status,
                target: remote,
            }, { removeOnComplete: true, attempts: 3 });
        }
    }

    async handleMessage(workspaceId: string, instanceName: string, data: WAMessage) {
        if (!workspaceId || !instanceName || !data) return;

        const device = await this.prisma.integration.findUnique({
            where: { instanceName }
        });
        if (!device) return;
        const settings = (device as any).settings as WhatsappBayliesSetting;
        if (settings && !settings.event?.includes("messages.upsert")) return;
        if (settings && Array.isArray(settings.event) && !settings.event.includes("messages.upsert")) return;

        const startTime = Date.now();
        const msg = data.message;
        let message =
            msg?.conversation ||
            msg?.extendedTextMessage?.text ||
            msg?.imageMessage?.caption ||
            msg?.videoMessage?.caption ||
            msg?.documentMessage?.caption ||
            msg?.buttonsResponseMessage?.selectedButtonId ||
            msg?.listResponseMessage?.singleSelectReply?.selectedRowId ||
            "";
        message = message.trim();
        const remote = data.key.remoteJidAlt;
        const pushName = data.pushName;
        const imageMessage = msg?.imageMessage;

        if (!remote) return;
        try {
            // status finish 
            let finish = false;
            let textOutput = "";
            let chunks: KnowledgeChunk[] = [];
            let systemInstruction = "";
            let totalCostReWrite: UsedToken = { totalCost: 0, totalUsedToken: 0 };
            let totalCostEmbedding: UsedToken = { totalCost: 0, totalUsedToken: 0 };
            let totalCostChatting: UsedToken = { totalCost: 0, totalUsedToken: 0 };
            let totalCostOutputChat: UsedToken = { totalCost: 0, totalUsedToken: 0 };
            let prompt = "";

            // Guard Clause: Validasi Workspace & Jam Kerja
            const workspace = await this.chattingService.getWorkspace(workspaceId, remote);
            if (!workspace || !this.checkWorkingHour(workspace)) return;

            const success = await this.chattingService.checkAndDeductQuotaRedis(workspace);
            if (!success) {
                // ini harusnya nanti tambahkan notif email
                return;
            }

            const { chatModel, embeddingModel, workspaceBalances: workspaceBalance, messages } = workspace;

            // Guard Clause: Validasi Model AI & Saldo
            if (!chatModel || !embeddingModel) {
                await this.handleMissingModelNotification(workspace);
                return;
            }

            if (!workspaceBalance) return;
            if (workspace.plan !== "FREE") {
                const isBalanceEnough = await this.checkAndNotifyBalance(chatModel, embeddingModel, workspaceBalance);
                if (!isBalanceEnough) return;
            }

            // Database Operations: Contact & User Message
            const contact = await this.upsertContact(workspaceId, remote, message, pushName ?? "");
            const newMessage = await this.createMessage(workspaceId, message, remote, contact, false);

            await this.notifQueue.add("notif-message", newMessage, { removeOnComplete: true });

            // WhatsApp Event Triggers (Auto Read & Presence Composing)
            await this.triggerWhatsAppEvents(instanceName, remote, data, settings, "composing");

            const sessionKey = `session:${remote}`;
            if (imageMessage && workspace.isProductActive) {
                const getStatusPayment = await this.cacheManager.get<OrderCache>(sessionKey);
                if (getStatusPayment?.status === "WAITING_FOR_PAYMENT") {
                    const stream = await downloadContentFromMessage(imageMessage, 'image');
                    let buffer = Buffer.from([]);
                    for await (const chunk of stream) {
                        buffer = Buffer.concat([buffer, chunk]);
                    }

                    // B. Ubah Buffer ke format Base64 untuk Gemini
                    const imageBase64 = buffer.toString('base64');
                    const mimeType = imageMessage.mimetype || 'image/jpeg';
                    const prompt = `
                    Analisis gambar bukti transfer/QRIS ini dan kembalikan HANYA JSON murni tanpa markdown dengan struktur:
                    {
                        "isValidReceipt": boolean, // true jika ini bukti transfer/QRIS/E-Wallet asli
                        "amount": number, // total nominal transfer (angka saja)
                        "paymentMethod": string, // misal: "QRIS", "BCA", "GOPAY", "OVO", dll.
                        "status": "SUCCESS" | "PENDING" | "FAILED"
                    }
                    `;
                    const response = await this.handlePayment(chatModel, message, prompt, imageBase64, mimeType, getStatusPayment, remote);
                    totalCostOutputChat = response.totalCostOutput;
                    totalCostChatting = response.totalCostInput;
                    textOutput = response.text;
                    finish = true;
                }
            }

            if (!finish) {
                let queryRewrite = "";

                if (workspace.rewrite) {
                    const result = await this.chattingService.reWrite(workspace, chatModel, message, messages);
                    if (!result.success) {
                        await this.notifQueue.add("notif-model-error", {
                            workspaceId,
                            model: chatModel,
                            ownerId: workspace.ownerId,
                        });
                        return;
                    }
                    queryRewrite = result.text;
                    totalCostReWrite = { totalCost: result.totalCost, totalUsedToken: result.totalToken };
                }

                // RAG Chunks & Prompt Construction
                chunks = await this.chattingService.getChunks(workspaceId, message, embeddingModel);
                systemInstruction = await this.chattingService.buildSystemInstruction(workspace, chunks, contact);

                prompt = workspace.rewrite
                    ? `MAKSUD PERTANYAAN TERSEMBUNYI (Paham Konteks): \n "${queryRewrite}" \n PERTANYAAN ASLI PENGGUNA (Jawab sesuai gaya/bahasa pengguna ini): \n "${message}"`.trim()
                    : message;

                totalCostEmbedding = await this.billingService.totalCostInput(systemInstruction, prompt, embeddingModel);

                // Panggil Model AI Chat
                const { success: ResponseSuccess, text: ResponseText, totalCostInput, totalCostOutput } = await this.chattingService.handleResponseAI(chatModel, message, systemInstruction, messages, remote);
                totalCostChatting = totalCostInput;
                totalCostOutputChat = totalCostOutput;

                // Handle Kegagalan AI
                if (!ResponseSuccess) {
                    console.error("AI Generation Error: ", ResponseText);
                    await this.handleFailedAiResponse(workspaceId, workspaceBalance.id, workspace.ownerId, chatModel, totalCostEmbedding);
                    return;
                }
                textOutput = ResponseText;
            }

            // membersihkan object
            const cleanObject = await this.chattingService.cleanResponseAI(workspace, textOutput);
            // Kirim Pesan Balasan ke WhatsApp
            const cleanText = this.markdownToWA(cleanObject.text);
            if (cleanObject.type === "text") {
                await this.messageQueue.add(
                    "send-message",
                    { instanceName, to: remote || "", text: cleanText } as MessageTextDto,
                    { removeOnComplete: true, attempts: 3 },
                );
            }
            if (cleanObject.type === "image") {
                await this.messageQueue.add(
                    "send-media",
                    {
                        instanceName,
                        to: remote || "",
                        caption: cleanText,
                        imageUrl: cleanObject.image,
                        thumbnail: cleanObject.thumbnail
                    } as MessageMediaDto,
                    { removeOnComplete: true, attempts: 3 },
                );
            }

            if (workspace.isProductActive && cleanObject.order) {
                const orderId = uuid();
                await this.serviceQueue.add("create-order", {
                    orderId,
                    workspaceId,
                    userId: workspace.ownerId,
                    data: cleanObject.order
                }, {
                    removeOnComplete: true,
                });
                await this.cacheManager.set(sessionKey, {
                    orderId: orderId,
                    status: "WAITING_FOR_PAYMENT",
                    total: cleanObject.order.total,
                    detail: cleanObject.order.detail,
                } as OrderCache, 1000 * 60 * 60 * 3);
            }

            const totalCost = totalCostChatting.totalCost + totalCostOutputChat.totalCost + totalCostReWrite.totalCost + totalCostEmbedding.totalCost;
            const responseTime = Date.now() - startTime;
            const confidenceScore = this.calculateConfidence(chunks);

            // Atomic Transaction: Simpan Pesan AI, Update Contact, Ledger & Log AI
            const [newMessageFromMe] = await this.prisma.$transaction([
                this.prisma.message.create({
                    data: {
                        contactId: contact.id,
                        content: textOutput,
                        fromMe: true,
                        senderId: remote || "",
                        platform: "WHATSAPP_BAYLIES",
                        status: "sent",
                        type: cleanObject.type,
                        mediaUrl: cleanObject.image,
                        senderName: pushName,
                        workspaceId,
                    },
                }),
                this.prisma.contact.update({
                    where: { id: contact.id },
                    data: {
                        lastMessage: textOutput,
                        lastActiveAt: new Date(),
                        lastMessageAt: new Date(),
                        unreadCount: { decrement: 1 },
                        metadata: {...cleanObject.order?.detail, delivery: cleanObject.order?.delivery, paymentMethod: cleanObject.order?.payment_method }
                    },
                }),
                this.prisma.aiLog.create({
                    data: {
                        answer: textOutput,
                        confidence: confidenceScore,
                        question: message,
                        workspaceId,
                        modelName: chatModel.name,
                        latencyMs: responseTime,
                        senderJid: remote,
                        tokensUsed: totalCost,
                    },
                }),
                ...(workspace.plan !== "FREE" ? [
                    this.prisma.creditLedger.createMany({
                        data: [
                            ...(totalCostReWrite.totalCost > 0
                                ? [{
                                    amount: -totalCostReWrite.totalCost,
                                    tokensUsed: totalCostReWrite.totalUsedToken,
                                    description: `Query Rewrite Optimization (${totalCostReWrite.totalUsedToken} token)`,
                                    type: CreditTransactionType.USAGE_REWRITE,
                                    workspaceId,
                                }]
                                : []),
                            ...(totalCostEmbedding.totalUsedToken > 0 ? [{
                                amount: -totalCostEmbedding.totalCost,
                                tokensUsed: totalCostEmbedding.totalUsedToken,
                                description: `Penggunaan RAG Embedding (${totalCostEmbedding.totalUsedToken} token)`,
                                type: CreditTransactionType.USAGE_RAG,
                                workspaceId,
                            }] : []),
                            {
                                amount: -(totalCostChatting.totalCost + totalCostOutputChat.totalCost),
                                tokensUsed: totalCostChatting.totalUsedToken + totalCostOutputChat.totalUsedToken,
                                description: `Layanan AI Chat Response (${totalCostChatting.totalUsedToken + totalCostOutputChat.totalUsedToken} token)`,
                                type: CreditTransactionType.USAGE_CHAT,
                                workspaceId,
                            },
                        ],
                    })
                ] : []),
            ]);

            // Sync Cache & Notifikasi
            await this.notifQueue.add("notif-message", newMessageFromMe, { removeOnComplete: true });
            if (workspace.plan !== "FREE") {
                const updatedBalance = await this.prisma.workspaceBalance.update({
                    where: { id: workspaceBalance.id },
                    data: { amount: { decrement: totalCost } },
                })
                workspace.workspaceBalances = updatedBalance;
            }
            const newHistoryMessages = [...messages, newMessage, newMessageFromMe];
            await this.chattingService.updateWorkspaceCache(workspaceId, remote, workspace, newHistoryMessages);

        } catch (err) {
            console.error("Error Processing Incoming Message: ", err);
            await this.triggerWhatsAppEvents(instanceName, remote, data, settings, "paused");
        }
    }

    private checkWorkingHour(workspace: WorkspaceWithModels): boolean {
        if (!workspace.workingHoursEnabled) return true;
        if (!workspace.workingHours || !workspace.timezone) return true;

        try {
            const workingHoursConfig = workspace.workingHours as Record<
                string,
                { enabled: boolean; start: string; end: string }
            >;
            const now = new Date();
            const timeZone = workspace.timezone || 'UTC';

            // Dapatkan nama hari
            const currentDay = new Intl.DateTimeFormat('en-US', {
                weekday: 'long',
                timeZone,
            }).format(now).toLowerCase();

            const todaySchedule = workingHoursConfig[currentDay];
            if (!todaySchedule || !todaySchedule.enabled) {
                return false;
            }

            const { start, end } = todaySchedule;

            // Handle khusus jika diset 24 Jam penuh
            if (
                (start === '00:00' && (end === '00:00' || end === '24:00')) ||
                (start === '12:00 AM' && end === '12:00 AM')
            ) {
                return true;
            }

            // Dapatkan jam & menit lokal workspace
            const parts = new Intl.DateTimeFormat('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: false,
                timeZone,
            }).formatToParts(now);

            const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10) % 24;
            const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
            const currentMinutes = hour * 60 + minute;

            // Helper untuk konversi format "HH:mm" ke menit
            const parseTimeToMinutes = (timeStr: string): number => {
                const [h, m] = timeStr.split(':').map(val => parseInt(val, 10));
                return h * 60 + m;
            };

            const startMinutes = parseTimeToMinutes(start);
            const endMinutes = parseTimeToMinutes(end);

            // Cek rentang waktu (termasuk kasus melewati tengah malam/overnight)
            if (startMinutes <= endMinutes) {
                // Rentang normal, misal 08:00 - 17:00
                return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
            } else {
                // Rentang lewat tengah malam, misal 22:00 - 06:00
                return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
            }

        } catch (error) {
            // Fallback jika terjadi error parsing
            return true;
        }
    }

    async handlePayment(
        model: AIModel,
        message: string,
        systemInstruction: string,
        base64: string,
        mimeType: string,
        order: OrderCache,
        remote: string,
    ) {
        const response = await this.chattingService.handleResponseAI(model, message, systemInstruction, [], remote, { base64, mimeType, order });
        if (response.isValidReceipt) {
            const key = uuid();
            const upload = await this.storage.uploadBase64File(base64, `${key}.png`);
            await Promise.all([
                this.prisma.order.update({
                    where: { id: order.orderId },
                    data: {
                        paymentProofUrl: upload,
                        filename: key,
                        paidAt: new Date(),
                        status: "PAID",
                    }
                }),
                this.cacheManager.del(`session:${remote}`)
            ])

        }
        return response;
    }

    private async checkAndNotifyBalance(
        chatModel: AIModel,
        embeddingModel: AIModel,
        balance: WorkspaceBalance
    ): Promise<boolean> {
        const currentAmount = Number(balance?.amount || 0);
        const LOW_BALANCE_THRESHOLD = 10000;

        if (!this.hasSufficientBalance(chatModel, embeddingModel, balance)) {
            const criticalCooldownKey = `cooldown:notif-balance-critical:${balance.workspaceId}`;
            const isCriticalNotified = await this.cacheManager.get(criticalCooldownKey);
            if (!isCriticalNotified) {
                await this.notifQueue.add("notif-balance-low", {
                    balance: balance.amount.toNumber(),
                    level: "CRITICAL",
                    workspaceId: balance.workspaceId
                }, { removeOnComplete: true });

                await this.cacheManager.set(criticalCooldownKey, true, 1000 * 60 * 60 * 24);
            }

            return false; // Hentikan eksekusi layanan
        }
        if (currentAmount <= LOW_BALANCE_THRESHOLD) {
            const warningCooldownKey = `cooldown:notif-balance-warning:${balance.workspaceId}`;
            const isWarningNotified = await this.cacheManager.get(warningCooldownKey);

            if (!isWarningNotified) {
                await this.notifQueue.add("notif-balance-low", {
                    balance: currentAmount,
                    level: "WARNING",
                    workspaceId: balance.workspaceId
                }, { removeOnComplete: true });

                await this.cacheManager.set(warningCooldownKey, true, 1000 * 60 * 60 * 24);
            }
        }

        return true; // Layanan tetap lanjut karena saldo masih ada
    }

    private hasSufficientBalance(chatModel: AIModel, embeddingModel: AIModel, balance: WorkspaceBalance) {
        let enough = true;
        if (!balance || balance.amount.toNumber() <= 0) {
            enough = false;
        }
        if (!chatModel || !embeddingModel) {
            enough = false;
        }
        if (!this.billingService.hasEnoughBalance(balance, embeddingModel, chatModel)) {
            enough = false;
        }
        return enough;
    }

    private calculateConfidence(chunks: KnowledgeChunk[]): number {
        if (!chunks || chunks.length === 0) {
            return 0.0;
        }
        const top1Score = Number(chunks[0].similarity);
        if (chunks.length === 1) {
            return Number(top1Score.toFixed(4));
        }
        const top2Score = Number(chunks[1].similarity);
        const remainingChunks = chunks.slice(2);
        const avgRemaining = remainingChunks.length > 0
            ? remainingChunks.reduce((acc, curr) => acc + Number(curr.similarity), 0) / remainingChunks.length
            : top2Score;

        const weightedConfidence = (top1Score * 0.6) + (top2Score * 0.3) + (avgRemaining * 0.1);

        return Number(weightedConfidence.toFixed(4));
    }

    async updateIntegration(instanceName: string, status: StatusIntegration, phoneNumber?: string) {
        try {
            const integration = await this.prisma.integration.update({
                where: { instanceName },
                data: {
                    status,
                    number: phoneNumber ?? null
                }
            });
            await this.notifQueue.add("notif-integration.update", {
                instanceName,
                status,
                workspaceId: integration.workspaceId
            }, {
                removeOnComplete: true
            })
        } catch (error: any) {
            this.logger.error(`Gagal update: ${error?.message}`);
        }
    }
}