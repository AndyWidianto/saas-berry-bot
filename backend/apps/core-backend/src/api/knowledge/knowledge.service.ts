import { PrismaService } from "../../../../lib/prisma/prisma.service";
import { BadRequestException, ForbiddenException, HttpException, HttpStatus, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CreateKnowledgeAI, PayloadJWT, KnowledgeChunk, WorkspaceWithModels } from "../../../../lib/types";
import * as XLSX from 'xlsx';
import { AIModel, Prisma, Workspace, WorkspaceBalance } from "@prisma/client";
import { GeminiService } from "../../../../lib/agent/gemini.service";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import * as mammoth from 'mammoth';
import BigNumber from "bignumber.js";
import { BillingService } from "@library/billing/billing.service";
import { EmbeddingService } from "@library/shared/embedding.service";
import { CreateKnowledgeUrlDto } from "@library/dto/knowledge";

const pdf = require('pdf-parse-fork');



@Injectable()
export class KnowledgeService {
    constructor(
        private prisma: PrismaService,
        private gemini: GeminiService,
        private billingService: BillingService,
        private embeddingService: EmbeddingService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }

    async createKnowledge(user: PayloadJWT, workspaceId: string, data: CreateKnowledgeAI) {

        // validasi role user, jika role review maka tidak boleh melakukan create knowledge
        if (user.role === "review") {
            throw new BadRequestException("Akses ditolak. Role Review hanya diperbolehkan melihat data.")
        }

        if (!data.file) {
            throw new BadRequestException("File is Required");
        }
        const { workspace, modelEmbedding } = await this.validateWorkspaceAndMember(user.id, workspaceId);
        const workspaceBalance = workspace.workspaceBalances;
        if (!workspaceBalance) {
            throw new BadRequestException("Saldo tidak mencukupi. Silahkan top up saldo terlebih dahulu.");
        };

        const { rawText, chunks, type } = await this.embeddingService.sterilizedFile(data.file);

        const success = await this.embeddingService.checkAndDeductQuotaRedisEmbedding(workspace, chunks.length);
        if (!success) {
            throw new HttpException(
                "Batas 10 request gratis harian kamu sudah habis. Silakan upgrade ke paket Pay-As-You-Go atau coba lagi besok.",
                HttpStatus.TOO_MANY_REQUESTS // 429
            );
        }
        if (workspace.plan !== "FREE") {
            await this.validateBalance(rawText, modelEmbedding, workspaceBalance);
        }

        const knowledge = await this.prisma.knowledge.create({
            data: {
                size: data.file.size,
                name: data.file.originalname,
                totalChunk: chunks.length,
                modelName: modelEmbedding.name,
                type: type ?? "text",
                status: "PROCESSING",
                workspaceId: workspaceId,
            }
        });
        const knowledgeItems = await this.embeddingService.createKnowledgeItems(
            workspaceId, 
            knowledge.id, 
            chunks, 
            modelEmbedding, 
            workspace.plan,
            data.file.originalname
        );

        return {
            message: "Knowledge processed and vectorized",
            data: knowledge,
            totalChunk: knowledgeItems.totalChunks
        };
    }

