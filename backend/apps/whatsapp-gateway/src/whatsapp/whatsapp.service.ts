import { PrismaService } from "@library/prisma/prisma.service";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, Logger, NotFoundException, OnModuleInit } from "@nestjs/common";
import { AIModel, Message, Prisma, Workspace, WorkspaceBalance } from "@prisma/client";
import { WAMessage, WAPresence } from "@whiskeysockets/baileys";
import type { Cache } from "cache-manager";
import type { KnowledgeChunk } from "@library/types";
import { GeminiService } from "@library/agent/gemini.service";
import { CACHE_RAM_SOCK_SESSION } from "@library/constant/constant-cache";
import { MessageTextDto } from "@library/dto/message.dto";
import axios from "axios";
import { ConfigService } from "@nestjs/config";
import { Content } from "@google/generative-ai";



type WorkspaceWithModels = Prisma.WorkspaceGetPayload<{
    include: {
        chatModel: true;
        embeddingModel: true;
        workspaceBalances: true;
    };
}>;
@Injectable()
export class WhatsappService implements OnModuleInit {
    private readonly logger = new Logger(WhatsappService.name);
    private whatsappSecret = "";
    constructor(
        private prisma: PrismaService,
        private gemini: GeminiService,
        private configService: ConfigService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }

    onModuleInit() {
        this.whatsappSecret = this.configService.get<string>("SECRET_WHATSAPP") || "doweweipwip1ip29120190xkjwqowoqi";
    }

    async sendMessage(secret: string, { instanceName, to, text }: MessageTextDto): Promise<void> {
        const sock = CACHE_RAM_SOCK_SESSION[instanceName];
        if (!sock) {
            throw new NotFoundException(`Instance [${instanceName}] tidak aktif.`);
        }
        const formattedPhone = to.includes('@s.whatsapp.net') ? to : `${to}@s.whatsapp.net`;

        try {
            await sock.sendMessage(formattedPhone, { text });
        } catch (error) {
            this.logger.error(`Gagal mengirim pesan ke ${to}`, error);
        }
    }

    async sendMedia(instanceName: string, to: string, imageUrl: string, caption?: string): Promise<void> {
        const sock = CACHE_RAM_SOCK_SESSION[instanceName];
        if (!sock) throw new NotFoundException(`Instance [${instanceName}] tidak aktif.`);

        const formattedPhone = to.includes('@s.whatsapp.net') ? to : `${to}@s.whatsapp.net`;

        try {
            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data, 'binary');

            await sock.sendMessage(formattedPhone, {
                image: buffer,
                mimetype: 'image/jpeg',
                caption: caption, // Opsional
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: false
                }
            });

        } catch (error) {
            this.logger.error(`Gagal mengirim media ke ${to}`, error);
        }
    }

    async precenceUpdate(instanceName: string, status: WAPresence, to: string) {
        const sock = CACHE_RAM_SOCK_SESSION[instanceName];
        if (!sock) throw new NotFoundException(`Instance [${instanceName}] tidak aktif.`);
        const formattedPhone = to.includes('@s.whatsapp.net') ? to : `${to}@s.whatsapp.net`
        try {
            sock.sendPresenceUpdate(status, formattedPhone);
        } catch (error) {
            this.logger.error(`Gagal update status:`, error);
        }
    }
}

