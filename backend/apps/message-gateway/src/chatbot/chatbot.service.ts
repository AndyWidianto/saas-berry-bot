import { Injectable, BadRequestException, Inject, NotFoundException, HttpException, Logger, HttpStatus } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import { BillingService } from "@library/billing/billing.service";
import * as crypto from "crypto";
import { PrismaService } from "@library/prisma/prisma.service";
import { KnowledgeService } from "@core/api/knowledge/knowledge.service";
import { KnowledgeChunk, WorkspaceWithModels } from "@library/types";
import { AIModel, CreditTransactionType, Prisma, PlanType, WorkspaceBalance } from "@prisma/client";
import { CreateKnowledgeDto, SendPublicMessageDto, UserMetaDataDto } from "@library/dto/chatbot.dto";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { EmbeddingService } from "@library/shared/embedding.service";
import { GetQueryBotDto } from "@library/dto/message-query.dto";
import { ChattingService } from "@library/chatting/chatting.service";
import { BigNumber } from "bignumber.js";


export interface TokenUsageDetail {
    totalCost: number;
    totalUsedToken: number;
}

export interface CalculatedTokens {
    rewrite?: TokenUsageDetail;
    embedding: TokenUsageDetail;
    chatInput: TokenUsageDetail;
    chatOutput: TokenUsageDetail;
    totalCost: number;
    totalTokens: number;
}

@Injectable()
export class ChatbotService {
    private logger = new Logger();
    constructor(
        private prisma: PrismaService,
        private billingService: BillingService,
        private knowledgeService: KnowledgeService,
        private embeddingService: EmbeddingService,
        private chattingService: ChattingService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        @InjectQueue("queue-chatbot-api") private incomingQueue: Queue,
        @InjectQueue("notification-queue") private notifQueue: Queue
    ) { }