    async createKnowledgeFromURL(user: PayloadJWT, workspaceId: string, data: CreateKnowledgeUrlDto) {
        if (user.role === "review") {
            throw new BadRequestException("Akses ditolak. Role Review hanya diperbolehkan melihat data.")
        }

        if (!data.url) {
            throw new BadRequestException("Url is Required");
        }
        const { workspace, modelEmbedding } = await this.validateWorkspaceAndMember(user.id, workspaceId);
        const workspaceBalance = workspace.workspaceBalances;
        if (!workspaceBalance) {
            throw new BadRequestException("Saldo tidak mencukupi. Silahkan top up saldo terlebih dahulu.");
        };

        const result = await this.embeddingService.fetchDataAndSterilize(data.url);
        const convertString = this.embeddingService.cleanTextSpacing(this.embeddingService.convertToVectorInput(result).trim());

        const chunks = this.embeddingService.chunking(convertString);

        const success = await this.embeddingService.checkAndDeductQuotaRedisEmbedding(workspace, chunks.length);
        if (!success) {
            throw new HttpException(
                "Batas 10 request gratis harian kamu sudah habis. Silakan upgrade ke paket Pay-As-You-Go atau coba lagi besok.",
                HttpStatus.TOO_MANY_REQUESTS // 429
            );
        }

        if (workspace.plan !== "FREE") {
            await this.validateBalance(convertString, modelEmbedding, workspaceBalance);
        }

        const sizeBytes = this.embeddingService.getTextSizeBytes(convertString);
        const knowledge = await this.prisma.knowledge.create({
            data: {
                size: sizeBytes.bytes,
                name: data.url,
                totalChunk: chunks.length,
                modelName: modelEmbedding.name,
                type: "url",
                status: "PROCESSING",
                workspaceId: workspaceId,
            }
        });
        const knowledgeItems = await this.embeddingService.createKnowledgeItems(workspaceId, knowledge.id, chunks, modelEmbedding, workspace.plan, data.url);


        return {
            message: "Knowledge processed and vectorized",
            data: knowledge,
            totalChunk: knowledgeItems.totalChunks
        };
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

    async validateWorkspaceAndMember(userId: string, workspaceId: string) {
        const existingWorkspace = await this.prisma.workspace.findFirst({
            where: { id: workspaceId },
            include: { workspaceBalances: true, embeddingModel: true, members: true }
        });
        if (!existingWorkspace) {
            throw new NotFoundException("Workspace not found");
        }
        const existingModel = existingWorkspace.embeddingModel;
        if (!existingModel) {
            throw new NotFoundException("AI Model not found. Please create an AI Model first.");
        }
        const findMember = existingWorkspace.members.find(member => member.userId === userId);
        if (!findMember) {
            throw new BadRequestException("Akses ditolak. Anda tidak terdaftar di workspace ini.")
        }
        if (findMember.role === "MEMBER") {
            throw new BadRequestException("Akses ditolak. Role Member tidak diizinkan untuk membuat knowledge ai.");
        }
        return {
            workspace: existingWorkspace,
            member: findMember,
            modelEmbedding: existingModel,
        }
    }


    async getAllKnowledge(workspaceId: string, lastId?: string, limitStr?: string, search?: string) {
        const limit = limitStr ? Number(limitStr) : 10;
        const query: Prisma.KnowledgeFindManyArgs = {
            where: {
                ...search ? {
                    name: {
                        contains: search,
                        mode: 'insensitive'
                    }
                } : {},
                workspaceId: workspaceId
            },
            take: limit,
            orderBy: { createdAt: "desc" },
        };

        if (lastId) {
            query.cursor = { id: lastId };
            query.skip = 1;
        }
        const existingCache = await this.cacheManager.get(`knowledges:${search || "all"}:${lastId || "first"}:${limit}`);
        if (existingCache) {
            return existingCache;
        }
        const [knowledges, totalKnowledge] = await this.prisma.$transaction([
            this.prisma.knowledge.findMany(query),
            this.prisma.knowledge.count()
        ]);
        const totalPage = Math.ceil(totalKnowledge / limit);
        const nextCursor = knowledges.length === limit ? knowledges[knowledges.length - 1].id : null;
        const ResponseData = {
            data: knowledges,
            totalPage: totalPage,
            nextId: nextCursor,
            total: totalKnowledge
        }
        await this.cacheManager.set(`knowledges${workspaceId}:${search || "all"}:${lastId || "first"}:${limit}`, ResponseData, 60 * 1000);
        return ResponseData;
    }

    async findOne(id: string) {
        const existing = await this.prisma.knowledge.findFirst({
            where: { id }
        });
        if (!existing) {
            throw new NotFoundException("Knowledge not found");
        }
        return existing;
    }

    async deleteKnowledge(user: PayloadJWT, workspaceId: string, id: string) {
        if (user.role === "review") {
            throw new BadRequestException("Akses ditolak. Role Review hanya diperbolehkan melihat data.")
        }
        const exisitngMember = await this.prisma.workspaceMember.findFirst({
            where: {
                workspaceId,
                userId: user.id
            }
        })
        if (!exisitngMember) {
            throw new NotFoundException("Workspace tidak ditemukan");
        }
        if (exisitngMember.role === "MEMBER") {
            throw new ForbiddenException("Akses ditolak. Role member tidak di perbolehkan untuk delete knowledge.");
        }
        const exisitng = await this.findOne(id);
        await this.prisma.knowledge.delete({
            where: { id: exisitng.id }
        });
        await this.clearKnowledgeCache(workspaceId);
        return { message: "Delete knowledge successfully" };
    }

    async clearKnowledgeCache(workspaceId: string) {
        try {
            const stores = (this.cacheManager as any).stores || [];
            const keyvStore = stores[0];
            const redisClient =
                keyvStore?.opts?.store?.opts?.client ||
                keyvStore?.opts?.store?.client;

            if (redisClient && typeof redisClient.keys === 'function') {
                const keys = await redisClient.keys(`knowledges:${workspaceId}*`);

                if (keys && keys.length > 0) {
                    await redisClient.del(keys);
                    console.log(`[Cache Clear] Berhasil menghapus ${keys.length} key dari Redis DB 6.`);
                } else {
                    console.log('[Cache Clear] Tidak ada key knowledges:* yang perlu dihapus.');
                }
            } else {
                await this.cacheManager.clear();
                console.log('[Cache Clear] Menggunakan cache.clear() fallback.');
            }
        } catch (error) {
            console.error('[Cache Clear Error]', error);
        }
    }

    async getChunks(workspaceId: string, message: string, modelEmbedding: AIModel | null) {
        console.log("Message: ", message);
        if (!modelEmbedding) {
            throw new BadRequestException("Model not found");
        }
        let messageVector: number[] = [];
        let costInput = {
            totalCost: 0,
            totalUsedToken: 0,
        }
        if (modelEmbedding.provider === "GOOGLE") {
            messageVector = await this.gemini.embeddingsGemini(modelEmbedding.modelCode, message);
            costInput = await this.billingService.totalCostInput("", message, modelEmbedding);
        }
        const vectorString = `[${messageVector.join(',')}]`;
        const contextChunks = await this.prisma.$queryRaw<KnowledgeChunk[]>`
                    SELECT content, similarity, "workspaceId"
                    FROM (
                        SELECT 
                            content, 
                            "workspaceId",
                            1 - (embedding <=> ${vectorString}::vector) AS similarity
                        FROM knowledge_items
                        WHERE "workspaceId" = ${workspaceId}
                        ORDER BY embedding <=> ${vectorString}::vector ASC
                        LIMIT 20 -- Ambil kandidat teratas menggunakan Index
                    ) sub
                    WHERE similarity > 0.6
                    ORDER BY similarity DESC
                    LIMIT 6;
                `;
        return {
            context: contextChunks,
            totalCostInput: costInput
        };
    }
}