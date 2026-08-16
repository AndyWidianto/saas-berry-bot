import { PrismaService } from "@library/prisma/prisma.service";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { Message } from "@prisma/client";
import { Job } from "bullmq";



@Processor("queue-chatbot-api")
export class ChatbotProcessor extends WorkerHost {
    private readonly logger = new Logger();

    constructor(
        private prisma: PrismaService
    ) {
        super();
    }
    async process(job: Job, token?: string): Promise<any> {
        this.logger.log(`[Job ${job.id}] Processing job: ${job.name}`);
        const data = job.data;

        try {
            switch (job.name) {
                case "create-message":
                    await this.handleCreateMessage(data as Message);
                    break;

                case "create-many-credit-ledger":
                    const ledgerData = Array.isArray(data) ? data : [data];
                    await this.prisma.creditLedger.createMany({
                        data: ledgerData,
                        skipDuplicates: true,
                    });
                    break;

                case "create-ailog":
                    await this.prisma.aiLog.create({
                        data,
                    });
                    break;

                default:
                    this.logger.warn(`[Job ${job.id}] Unknown job name: ${job.name}`);
                    break;
            }
        } catch (error: any) {
            this.logger.error(
                `[Job ${job.id}] Failed to process ${job.name}: ${error.message}`,
                error.stack,
            );
            throw error;
        }
    }

    async handleCreateMessage(data: Message) {
        const newMessage = await this.prisma.message.create({
            data
        });
        return newMessage;
    }
}