    private buildSessionId(sessionId: string) {
        if (sessionId.startsWith('berry_')) {
            return sessionId;
        }
        return `berry_${sessionId}`;
    }
    private async contactUpsert(workspaceId: string, senderId: string, message: string, user?: UserMetaDataDto) {
        const contact = await this.prisma.contact.upsert({
            where: {
                workspaceId_senderId: {
                    workspaceId: workspaceId,
                    senderId: senderId,
                },
            },
            update: {
                lastActiveAt: new Date(),
                lastMessage: message,
                lastMessageAt: new Date()
            },
            create: {
                workspaceId: workspaceId,
                senderId: senderId,
                phoneNumber: senderId,
                name: user?.name ?? senderId,
                metadata: {
                    ...user
                },
                lastActiveAt: new Date(),
                lastMessage: message,
                lastMessageAt: new Date()
            },
        });
        return contact;
    }
    private async createMessageUser(workspaceId: string, contactId: string, senderId: string, message: string, user?: UserMetaDataDto) {
        return await this.prisma.message.create({
            data: {
                content: message,
                platform: "API",
                workspaceId,
                status: "read",
                type: "text",
                fromMe: false,
                senderName: user?.name ?? senderId,
                senderId: senderId,
                contactId: contactId,
            },
        });
    }
    private async updateBalanceAndCreateCreditLedger(
        workspaceId: string,
        balanceId: string,
        totalCostEmbed: TokenUsageDetail,
    ) {
        await this.prisma.$transaction([
            this.prisma.workspaceBalance.update({
                where: { workspaceId, id: balanceId },
                data: {
                    amount: {
                        decrement: totalCostEmbed.totalCost
                    }
                }
            }),
            this.prisma.creditLedger.create({
                data: {
                    amount: -totalCostEmbed.totalCost,
                    tokensUsed: totalCostEmbed.totalUsedToken,
                    description: `Penggunaan RAG Embedding (${totalCostEmbed.totalUsedToken} token)`,
                    type: CreditTransactionType.USAGE_RAG,
                    workspaceId,
                }
            })
        ])
    }
    async chatBot(apiKey: string, keyPrefix: string, data: SendPublicMessageDto) {
        const startTime = Date.now();

        // Validasi Auth & Workspace
        const { workspace } = await this.validateApiKeyAndGetWorkspace(keyPrefix, apiKey, data.sessionId);
        const { id: workspaceId, messages, chatModel, embeddingModel, workspaceBalances: balance } = workspace;

        if (!embeddingModel || !chatModel) {
            throw new BadRequestException(`Model ${!embeddingModel ? 'embedding' : 'chatting'} belum di setting. mohon setting terlebih dahulu.`);
        }
        if (!balance) {
            throw new BadRequestException("Saldo mencukupi. Mohon isi saldo.");
        }

        const status = await this.chattingService.checkAndDeductQuotaRedis(workspace);
        if (!status) {
            new BadRequestException("Saldo mencukupi. Mohon isi saldo.")
        }

        if (workspace.plan !== "FREE") {
            // Pre-Validation (Fail-Early sebelum query DB / proses berat)
            this.validateWorkspaceModelsAndBalance(chatModel, embeddingModel, balance);
        }

        // Simpan Pesan Masuk dari User
        const senderId = this.buildSessionId(data.sessionId);
        const contact = await this.contactUpsert(workspaceId, senderId, data.message, data.user);
        const userMessage = await this.createMessageUser(workspaceId, contact.id, senderId, data.message, data.user);

        // Proses reWrite 
        let message = data.message;
        let totalCostReWrite: { totalCost: number, totalUsedToken: number } | null = null;
        if (workspace?.rewrite) {
            const response = await this.chattingService.reWrite(workspace, chatModel, message, messages);
            totalCostReWrite = {
                totalCost: response.totalCost,
                totalUsedToken: response.totalToken
            }
            message = response.text;
        }
        // Proses RAG Knowledge & Prompt Engineering
        const { context: chunks, totalCostInput: totalCostInputEmbed } = await this.knowledgeService.getChunks(workspaceId, message, embeddingModel);
        const systemInstruction = this.chattingService.buildSystemInstruction(workspace, chunks);

        //Eksekusi Model AI & Hitung Latensi
        const { totalCostInput, totalCostOutput, text, spam, success } = await this.chattingService.handleResponseAI(chatModel, data.message, systemInstruction, messages);

        if (!success) {
            if (workspace.plan !== "FREE") {
                await this.updateBalanceAndCreateCreditLedger(workspaceId, balance.id, totalCostInputEmbed);
            }
            await this.notifQueue.add("notif-model-error", {
                workspaceId,
                model: chatModel,
                ownerId: workspace.ownerId
            });
            return;
        }
        const responseTime = Date.now() - startTime;

        //Queueing (Background Processing) & Update Saldo
        const totalCost = totalCostInput.totalCost + totalCostOutput.totalCost +
            totalCostInputEmbed.totalCost +
            (totalCostReWrite ? totalCostReWrite.totalCost : 0);

        const totalusedToken = totalCostInput.totalUsedToken +
            totalCostInput.totalUsedToken + totalCostInputEmbed.totalUsedToken +
            (totalCostReWrite ? totalCostReWrite.totalUsedToken : 0);

        const aiMessage = await this.chattingService.buildAiResponseMessage(data, workspaceId, text, contact.id);
        await Promise.all([
            this.dispatchBackgroundJobs(
                workspace,
                senderId,
                text,
                data.message,
                responseTime,
                chunks,
                {
                    chatInput: totalCostInput,
                    embedding: totalCostInputEmbed,
                    chatOutput: totalCostOutput,
                    totalTokens: totalusedToken,
                    totalCost: totalCost,
                    ...(totalCostReWrite ? { rewrite: totalCostReWrite } : {})
                },
                chatModel
            ),
            ...(workspace.plan !== "FREE" ? [
                this.deductWorkspaceBalance(workspaceId, totalCost)
            ] : []),
            //this.handleSpamProtection(data.sessionId, spam),
        ]);

        //Update Cache
        await this.chattingService.updateWorkspaceCache(workspaceId, senderId, workspace, [...messages, userMessage, aiMessage]);

        // Return Format Output
        return {
            success: true,
            data: {
                sessionId: data.sessionId,
                messageId: userMessage.id,
                reply: text,
                tokensUsed: {
                    embeddingTokens: totalCostInputEmbed.totalUsedToken,
                    promptTokens: totalCostInput.totalUsedToken,
                    completionTokens: totalCostOutput.totalUsedToken,
                    totalTokens: totalusedToken,
                },
                createdAt: new Date(),
            },
        };
    }

