import { BadRequestException, ForbiddenException, Inject, Injectable, Logger, NotFoundException, OnModuleInit } from "@nestjs/common";
import { makeWASocket, DisconnectReason, useMultiFileAuthState, jidNormalizedUser, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } from '@whiskeysockets/baileys';
import pino from 'pino';
import QRCodeNode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { PrismaService } from "../../../lib/prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
import { CACHE_RAM_QR_CODE, CACHE_RAM_SOCK_SESSION } from "@library/constant/constant-cache";
import { StatusIntegration } from "@prisma/client";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { WhatsappBayliesSetting } from "@library/types";
import NodeCache from 'node-cache';



@Injectable()
export class WhatsappGatewayService implements OnModuleInit {

    private readonly logger = new Logger(WhatsappGatewayService.name);
    private statusInstance: Record<string, StatusIntegration> = {};
    private whatsappSecret = "";
    private phoneNumbers: Record<string, string> = {};

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
        @InjectQueue("message-queue") private readonly incomingQueue: Queue
    ) { }

    async onModuleInit() {
        this.whatsappSecret = this.configService.get<string>("SECRET_WHATSAPP") || "doweweipwip1ip29120190xkjwqowoqi";
        this.logger.log('Inisialisasi WhatsappService...');
        const getInstances = await this.prisma.integration.findMany({
            where: { platform: "WHATSAPP_BAYLIES" },
        });
        for (const instance of getInstances) {
            this.logger.log(`Membuka instance WhatsApp: ${instance.instanceName}`);
            await this.createInstance(instance.workspaceId, instance.instanceName, instance.settings as WhatsappBayliesSetting | null);
        }
    }

    async updateIntegration(instanceName: string, phoneNumber?: string, status?: StatusIntegration) {
        try {
            const statusDevice = this.statusInstance[instanceName];
            if (statusDevice == status) return;
            const existingDevice = await this.prisma.integration.findUnique({
                where: { instanceName: instanceName }
            });

            if (!existingDevice) {
                this.logger.error(`❌ Gagal update: Device dengan instance [${instanceName}] tidak ditemukan di DB.`);
                return;
            }

            await this.prisma.integration.update({
                where: { id: existingDevice.id },
                data: {
                    status,
                    number: phoneNumber
                }
            });
            this.statusInstance[instanceName] = status || "DISCONNECTED";

        } catch (error: any) {
            this.logger.error(`Gagal update: ${error?.message}`);
        }
    }
    async createInstance(workspaceId: string, instanceName: string, settings: WhatsappBayliesSetting | null) {
        const authFolder = path.join('/', 'var', 'berry', 'whatsapp_baileys', `auth_info_baileys_${instanceName}`);
        if (!fs.existsSync(authFolder)) {
            fs.mkdirSync(authFolder, { recursive: true });
            console.log(`📁 Folder auth berhasil dibuat di: ${authFolder}`);
        }

        const { state, saveCreds } = await useMultiFileAuthState(authFolder);
        const { version } = await fetchLatestBaileysVersion();

        const msgRetryCounterCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });
        const groupCache = new NodeCache({ stdTTL: 5 * 60, checkperiod: 30 });

        const sock = makeWASocket({
            pushName: "Berry Sweet",
            browser: ["BerrySweet", "Chrome", "1.0.0"],
            version,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
            },
            printQRInTerminal: false,
            connectTimeoutMs: 60000,
            defaultQueryTimeoutMs: 0,
            logger: pino({ level: 'silent' }),
            shouldSyncHistoryMessage: () => false,

            // OPTIMASI RAM TAMBAHAN:
            msgRetryCounterCache, // Mencegah retries menumpuk di RAM
            cachedGroupMetadata: async (jid) => groupCache.get(jid), // Cache metadata grup dengan TTL
            syncFullHistory: false, // Memastikan tidak menarik history chat lama
            generateHighQualityLinkPreview: false, // Matikan render preview link berat
        });
        sock.ev.on('creds.update', saveCreds);

        // event update connection
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            // Ambil status & phone number eksisting dari RAM/State
            let status: StatusIntegration = this.statusInstance[instanceName] ?? "CONNECTING";
            let phoneNumber: string | null = this.phoneNumbers[instanceName] ?? null;

            if (qr) {
                this.logger.log(`[${instanceName}] QR Code baru digenerate, perbarui di RAM.`);
                CACHE_RAM_QR_CODE[instanceName] = qr;
                status = "CONNECTING";
            }

            if (connection === 'open') {
                this.logger.log(`🚀 [${instanceName}] Berhasil terhubung! Menghapus data QR dari memori.`);
                CACHE_RAM_QR_CODE[instanceName] = null;

                // PASTIKAN SOCKET DISIMPAN KE RAM KETIKA OPEN
                CACHE_RAM_SOCK_SESSION[instanceName] = sock;

                // Ambil Nomor Telepon & Simpan di State Memory
                phoneNumber = sock.user?.phoneNumber || (sock.user?.id ? jidNormalizedUser(sock.user.id).split("@")[0] : null);
                this.phoneNumbers[instanceName] = phoneNumber ?? "";

                status = "CONNECTED";
            }
            else if (connection === 'close') {
                const lastDisconnectError = lastDisconnect?.error as any;
                const statusCode = lastDisconnectError?.output?.statusCode;
                const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

                this.logger.warn(`🛑 [${instanceName}] Koneksi terputus dengan status: ${statusCode}. Menyambung kembali: ${shouldReconnect}`);

                // Hapus socket dari RAM agar sendMessage tidak memanggil socket mati ini
                delete CACHE_RAM_SOCK_SESSION[instanceName];
                delete CACHE_RAM_QR_CODE[instanceName];

                try {
                    sock.ev.removeAllListeners('connection.update');
                    sock.ev.removeAllListeners('creds.update');
                    // Gunakan ws.close() untuk memastikan socket benar-benar mati sebelum buat instance baru
                    sock.ws?.close();
                    sock.end(undefined);
                } catch (e) {
                    // Ignore jika socket sudah hancur
                }

                status = "DISCONNECTED";

                if (shouldReconnect) {
                    this.logger.log(`🔄 [${instanceName}] Membuka instance baru dalam 2 detik...`);
                    // Beri jeda 2 detik agar port/resources socket lama benar-benar dilepas oleh OS
                    setTimeout(async () => {
                        await this.createInstance(workspaceId, instanceName, settings);
                    }, 2000);
                } else {
                    this.logger.error(`❌ [${instanceName}] Perangkat keluar (Logged Out).`);
                    try {
                        await this.deleteInstance(this.whatsappSecret, instanceName);
                        await this.createInstance(workspaceId, instanceName, settings);
                        this.logger.log(`🗑️ [${instanceName}] Folder sesi lama berhasil dihapus bersih. Siap untuk QR baru!`);
                    } catch (error) {
                        this.logger.error(`⚠️ Gagal menghapus folder sesi [${instanceName}]:`, error);
                    }
                }
            }

            // UPDATE QUEUE STATUS
            // Kirim event perubahan status ke BullMQ jika status berubah
            if ((this.statusInstance[instanceName] !== status)) {
                await this.incomingQueue.add("update-integration", { instanceName, phoneNumber, status }, { removeOnComplete: true });
            }
        });
        // event pesan masuk
        sock.ev.on('messages.upsert', async (m) => {
            if (m.type !== 'notify') return;
            for (const msg of m.messages) {
                if (msg.key.remoteJid === 'status@broadcast') return;
                if (!msg.key.fromMe) {
                    const remote = msg.key.remoteJidAlt;
                    // const isBlocked = await this.cacheManager.get<boolean>(`block-${remote}`);
                    // if (isBlocked) return;

                    await this.incomingQueue.add("process-incoming-msg", {
                        instanceName,
                        workspaceId,
                        to: remote,
                        message: msg,
                    }, {
                        removeOnComplete: true,
                        attempts: 3
                    });
                    //await sock.sendPresenceUpdate("paused", remote);
                }
            }
        });
        // sock.ev.on('messages.update', async (m) => {
        //     console.log('Messages Update:', m); // Debug log untuk melihat detail pembaruan pesan
        // });
        // sock.ev.on('messages.delete', async (m) => {
        //     console.log('Messages Delete:', m); // Debug log untuk melihat detail pesan yang dihapus
        // });
        // sock.ev.on('presence.update', async (m) => {
        //     console.log('Presence Update:', m); // Debug log untuk melihat detail pembaruan status kehadiran
        // });
        // sock.ev.on('chats.update', (m) => {
        //     console.log('Chats Update:', m); // Debug log untuk melihat detail pembaruan obrolan
        // });
        // sock.ev.on('contacts.update', (m) => {
        //     console.log('Contacts Update:', m); // Debug log untuk melihat detail pembaruan kontak
        // });
    }

    validateSecret(secret: string) {
        if (!secret || this.whatsappSecret !== secret) {
            throw new ForbiddenException("You not allowed");
        }
        return true;
    }

    async handleCreate(secretKey: string, workspaceId: string, instanceName: string) {
        this.validateSecret(secretKey);
        try {
            const integration = await this.prisma.integration.findFirst({
                where: { workspaceId, instanceName }
            });
            if (!integration) {
                throw new NotFoundException("Device tidak ditemukan");
            }
            await this.createInstance(workspaceId, instanceName, (integration as any).settings as WhatsappBayliesSetting);
            return {
                message: "successfully Create instance whatsapp baileys"
            }
        } catch (err) {
            throw new BadRequestException("Failed Create Instance Whatsapp Bailyes")
        }
    }


    async getQrCode(secret: string, instanceName: string): Promise<{ base64: string, code: string } | null> {
        this.validateSecret(secret);
        const qrCode = CACHE_RAM_QR_CODE[instanceName];
        if (qrCode) {
            this.logger.log(`QR Code untuk instance [${instanceName}] ditemukan di RAM.`);
            const qrBase64 = await QRCodeNode.toDataURL(qrCode);
            return {
                base64: qrBase64,
                code: qrCode,
            }
        } else {
            this.logger.warn(`QR Code untuk instance [${instanceName}] tidak ditemukan di RAM.`);
            throw new NotFoundException("Qrcode not found");
        }
    }

    async deleteInstance(secret: string, instanceName: string): Promise<boolean> {
        this.validateSecret(secret);
        const sock = CACHE_RAM_SOCK_SESSION[instanceName];
        if (sock) {
            try {
                await sock.logout();
            } catch (error) {
                this.logger.warn(`⚠️ [${instanceName}] Gagal logout secara jaringan (Connection Closed). Melanjutkan pembersihan lokal...`);
            }
        }
        delete CACHE_RAM_SOCK_SESSION[instanceName];
        const pathname = path.join('/', 'var', 'berry', 'whatsapp_baileys', `auth_info_baileys_${instanceName}`);
        if (fs.existsSync(pathname)) {
            try {
                fs.rmSync(pathname, { recursive: true, force: true });
                this.logger.log(`🗑️ Data autentikasi untuk instance [${instanceName}] telah dihapus dari disk.`);
            } catch (fileError: any) {
                this.logger.error(`❌ Gagal menghapus folder ${pathname}: ${fileError.message}`);
            }
        }

        this.logger.log(`✅ Instance [${instanceName}] telah dibersihkan sepenuhnya.`);
        return true;
    }
} 