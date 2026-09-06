import { PrismaService } from "../../../../lib/prisma/prisma.service";
import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CreateMessageDto, MessageMediaDto, MessageTextDto, SendMessageDto } from "@library/dto/message.dto";
import { WhatsappGatewayService } from "@library/whatsapp.gateway/whatsapp.gateway.service";
import { PayloadJWT } from "@library/types";
import { WorkspaceService } from "../workspace/workspace.service";
import { Message, PlatformType, Prisma } from "@prisma/client";
import { GetQueryDto } from "@library/dto/query.dto";
import { StorageService } from "@library/storage/storage.service";
import { ContactService } from "../contact/contact.service";
import { ConfigService } from "@nestjs/config";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Queue } from "bullmq";
import { InjectQueue } from "@nestjs/bullmq";


interface Stat {
    label: string;
    count: number;
}
@Injectable()
export class MessageService {
    constructor(
        private prisma: PrismaService,
        private whatsappGatewayService: WhatsappGatewayService,
        private workspaceService: WorkspaceService,
        private storageService: StorageService,
        private contactService: ContactService,
        private configService: ConfigService,
        @InjectQueue("whatsapp-outgoing-queue") private messageQueue: Queue,
    ) { }

    // async create(data: CreateMessage) {
    //     const number = data.remoteJid.split("@")[0];
    //     const receiver = {
    //         name: data.pushName,
    //         number: number,
    //         message: data.content
    //     }
    //     this.gatewat.server.emit("receiver_message", receiver);
    //     const message = await this.prisma.message.create({
    //         data: { ...data }
    //     });
    //     console.log(message);
    //     return message;
    // }

    async Stats() {
        const stats: Stat[] = [];
        const now = new Date();

        // Loop untuk 7 hari terakhir (termasuk hari ini)
        for (let i = 6; i >= 0; i--) {
            const startOfDay = new Date(now);
            startOfDay.setDate(now.getDate() - i);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(now);
            endOfDay.setDate(now.getDate() - i);
            endOfDay.setHours(23, 59, 59, 999);

            // Hitung jumlah pesan di hari tersebut
            const count = await this.prisma.message.count({
                where: {
                    createdAt: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                },
            });

            // Format tanggal untuk label ApexCharts (contoh: "29 Apr")
            const label = startOfDay.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
            });

            stats.push({ label, count });
        }

        return {
            labels: stats.map(s => s.label),
            data: stats.map(s => s.count),
        };
    }

    private getInstanceNameFilter(platform: PlatformType): Prisma.StringFilter | undefined {
        if (platform === "TELEGRAM") {
            return {
                contains: "TELEGRAM",
                mode: "insensitive"
            }
        }
        if (platform === "WHATSAPP_BAYLIES") {
            return {
                contains: "WHATSAPP_BAYLIES",
                mode: "insensitive"
            }
        }
        return undefined;
    }
    async sendMessage(user: PayloadJWT, workspaceId: string, data: CreateMessageDto) {
        await this.workspaceService.validateRoleWorkspace(workspaceId, user.id);
        const instanceName = this.getInstanceNameFilter(data.platform);
        const existing = await this.prisma.integration.findFirst({
            where: {
                workspaceId,
                instanceName: instanceName
            }
        });
        if (!existing) {
            throw new NotFoundException("Workspace not found");
        }
        const contact = await this.prisma.contact.upsert({
            where: {
                workspaceId_senderId: {
                    workspaceId: workspaceId,
                    senderId: data.senderId,
                },
            },
            create: {
                workspaceId: workspaceId,
                name: data.senderName,
                unreadCount: 0,
                senderId: data.senderId,
                lastActiveAt: new Date(),
                lastMessage: data.content,
                lastMessageAt: new Date(),
            },
            update: {
                lastActiveAt: new Date(),
                lastMessageAt: new Date(),
                unreadCount: 0,
                lastMessage: data.content
            }
        })
        const message = await this.prisma.message.create({
            data: {
                ...data,
                status: "sent",
                workspaceId,
                contactId: contact.id,
            }
        })
        if (data.platform === "WHATSAPP_BAYLIES") {
            await this.sendMessageToWhatsappBaylies(workspaceId, existing.instanceName, message);
        }
        if (data.platform === "TELEGRAM") {

        }
        return {
            message: "Successfully",
            data: message
        };
    }


    async getMessages(user: PayloadJWT, workspaceId: string, contactId: string, { limit, cursor }: GetQueryDto) {
        await this.workspaceService.validateRoleWorkspace(workspaceId, user.id);
        const take = limit ? limit : 20;
        const query: Prisma.MessageFindManyArgs = {
            where: { workspaceId, contactId },
            ...(cursor ? {
                cursor: { id: cursor },
                skip: 1
            }: {}),
            take: take,
            orderBy: {
                createdAt: "desc"
            }
        }
        const [messages, totalMessages] = await this.prisma.$transaction([
            this.prisma.message.findMany(query),
            this.prisma.message.count({
                where: query.where
            })
        ]);
        const nextId = messages.length > 0 ? messages[messages.length - 1].id : null;
        const sortMessages = [...messages].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        return {
            data: sortMessages,
            totalPage: Math.ceil(totalMessages / take),
            total: totalMessages,
            nextId: nextId
        }
    }

    async uploadFile(user: PayloadJWT, workspaceId: string, file: Express.Multer.File) {
        await this.workspaceService.validateRoleWorkspace(workspaceId, user.id);
        if (!file) {
            throw new BadRequestException("File is required");
        }
        const storage = await this.storageService.uploadFile(file);
        const baseUrlBackend = this.configService.get<string>("BASE_URL_BACKEND");
        return {
            ...storage,
            url: `${baseUrlBackend?.endsWith("/") ? baseUrlBackend.slice(0, -1) : baseUrlBackend}${storage.url}`
        }
    }

    private async sendMessageToWhatsappBaylies(workspaceId: string, instanceName: string, message: Message) {
        if (message.type === "image" || message.type === "document") {
            await this.messageQueue.add("send-media", {
                caption: message.content,
                to: message.senderId,
                imageUrl: message.mediaUrl,
                instanceName: instanceName
            } as MessageMediaDto);
            return;
        }
        await this.messageQueue.add("send-message", {
            instanceName,
            to: message.senderId,
            text: message.content
        } as MessageTextDto);
    }
}