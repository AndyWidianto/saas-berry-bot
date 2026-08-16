import { PrismaService } from "../../../../lib/prisma/prisma.service";
import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CreateKnowledgeAI, PayloadJWT, KnowledgeChunk } from "../../../../lib/types";
import * as XLSX from 'xlsx';
import { AIModel, Prisma } from "@prisma/client";
import { GeminiService } from "../../../../lib/agent/gemini.service";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import * as mammoth from 'mammoth';
import BigNumber from "bignumber.js";
import { BillingService } from "@library/billing/billing.service";

const pdf = require('pdf-parse-fork');



@Injectable()
export class KnowledgeService {
    constructor(
        private prisma: PrismaService,
        private gemini: GeminiService,
        private billingService: BillingService,
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
        const findMember = existingWorkspace.members.find(member => member.userId === user.id);
        if (!findMember) {
            throw new BadRequestException("Akses ditolak. Anda tidak terdaftar di workspace ini.")
        }
        if (findMember.role === "MEMBER") {
            throw new BadRequestException("Akses ditolak. Role Member tidak diizinkan untuk membuat knowledge ai.");
        }
        const workspaceBalance = existingWorkspace.workspaceBalances;
        if (!workspaceBalance) return;

        if (!workspaceBalance || workspaceBalance.amount.toNumber() <= 0) {
            throw new BadRequestException("Saldo tidak mencukupi. Silahkan top up saldo terlebih dahulu.");
        }
        let rawText = '';
        let chunks: string[] = [];
        const chunkSize = 1000;
        const chunkOverlap = 200;

        const mimetype = data.file.mimetype;
        let type = "txt";

        if (mimetype === 'application/pdf') {
            const pdfData = await pdf(data.file.buffer);
            rawText = pdfData.text;
            type = "pdf";
        }
        else if (mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || mimetype === 'application/vnd.ms-excel') {
            const workbook = XLSX.read(data.file.buffer, { type: 'buffer' });
            const allRows = workbook.SheetNames.flatMap(sheetName => {
                return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
            });

            if (allRows.length > 0) {
                chunks = allRows.map((row: any) => {
                    return Object.entries(row)
                        .map(([key, val]) => `${key}: ${val}`)
                        .join(", ");
                });
            }
            type = "excel";
        }
        else if (mimetype === 'text/plain') {
            rawText = data.file.buffer.toString('utf-8');
            type = "txt";
        }
        else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimetype === 'application/msword') {
            const result = await mammoth.extractRawText({ buffer: data.file.buffer });
            rawText = result.value;
            type = "docx";
        }
        else {
            throw new BadRequestException("Format file tidak didukung (Gunakan PDF, Excel, atau TXT)");
        }

        if (rawText && rawText.trim()) {
            chunks = this.splitText(rawText, chunkSize, chunkOverlap);
        }
        const totalCost = this.billingService.calculatePayToken(rawText, existingModel);
        const totalBalance = BigNumber(workspaceBalance.amount.toString());
        if (totalBalance.isLessThan(totalCost.totalCost)) {
            throw new BadRequestException("Saldo tidak mencukupi. Silahkan top up saldo terlebih dahulu.");
        }
        const knowledge = await this.prisma.knowledge.create({
            data: {
                size: data.file.size,
                name: data.file.originalname,
                totalChunk: chunks.length,
                type: type,
                status: "PROCESSING",
                workspaceId: workspaceId,
            }
        });

        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms * 1000));
        const batchSize = 10;
        for (let i = 0; i < chunks.length; i += batchSize) {
            const batch = chunks.slice(i, i + batchSize);
            const results = await Promise.all(batch.map(async (chunk) => {
                const vector = await this.gemini.embeddingsGemini(existingModel.modelCode, chunk);
                return {
                    content: chunk,
                    vector: `[${vector.join(',')}]`
                };
            }));
            const values = results.map((d) => {
                return Prisma.sql`(
                        gen_random_uuid(), 
                        ${d.content}, 
                        ${d.vector}::vector, 
                        ${knowledge.id},
                        ${existingWorkspace.id},
                        now(), 
                        now()
                    )`;
            });
            await this.prisma.$executeRaw`
                    INSERT INTO "knowledge_items" (
                        "id", 
                        "content",
                        "embedding", 
                        "knowledgeId",
                        "workspaceId",
                        "created_at", 
                        "updated_at"
                    ) 
                    VALUES ${Prisma.join(values)}
            `;
            await delay(2);
        }

        const [updateKnowledge, _workspaceBalance] = await this.prisma.$transaction([
            this.prisma.knowledge.update({
                where: { id: knowledge.id },
                data: { status: "INDEXED" }
            }),
            this.prisma.workspaceBalance.update({
                where: { workspaceId },
                data: {
                    amount: {
                        decrement: totalCost.totalCost
                    }
                }
            }),
            this.prisma.creditLedger.create({
                data: {
                    amount: totalCost.totalCost,
                    type: "USAGE_RAG",
                    workspaceId,
                    description: `Melakukan embedding file ${data.file.filename}`
                }
            })
        ])
        await this.clearKnowledgeCache(workspaceId);

        return {
            message: "Knowledge processed and vectorized",
            data: updateKnowledge
        };
    }

    private splitText(text: string, size: number, overlap: number): string[] {
        const chunks: string[] = [];
        let i = 0;
        const cleanText = text.replace(/\0/g, '').trim();

        while (i < cleanText.length) {
            chunks.push(cleanText.slice(i, i + size));
            i += size - overlap;
        }
        return chunks;
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
        if (!modelEmbedding) {
            throw new BadRequestException("Model not found");
        }
        let messageVector: number[] = [];
        if (modelEmbedding.provider === "GOOGLE") {
            messageVector = await this.gemini.embeddingsGemini(modelEmbedding.modelCode, message);
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
        return contextChunks;
    }
}