import { BadRequestException, Inject, Injectable, Logger, NotFoundException, OnModuleInit } from "@nestjs/common";
import { WAMessage, WAMessageKey, WAPresence } from "@whiskeysockets/baileys";
import { CACHE_RAM_SOCK_SESSION } from "@library/constant/constant-cache";
import { MessageMediaDto, MessageTextDto } from "@library/dto/message.dto";
import axios from "axios";
import { ConfigService } from "@nestjs/config";


@Injectable()
export class WhatsappService implements OnModuleInit {
    private readonly logger = new Logger(WhatsappService.name);
    private whatsappSecret = "";
    constructor(
        private configService: ConfigService,
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

    async sendMedia(secret: string, { to, imageUrl, caption, instanceName }: MessageMediaDto): Promise<void> {
        if (secret !== this.whatsappSecret) {
            throw new BadRequestException("invalid secret.")
        };
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