    private validateWorkspaceModelsAndBalance(chatModel: any, embeddingModel: any, balance: any) {
        if (!balance || balance.amount.toNumber() <= 0) {
            throw new BadRequestException("Saldo tidak mencukupi. Silahkan top up saldo terlebih dahulu.");
        }
        if (!chatModel || !embeddingModel) {
            throw new BadRequestException(`Model ${!chatModel ? "chat" : "embedding"} belum di-setting.`);
        }
        if (!this.billingService.hasEnoughBalance(balance, embeddingModel, chatModel)) {
            throw new BadRequestException("Saldo tidak mencukupi untuk memproses permintaan ini.");
        }
    }

    private async dispatchBackgroundJobs(
        workspace: WorkspaceWithModels,
        senderId: string,
        replyText: string,
        question: string,
        latencyMs: number,
        chunks: any[],
        tokens: CalculatedTokens,
        model: AIModel
    ) {
        const confidenceScore = this.calculateConfidence(chunks);
        const workspaceId = workspace.id;
        return this.incomingQueue.addBulk([
            ...(workspace.plan !== "FREE" ? [
                {
                    name: "create-many-credit-ledger",
                    data: [
                        ...(tokens.rewrite ? [{
                            amount: -tokens.rewrite.totalCost,
                            description: `Query Rewrite Optimization (${tokens.rewrite.totalUsedToken} token)`,
                            type: CreditTransactionType.USAGE_REWRITE,
                            workspaceId,
                            tokensUsed: tokens.rewrite.totalUsedToken
                        }] : []),
                        {
                            amount: -tokens.embedding.totalCost,
                            description: `Penggunaan RAG Embedding (${tokens.embedding.totalUsedToken} token)`,
                            type: CreditTransactionType.USAGE_RAG,
                            workspaceId,
                            tokensUsed: tokens.embedding.totalUsedToken
                        },
                        {
                            amount: -(tokens.chatInput.totalCost + tokens.chatOutput.totalCost),
                            description: `Layanan AI Chat Response (${tokens.chatInput.totalUsedToken + tokens.chatOutput.totalUsedToken} token)`,
                            type: CreditTransactionType.USAGE_CHAT,
                            workspaceId,
                            tokensUsed: tokens.chatInput.totalUsedToken + tokens.chatOutput.totalUsedToken
                        },
                    ] satisfies Prisma.CreditLedgerCreateManyInput[],
                    opts: { removeOnComplete: true },
                }
            ] : []),
            {
                name: "create-ailog",
                data: {
                    answer: replyText,
                    question,
                    latencyMs,
                    workspaceId,
                    modelName: model.name,
                    confidence: confidenceScore,
                    tokensUsed: tokens.chatInput.totalUsedToken + tokens.chatOutput.totalUsedToken,
                    senderJid: senderId
                } as Prisma.AiLogCreateArgs["data"],
                opts: { removeOnComplete: true },
            },
        ]);
    }

    private async deductWorkspaceBalance(workspaceId: string, totalCost: number) {
        return this.prisma.workspaceBalance.update({
            where: { workspaceId },
            data: { amount: { decrement: totalCost } },
        });
    }

    private async handleSpamProtection(sessionId: string, isSpam?: boolean) {
        if (isSpam) {
            await this.cacheManager.set(`block-${sessionId}`, true, 1000 * 60 * 60);
        }
    }

