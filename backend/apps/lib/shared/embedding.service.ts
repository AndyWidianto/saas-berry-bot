import { PrismaService } from "@library/prisma/prisma.service";
import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import * as XLSX from 'xlsx';
import { AIModel, PlanType, Prisma, Workspace, } from "@prisma/client";
import * as mammoth from 'mammoth';
import { GeminiService } from "@library/agent/gemini.service";
import { KnowledgeChunk } from "@library/types";
import sanitizeHtml from 'sanitize-html';
import { OpenaiService } from "@library/agent/openai.service";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";

const pdf = require('pdf-parse-fork');


@Injectable()
export class EmbeddingService {
    constructor(
        private prisma: PrismaService,
        private gemini: GeminiService,
        private openai: OpenaiService,
        @InjectQueue("queue-knowledge-base") private queueKnowledge: Queue,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }

    async checkAndDeductQuotaRedisEmbedding(workspace: Workspace, totalChunk: number) {
        if (workspace.plan === "PAY_AS_YOU_GO") {
            return true;
        }

        // Gunakan format key harian agar otomatis terisolasi per hari
        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        const key = `request:embedding:${workspace.id}:${today}`;
        const LIMIT = 10;

        const totalRequest = (await this.cacheManager.get<number>(key)) || 0;

        // Cek apakah kuota sudah habis SEBELUM menambah
        if ((totalRequest + totalChunk) >= LIMIT) {
            return false; // Kuota habis!
        }

        // Langsung UPDATE (Increment) angkanya & set TTL 24 jam (86400000 ms di cache-manager v5+)
        const nextRequest = totalRequest + totalChunk;
        await this.cacheManager.set(key, nextRequest, 86400 * 1000);

        return true;
    }
    async prosesChunksAndEmebdding(workspaceId: string, modelEmbedding: AIModel | null, chunks: string[], { size, originalname, type }) {
        if (!modelEmbedding) {
            throw new NotFoundException("Model not found");
        }
        if (!modelEmbedding.isEmbedding) {
            throw new BadRequestException("Model ini tidak menyediakan embeddings.");
        }
        const knowledge = await this.prisma.knowledge.create({
            data: {
                size: size,
                name: originalname,
                totalChunk: chunks.length,
                modelName: modelEmbedding.name,
                type: type ?? "text",
                status: "PROCESSING",
                workspaceId: workspaceId,
            }
        });
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms * 1000));
        const batchSize = 10;
        for (let i = 0; i < chunks.length; i += batchSize) {
            const batch = chunks.slice(i, i + batchSize);
            const results = await Promise.all(batch.map(async (chunk) => {
                const vector = await this.prosesTransformToVector(modelEmbedding, chunk);
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
                        ${workspaceId},
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
        return {
            knowledge
        }
    }
    async createKnowledgeItems(workspaceId: string, knowledgeId: string, chunks: string[], model: AIModel, plan: PlanType) {
        const dataKnowledgeItems: Prisma.KnowledgeItemCreateManyInput[] = chunks.map(chunk => ({
            knowledgeId: knowledgeId,
            workspaceId: workspaceId,
            content: chunk
        }));

        await this.prisma.knowledgeItem.createMany({
            data: dataKnowledgeItems
        });

        const jobs = chunks.map((_, index) => ({
            name: "embedding",
            data: {
                workspaceId,
                knowledgeId,
                index,
                model: model,
                plan: plan
            },
            opts: {
                // Pasang retry backoff agar otomatis mencoba ulang jika kena 429 Rate Limit
                attempts: 5,
                backoff: {
                    type: 'exponential',
                    delay: 12000, // Coba ulang dengan jeda 3s, 6s, 12s...
                },
                removeOnComplete: true, // Hapus job dari Redis jika selesai agar RAM tetap hemat
                removeOnFail: { age: 86400 } // Simpan job gagal selama 24 jam untuk debugging
            }
        }));

        await this.queueKnowledge.addBulk(jobs);

        return {
            message: "Proses embedding berhasil dimasukkan ke antrean",
            totalChunks: chunks.length
        };
    }
    async prosesTransformToVector(modelEmbedding: AIModel, rawText: string) {
        let vector: number[] = [];
        switch (modelEmbedding.provider) {
            case "GOOGLE":
                vector = await this.gemini.embeddingsGemini(modelEmbedding.modelCode, rawText);
                break;
            case "OPENAI":
                const responseOpenai = await this.openai.embeddings(modelEmbedding.modelCode, rawText);
                vector = responseOpenai.vector;
                break;
            default:
                throw new BadRequestException(`Maaf provider ${modelEmbedding.provider} belum tersedia di system kami.`);
        }

        return vector;
    }

    async sterilizedFile(file: Express.Multer.File) {
        let rawText = '';
        let chunks: string[] = [];

        const mimetype = file.mimetype;
        let type = "txt";

        if (mimetype === 'application/pdf') {
            const pdfData = await pdf(file.buffer);
            rawText = pdfData.text;
            type = "pdf";
        }
        else if (mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || mimetype === 'application/vnd.ms-excel') {
            const workbook = XLSX.read(file.buffer, { type: 'buffer' });
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
            rawText = file.buffer.toString('utf-8');
            type = "txt";
        }
        else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimetype === 'application/msword') {
            const result = await mammoth.extractRawText({ buffer: file.buffer });
            rawText = result.value;
            type = "docx";
        }
        else {
            throw new BadRequestException("Format file tidak didukung (Gunakan PDF, Excel, atau TXT)");
        }

        chunks = this.chunking(rawText);

        return {
            rawText,
            chunks,
            type
        }
    }

    chunking(rawText: string, chunkSize = 900, chunkOverlap = 200) {
        let chunks: string[] = [];
        if (rawText && rawText.trim()) {
            chunks = this.splitText(rawText, chunkSize, chunkOverlap);
        }
        return chunks;
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

    async getChunks(workspaceId: string, message: string, modelEmbedding: AIModel | null) {
        if (!modelEmbedding) {
            throw new BadRequestException("Model not found");
        }
        let messageVector: number[] = [];
        switch (modelEmbedding.provider) {
            case "GOOGLE":
                messageVector = await this.gemini.embeddingsGemini(modelEmbedding.modelCode, message);
                break;
            case "OPENAI":
                const responseOpenai = await this.openai.embeddings(modelEmbedding.modelCode, message);
                messageVector = responseOpenai.vector;
                break;
            default:
                throw new BadRequestException(`Maaf provider ${modelEmbedding.provider} belum tersedia di system kami.`);
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

    private sterilizeString(text: string): string {
        return sanitizeHtml(text, {
            allowedTags: [],       // Kosongkan untuk menghapus SEMUA tag HTML
            allowedAttributes: {}, // Hapus semua atribut HTML
        }).trim();
    }

    private sanitizeData<T>(data: T): T {
        if (typeof data === 'string') {
            return this.sterilizeString(data) as T;
        }

        if (Array.isArray(data)) {
            return data.map((item) => this.sanitizeData(item)) as T;
        }

        if (typeof data === 'object' && data !== null) {
            const sanitizedObj: Record<string, any> = {};
            for (const [key, value] of Object.entries(data)) {
                sanitizedObj[key] = this.sanitizeData(value);
            }
            return sanitizedObj as T;
        }

        return data;
    }

    /**
     * Fetch data dari URL dan sterilkan seluruh isinya secara aman
     */
    async fetchDataAndSterilize<T = any>(url: string): Promise<T | null> {
        try {
            const response = await fetch(url, {
                headers: {
                    // Beritahu server bahwa kita memprioritaskan JSON
                    'Accept': 'application/json, text/html, text/plain',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', // Mencegah diblokir Wikipedia
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type') || '';

            // 1. Jika kembaliannya adalah JSON
            if (contentType.includes('application/json')) {
                const rawData = await response.json();
                return this.sanitizeData<T>(rawData);
            }

            // 2. Jika kembaliannya adalah HTML / Teks biasa (Misal Wikipedia)
            const rawText = await response.text();
            return this.sanitizeData<T>(rawText as T);

        } catch (error) {
            console.error(`[ApiService] Terjadi kesalahan saat fetch dari ${url}:`, error);
            throw error;
        }
    }

    getTextSizeBytes(text: string): { bytes: number; kb: string; mb: string } {
        const bytes = Buffer.byteLength(text, 'utf-8');

        const kb = (bytes / 1024).toFixed(2);
        const mb = (bytes / (1024 * 1024)).toFixed(4);

        return { bytes, kb: `${kb} KB`, mb: `${mb} MB` };
    }

    cleanTextSpacing(text: string): string {
        return text.replace(/\s+/g, ' ').trim();
    }

    convertToVectorInput(data: any): string {
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
}