import { GeminiService } from "@library/agent/gemini.service";
import { OpenaiService } from "@library/agent/openai.service";
import { BillingService } from "@library/billing/billing.service";
import { PrismaService } from "@library/prisma/prisma.service";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger, NotFoundException } from "@nestjs/common";
import { AIModel, PlanType } from "@prisma/client";
import { Job } from "bullmq";



@Processor("queue-knowledge-base")
export class KnowledgeProcessor extends WorkerHost {
    private logger = new Logger();
    constructor(
        private gemini: GeminiService,
        private openai: OpenaiService,
        private prisma: PrismaService,
        private billingService: BillingService
    ) {
        super();
    }

    async process(job: Job, token?: string): Promise<any> {
        const data = job.data;

        switch (job.name) {
            case "embedding":
                await this.handleEmbedding(data);
                break;
        }
    }

    async handleEmbedding(data: {
        workspaceId: string;
        knowledgeId: string;
        index: number;
        model: AIModel;
        plan: PlanType;
        filename: string;
    }) {
        const { workspaceId, knowledgeId, index, model, filename } = data;

        try {
            const item = await this.prisma.knowledgeItem.findFirst({
                where: {
                    knowledgeId: knowledgeId,
                    workspaceId: workspaceId,
                    // Jika belum ada kolom index, pastikan query mengambil item yang sesuai
                },
                // Opsional: skip & take jika Anda  mengandalkanoffset alih-alih kolom index
                skip: index,
                take: 1,
                orderBy: {
                    id: "asc"
                }
            });

            if (!item) {
                this.logger.warn(`Item chunk tidak ditemukan untuk Knowledge ID ${knowledgeId} pada index ${index}`);
                return;
            }

            let vector: number[] = [];
            if (model.provider === "OPENAI") {
                const responseOpenai = await this.openai.embeddings(model.modelCode, item.content);
                vector = responseOpenai.vector;
            }
            if (model.provider === "GOOGLE") {
                vector = await this.gemini.embeddingsGemini(model.modelCode, item.content);
            }
            const vectorStr = `[${vector.join(',')}]`;

            await this.prisma.$executeRaw`
                UPDATE "knowledge_items"
                SET 
                    "embedding" = ${vectorStr}::vector,
                    "updated_at" = NOW()
                WHERE "id" = ${item.id}
            `;

            if (data.plan !== "FREE") {
                const totalCost = await this.billingService.totalCostInput("", item.content, model);
                await this.updateBalanceAndCreateCreditLedger(workspaceId, totalCost.totalCost, filename);
            }
            await this.checkAndCompleteKnowledge(knowledgeId);

            return { success: true, itemId: item.id };

        } catch (err: unknown) {
            this.logger.error(`Gagal memproses embedding chunk index ${index} untuk Knowledge ${knowledgeId}:`, err);

            // Melempar error agar BullMQ mendeteksi kegagalan dan memicu Retry / Backoff
            throw err;
        }
    }

    private async updateBalanceAndCreateCreditLedger(workspaceId: string, totalCost: number, filename: string) {
        const [_workspaceBalance] = await this.prisma.$transaction([
            this.prisma.workspaceBalance.update({
                where: { workspaceId },
                data: {
                    amount: {
                        decrement: totalCost
                    }
                }
            }),
            this.prisma.creditLedger.create({
                data: {
                    amount: -totalCost,
                    type: "USAGE_RAG",
                    workspaceId,
                    description: `Melakukan embedding file ${filename}`
                }
            })
        ])
    }

    private async checkAndCompleteKnowledge(knowledgeId: string) {
        const result = await this.prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*)::bigint FROM "knowledge_items"
        WHERE "knowledgeId" = ${knowledgeId} AND "embedding" IS NULL
    `;

        const remainingUnprocessed = Number(result[0]?.count || 0);

        if (remainingUnprocessed === 0) {
            await this.prisma.knowledge.update({
                where: { id: knowledgeId },
                data: { status: "INDEXED" }
            });
            this.logger.log(`Knowledge ID ${knowledgeId} selesai diproses seluruhnya.`);
        }
    }
}