    async validateApiKey(keyPrefix: string, apiKey: string) {
        const existingApikey = await this.prisma.apiKey.findFirst({
            where: { keyPrefix }
        });
        if (!existingApikey) {
            throw new NotFoundException("Api Key not found");
        }
        if (!apiKey) {
            throw new NotFoundException("Api Key not found");
        }
        const apiKeyValid = crypto.createHash("sha256").update(apiKey).digest("hex");
        if (!apiKeyValid) {
            throw new BadRequestException("Api key tidak valid");
        }
        return { data: existingApikey };
    }
    async validateApiKeyAndGetWorkspace(keyPrefix: string, apiKey: string, sessionId: string) {
        const { data } = await this.validateApiKey(keyPrefix, apiKey);
        const isBlocked = await this.cacheManager.get(`block-${sessionId}`);
        if (isBlocked) {
            throw new HttpException('Sesi Anda sedang diblokir sementara karena aktivitas mencurigakan/spam. Silakan coba lagi nanti.', 429);
        }

        const workspaceId = data.workspaceId;
        const workspace = await this.chattingService.getWorkspace(workspaceId, sessionId);
        if (!workspace) {
            throw new BadRequestException("Workspace not found");
        }
        return {
            workspace,
            apikey: data,
            workspaceId
        }
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

    async validateBalance(rawText: string, modelEmbedding: AIModel, balance: WorkspaceBalance) {
        const totalCost = await this.billingService.totalCostInput("", rawText, modelEmbedding);
        const totalBalance = BigNumber(balance.amount.toString());
        if (totalBalance.isLessThan(totalCost.totalCost)) {
            throw new BadRequestException("Saldo tidak mencukupi. Silahkan top up saldo terlebih dahulu.");
        }
        return {
            totalCost,
            totalBalance
        }
    }


    async embeddings(apiKey: string, keyPrefix: string, data: CreateKnowledgeDto, file?: Express.Multer.File) {
        const { data: dataApiKey } = await this.validateApiKey(keyPrefix, apiKey);
        let rawText = "";
        let chunks: string[] = [];
        let objectFile = {
            size: 0,
            originalname: "",
            type: "file"
        }
        if (!file && !data.url) {
            throw new BadRequestException(`file atau url wajib terisi.`)
        }
        if (file) {
            const result = await this.embeddingService.sterilizedFile(file);
            rawText = result.rawText;
            chunks = result.chunks;
            const sizeBytes = this.embeddingService.getTextSizeBytes(rawText);
            objectFile = {
                size: sizeBytes.bytes,
                originalname: file.originalname,
                type: file.mimetype.split("/")[1]
            }
        }
        if (data.url) {
            const result = await this.embeddingService.fetchDataAndSterilize(data.url);
            const convertString = this.cleanTextSpacing(this.convertToVectorInput(result).trim());

            rawText = convertString;
            chunks = this.embeddingService.chunking(convertString);
            const sizeBytes = this.embeddingService.getTextSizeBytes(convertString);
            objectFile = {
                size: sizeBytes.bytes,
                originalname: data.url,
                type: "url"
            }
        }
        const existingWorkspace = await this.prisma.workspace.findUnique({
            where: { id: dataApiKey.workspaceId },
            include: {
                embeddingModel: true,
                workspaceBalances: true
            }
        });
        if (!existingWorkspace) {
            throw new NotFoundException("Workspace not found");
        }
        const workspaceBalance = existingWorkspace.workspaceBalances;
        const modelEmbedding = existingWorkspace.embeddingModel;
        if (!modelEmbedding) {
            throw new NotFoundException("Model embedding tidak ditemukan. mohon setting model embedding terlebih dahulu.");
        }
        const statusSuccess = await this.embeddingService.checkAndDeductQuotaRedisEmbedding(existingWorkspace, chunks.length);
        if (!statusSuccess) {
            throw new HttpException(
                "Batas 10 request gratis harian kamu sudah habis. Silakan upgrade ke paket Pay-As-You-Go atau coba lagi besok.",
                HttpStatus.TOO_MANY_REQUESTS // 429
            );
        }

        if (existingWorkspace.plan !== "FREE") {
            if (!workspaceBalance || workspaceBalance.amount.toNumber() <= 0) {
                throw new BadRequestException("Saldo tidak mencukupi. Mohon isi saldo terlebih dahulu.");
            }
            await this.validateBalance(rawText, modelEmbedding, workspaceBalance);
        }

        const totalCost = await this.billingService.totalCostInput("", rawText, modelEmbedding);
        const success = await this.embeddingService.checkAndDeductQuotaRedisEmbedding(existingWorkspace, chunks.length);
        if (!success) {
            throw new HttpException(
                "Batas 10 request gratis harian kamu sudah habis. Silakan upgrade ke paket Pay-As-You-Go atau coba lagi besok.",
                HttpStatus.TOO_MANY_REQUESTS // 429
            );
        }

        const knowledge = await this.prisma.knowledge.create({
            data: {
                size: objectFile.size,
                name: objectFile.originalname,
                totalChunk: chunks.length,
                modelName: modelEmbedding.name,
                type: objectFile.type ?? "text",
                status: "PROCESSING",
                workspaceId: dataApiKey.workspaceId,
            }
        });
        const knowledgeItems = await this.embeddingService.createKnowledgeItems(dataApiKey.workspaceId, knowledge.id, chunks, modelEmbedding, existingWorkspace.plan);
        return {
            success: true,
            data: {
                workspaceId: existingWorkspace.id,
                knowledge: knowledge,
                usedToken: {
                    totalToken: totalCost.totalUsedToken,
                },
                modelName: [modelEmbedding.name],
                totalChunk: chunks.length,
                type: file ? file.mimetype.split("/")[1] : "url"
            }
        };
    }

    private cleanTextSpacing(text: string): string {
        return text.replace(/\s+/g, ' ').trim();
    }

    private convertToVectorInput(data: any): string {
        if (data === null || data === undefined) {
            return '';
        }

        if (typeof data === 'string') {
            return data;
        }

        if (typeof data === 'object') {
            try {
                return JSON.stringify(data, null, 2);
            } catch {
                return String(data);
            }
        }
        return String(data);
    }

    async getMessages(keyPrefix: string, apiKey: string, contactId: string, { cursor, limit }: GetQueryBotDto) {
        const { data } = await this.validateApiKey(keyPrefix, apiKey);
        const take = limit ? limit : 20;
        const senderId = this.buildSessionId(contactId);
        const query: Prisma.MessageFindManyArgs = {
            where: {
                workspaceId: data.workspaceId,
                senderId: {
                    in: [senderId, contactId] // Gunakan 'in' alih-alih 'OR'
                }
            },
            ...cursor ? {
                cursor: {
                    id: cursor
                },
                skip: 1,
            } : {},
            take,
            orderBy: {
                createdAt: 'desc' // Wajib untuk deterministik cursor pagination
            },
        }
        const [messages, totalMessage] = await this.prisma.$transaction([
            this.prisma.message.findMany(query),
            this.prisma.message.count({
                where: query.where
            })
        ])
        const nextId = messages.length >= take ? messages[messages.length - 1].id : null;
        return {
            success: true,
            data: messages,
            total: totalMessage,
            totalPage: Math.ceil(totalMessage / take),
            pagination: {
                nextCursor: nextId,
                hasMore: nextId ? true : false,
            }
        }
    }

    async getContacts(keyPrefix: string, apiKey: string, { cursor, limit }: GetQueryBotDto) {
        const { data } = await this.validateApiKey(keyPrefix, apiKey);
        const take = limit ? limit : 20;
        const query: Prisma.ContactFindManyArgs = {
            where: {
                workspaceId: data.workspaceId
            },
            ...cursor ? {
                cursor: {
                    id: cursor
                },
                skip: 1,
            } : {},
            take
        }
        const [messages, totalMessage] = await this.prisma.$transaction([
            this.prisma.contact.findMany(query),
            this.prisma.contact.count({
                where: query.where
            })
        ])
        const nextId = messages.length >= take ? messages[messages.length - 1].id : null;
        return {
            success: true,
            data: messages,
            total: totalMessage,
            totalPage: Math.ceil(totalMessage / take),
            pagination: {
                nextCursor: nextId,
                hasMore: nextId ? true : false,
            }
        }
    }
}