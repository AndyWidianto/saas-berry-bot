import { BadRequestException, Inject, Injectable, Logger, NotFoundException, OnModuleInit } from "@nestjs/common";
import { WAMessage, WAMessageKey, WAPresence } from "@whiskeysockets/baileys";
import { CACHE_RAM_SOCK_SESSION } from "@library/constant/constant-cache";
import { MessageMediaDto, MessageTextDto } from "@library/dto/message.dto";
import axios from "axios";
import { ConfigService } from "@nestjs/config";
import { StorageService } from "@library/storage/storage.service";


@Injectable()
export class WhatsappService implements OnModuleInit {
    private readonly logger = new Logger(WhatsappService.name);
    private whatsappSecret = "";
    constructor(
        private configService: ConfigService,
        private readonly storage: StorageService
    ) { }

    onModuleInit() {
        this.whatsappSecret = this.configService.get<string>("SECRET_WHATSAPP") || "doweweipwip1ip29120190xkjwqowoqi";
    }

    async sendMessage(secret: string, { instanceName, to, text }: MessageTextDto): Promise<void> {
        if (secret !== this.whatsappSecret) {
            throw new BadRequestException("invalid secret.")
        };
        console.log("instanceName: ", instanceName);
        const sock = CACHE_RAM_SOCK_SESSION[instanceName];
        if (!sock) {
            throw new NotFoundException(`Instance [${instanceName}] tidak aktif.`);
        }
        const formattedPhone = to.includes('@s.whatsapp.net') ? to : `${to}@s.whatsapp.net`;

        try {
            await sock.sendMessage(formattedPhone, { text });
        } catch (error) {
            this.logger.error(`Gagal mengirim pesan ke ${formattedPhone}`, error);
        }
    }

    async sendMedia(secret: string, { to, imageUrl, caption, instanceName, thumbnail }: MessageMediaDto): Promise<void> {
        if (secret !== this.whatsappSecret) {
            throw new BadRequestException("invalid secret.")
        };
        const sock = CACHE_RAM_SOCK_SESSION[instanceName];
        if (!sock) throw new NotFoundException(`Instance [${instanceName}] tidak aktif.`);

        const formattedPhone = to.includes('@s.whatsapp.net') ? to : `${to}@s.whatsapp.net`;

        try {
            let downloadImage = imageUrl;

            // Jika thumbnail berupa key/path Cloudflare R2, ambil Presigned URL-nya
            if (thumbnail) {
                downloadImage = await this.storage.cloudflareGetPresignedUrl(thumbnail);
            }

            // Download file gambar dari URL
            const response = await axios.get<ArrayBuffer>(downloadImage, {
                responseType: 'arraybuffer'
            });

            // Konversi ArrayBuffer langsung ke Node.js Buffer (tanpa argumen 'binary')
            const buffer = Buffer.from(response.data);
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

    async readMessage(instanceName: string, data: WAMessageKey) {
        const sock = CACHE_RAM_SOCK_SESSION[instanceName];
        if (!sock) throw new NotFoundException(`Instance [${instanceName}] tidak aktif.`);
        try {
            sock.readMessages([data])
        } catch (error) {
            this.logger.error(`Gagal update status:`, error);
        }
    }
    async precenceUpdate(instanceName: string, status: WAPresence, to: string) {
        if (!to) return;
        const sock = CACHE_RAM_SOCK_SESSION[instanceName];
        if (!sock) throw new NotFoundException(`Instance [${instanceName}] tidak aktif.`);
        const formattedPhone = to.includes('@s.whatsapp.net') ? to : `${to}@s.whatsapp.net`
        try {
            await sock.sendPresenceUpdate(status, formattedPhone);
            await new Promise((resolve) => setTimeout(resolve, 1000 * 3));
        } catch (error) {
            this.logger.error(`Gagal update status:`, error);
        }
    }
}

