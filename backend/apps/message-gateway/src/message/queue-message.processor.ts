import { PrismaService } from "@library/prisma/prisma.service";
import { InjectQueue, Processor, WorkerHost } from "@nestjs/bullmq";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Logger } from "@nestjs/common";
import { WAMessage } from "@whiskeysockets/baileys";
import { Job, Queue } from "bullmq";
import type { Cache } from "cache-manager";
import { KnowledgeChunk } from "@library/types";
import { GeminiService } from "@library/agent/gemini.service";
import { BillingService } from "@library/billing/billing.service";
import { ChatbotService } from "../chatbot/chatbot.service";
import { CreditTransactionType, StatusIntegration } from "@prisma/client";


@Processor("message-queue")
export class MessageProcessor extends WorkerHost {
    private readonly logger = new Logger();
    constructor(
        private prisma: PrismaService,
        private gemini: GeminiService,
        private billingService: BillingService,
        private chatbotService: ChatbotService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        @InjectQueue("whatsapp-outgoing-queue") private messageQueue: Queue
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

    async handleMessage(workspaceId: string, instanceName: string, data: WAMessage) {
        if (!workspaceId || !instanceName || !data) return;
        try {
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

            const workspace = await this.chatbotService.getWorkspace(workspaceId, remote);
            if (!workspace) return;

            const messages = workspace.messages;
            const chatModel = workspace.chatModel;
            const embeddingModel = workspace.embeddingModel;
            const newMessage = await this.prisma.message.create({
                data: {
                    content: message,
                    platform: "WHATSAPP_BAYLIES",
                    workspaceId: workspaceId,
                    status: "read",
                    type: "text",
                    senderId: remote || ""
                }
            });

            if (!embeddingModel) return;
            if (!chatModel) return;

            const workspaceBalance = workspace.workspaceBalances;
            const balanceEnough = this.validateWorkspaceModelsAndBalance(chatModel, embeddingModel, workspaceBalance);
            if (!balanceEnough) return;

            let totalCostReWrite: { totalCost: number, totalUsedToken: number } | null = null;
            if (workspace?.rewrite) {
                const responseAi = await this.chatbotService.reWrite(chatModel, message, messages);
                message = responseAi.text;
                console.log("Rewrite: ", responseAi);
                totalCostReWrite = {
                    totalCost: responseAi.totalCost,
                    totalUsedToken: responseAi.totalToken
                }
            }
            const chunks = await this.chatbotService.getChunks(workspaceId, message, embeddingModel);
            const systemInstruction = this.chatbotService.buildSystemInstruction(workspace, chunks);

            const responseAI = await this.chatbotService.handleResponseAI(chatModel, message, systemInstruction, messages);
            const text = responseAI.text;
            if (responseAI.spam) {
                this.cacheManager.set(`block-${remote}`, true, 1000 * 60 * 60);
            }

            const totalCostChatting = this.billingService.totalCostInput(`${systemInstruction} ${messages.map(m => m.content).join(" ")}`, chatModel);
            const totalCostEmbedding = this.billingService.totalCostInput(message, embeddingModel);
            const totalCostOutputChat = this.billingService.totalCostOutput(text, chatModel);
            await this.messageQueue.add("send-message", {
                instanceName,
                target: remote || "",
                type: "text",
                message: text
            }, {
                removeOnComplete: true,
                attempts: 3,
            })
            const confidenceScore = this.calculateConfidence(chunks);
            const newMessageFromMe = await this.prisma.message.create({
                data: {
                    content: text,
                    fromMe: true,
                    senderId: remote || "",
                    platform: "WHATSAPP_BAYLIES",
                    status: "sent",
                    type: "text",
                    senderName: pushName,
                    workspaceId,
                }
            });
            const totalCost = totalCostChatting.totalCost + totalCostOutputChat.totalCost + (totalCostReWrite ? totalCostReWrite.totalCost : 0);
            const newHistoryMessages = [...messages, newMessage, newMessageFromMe];
            if (newHistoryMessages.length > 10) {
                newHistoryMessages.slice(0, 2);
            }
            workspace.messages = newHistoryMessages;
            const responseTime = Date.now() - startTime;
            const [updateWorkspaceBalance] = await this.prisma.$transaction([
                this.prisma.workspaceBalance.update({
                    where: { id: workspaceBalance?.id },
                    data: {
                        amount: { decrement: totalCost }
                    }
                }),
                this.prisma.aiLog.create({
                    data: {
                        answer: text,
                        confidence: confidenceScore,
                        question: message,
                        workspaceId: workspaceId,
                        modelName: chatModel.name,
                        latencyMs: responseTime
                    }
                }),
                this.prisma.creditLedger.createMany({
                    data: [
                        ...(totalCostReWrite ? [{
                            amount: totalCostReWrite.totalCost,
                            tokensUsed: totalCostReWrite.totalUsedToken,
                            description: `Query Rewrite Optimization (${totalCostReWrite.totalUsedToken} token)`,
                            type: CreditTransactionType.USAGE_REWRITE,
                            workspaceId: workspaceId
                        }] : []),
                        {
                            amount: totalCostEmbedding.totalCost,
                            tokensUsed: totalCostEmbedding.totalUsedToken,
                            description: `Penggunaan RAG Embedding (${totalCostEmbedding.totalUsedToken} token)`,
                            type: CreditTransactionType.USAGE_RAG,
                            workspaceId,
                        },
                        {
                            amount: totalCostChatting.totalCost + totalCostOutputChat.totalCost,
                            tokensUsed: totalCostChatting.totalUsedToken + totalCostOutputChat.totalUsedToken,
                            description: `Layanan AI Chat Response (${totalCostChatting.totalUsedToken + totalCostOutputChat.totalUsedToken} token)`,
                            type: CreditTransactionType.USAGE_CHAT,
                            workspaceId,
                        },
                    ]
                }),
            ]);
            workspace.workspaceBalances = updateWorkspaceBalance;
            await this.cacheManager.set(workspaceId, workspace, 1000 * 60 * 5);
        } catch (err) {
            console.error("Error: ", err);
            await this.messageQueue.add("precence-update", {
                instanceName,
                status: "paused"
            }, {
                removeOnComplete: true,
                attempts: 3,
            })
        }
    }

    private validateWorkspaceModelsAndBalance(chatModel: any, embeddingModel: any, balance: any) {
        if (!balance || balance.amount.toNumber() <= 0) {
            return false;
        }
        if (!chatModel || !embeddingModel) {
            return false;
        }
        if (!this.billingService.hasEnoughBalance(balance, embeddingModel, chatModel)) {
            return false;
        }
        return true;
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

            await this.prisma.integration.update({
                where: { instanceName },
                data: {
                    status,
                    number: phoneNumber ?? null
                }
            });
        } catch (error: any) {
            this.logger.error(`Gagal update: ${error?.message}`);
        }
    }
}