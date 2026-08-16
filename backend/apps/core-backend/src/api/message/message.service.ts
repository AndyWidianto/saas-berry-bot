import { PrismaService } from "../../../../lib/prisma/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { SendMessageDto } from "@library/dto/message.dto";
import { WhatsappGatewayService } from "@library/whatsapp.gateway/whatsapp.gateway.service";


interface Stat {
    label: string;
    count: number;
}
@Injectable()
export class MessageService {
    constructor(
        private prisma: PrismaService,
        private whatsappGatewayService: WhatsappGatewayService
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

    async sendMessage(workspaceId: string, data: SendMessageDto) {
        const existing = await this.prisma.integration.findFirst({
            where: { workspaceId }
        });
        if (!existing) {
            throw new NotFoundException("Workspace not found");
        }
        if (data.type === "text") {
            await this.whatsappGatewayService.sendMessage(workspaceId, existing.instanceName, data);
        }
        // const message = await this.prisma.message.create({
        //     data: {
        //         content: data.message,
        //         fromMe: true,
        //         platform: existing.platform,
        //         type: "text",
        //         ""
        //     }
        // })
        return {
            message: "Successfully",
            data: data
        };
    }
}