import { EventGateway } from "@core/event/event.gateway";
import { NotificationAction } from "@library/dto/notification.dto";
import { NotificationSettingType } from "@library/dto/workspace.dto";
import { NodemailerService } from "@library/nodemailer/nodemailer.service";
import { PrismaService } from "@library/prisma/prisma.service";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Logger } from "@nestjs/common";
import { AIModel, Message, Prisma, StatusIntegration } from "@prisma/client";
import { Job } from "bullmq";
import type { Cache } from "cache-manager";




@Processor("notification-queue")
export class QueueNotificationProcessor extends WorkerHost {
    private logger = new Logger();
    private userIds: Record<string, string> = {};
    constructor(
        private prisma: PrismaService,
        private nodemailer: NodemailerService,
        private eventGateway: EventGateway,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {
        super();
    }
    async process(job: Job, token?: string): Promise<any> {
        this.logger.log(`Menjalankan job ${job.name}`)
        const data = job.data;

        switch (job.name) {
            case "notif-model-embedding":
                await this.handleNotifModelNotSetting(data.workspaceId)
                break;
            case "notif-balance-low":
                await this.handleNotifBalanceLow(data.balance, data.workspaceId, data.level);
                break;
            case "notif-integration.update":
                await this.handleIntegrationUpdate(data);
                break;
            case "notif-model-error":
                const { workspaceId, model } = data;
                await this.sendModelErrorAlert(workspaceId, model);
                await this.sendModelErrorAlertAdmin(workspaceId, model);
                break;
            case "notif-message":
                await this.notifNewMessage(data);
                break;
        }
    }
    async notifNewMessage(data: Message) {
        const workspace = await this.prisma.workspace.findFirst({
            where: { id: data.workspaceId }
        });
        this.eventGateway.newMessage(workspace?.ownerId || "", data);
    }
    async handleNotifModelNotSetting(workspaceId: string) {
        try {
            const workspace = await this.prisma.workspace.findUnique({
                where: { id: workspaceId },
                select: { id: true }
            });

            if (!workspace) {
                console.warn(`Workspace with ID ${workspaceId} not found.`);
                return;
            }

            // Buat record notifikasi tunggal untuk workspace tersebut
            return await this.prisma.notification.create({
                data: {
                    workspaceId: workspaceId,
                    title: "Pengaturan Model AI Belum Dikonfigurasi",
                    message: "Model LLM/AI untuk workspace ini belum diatur. Segera atur konfigurasi AI pada menu Settings agar agen dapat berjalan.",
                    category: "SYSTEM",
                    level: "WARNING",
                    metadata: {
                        action: "CONFIGURE_MODEL",
                        targetTab: "workspace"
                    }
                }
            });
        } catch (error) {
            console.error("Error creating AI model setting notification:", error);
            throw error;
        }
    }

    async handleNotifBalanceLow(balance: number, workspaceId: string, level: "CRITICAL" | "WARNING") {
        try {
            const workspace = await this.prisma.workspace.findUnique({
                where: { id: workspaceId },
            });

            if (!workspace) {
                console.warn(`Workspace with ID ${workspaceId} not found.`);
                return;
            }

            // Cek apakah sudah ada notifikasi saldo rendah yang belum dibaca agar tidak spam
            const existingNotif = await this.prisma.notification.findFirst({
                where: {
                    workspaceId: workspaceId,
                    category: "BILLING",
                    isRead: false,
                    metadata: {
                        path: ["action"],
                        equals: "LOW_BALANCE_ALERT",
                    }
                }
            });

            if (existingNotif) return;

            const isCritical = level === "CRITICAL";
            const title = isCritical ? "Saldo Workspace Habis" : "Saldo Workspace Menipis";

            if ((workspace.notificationSettings as Record<NotificationSettingType, boolean>)["billing_alert"]) {
                const members = await this.prisma.workspaceMember.findMany({
                    where: {
                        workspaceId: workspaceId,
                        role: {
                            in: ["ADMIN", "OWNER"]
                        }
                    },
                    include: {
                        user: true
                    }
                });

                const recipients = members
                    .map(member => member.user?.email)
                    .filter((email): email is string => Boolean(email));

                if (recipients.length === 0) return;

                await Promise.all(
                    recipients.map(email =>
                        this.nodemailer.sendNotificationSettingLLM(
                            email,
                            title,
                            workspace.name,
                            isCritical,
                            balance,
                        )
                    )
                );
            }

            const formattedAmount = new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0
            }).format(balance);

            const message = isCritical
                ? `Saldo workspace Anda saat ini ${formattedAmount}. Layanan AI dan automasi terhenti sementara hingga Anda melakukan top up.`
                : `Sisa saldo workspace Anda saat ini ${formattedAmount}. Segera lakukan isi ulang saldo agar layanan tetap berjalan lancar.`;

            return await this.prisma.notification.create({
                data: {
                    workspaceId: workspaceId,
                    title: title,
                    message: message,
                    category: "BILLING",
                    level: level,
                    metadata: {
                        action: "LOW_BALANCE_ALERT",
                        targetTab: "billing",
                        currentBalance: balance
                    }
                }
            });
        } catch (error) {
            console.error("Error creating low balance notification:", error);
            throw error;
        }
    }

    async handleIntegrationUpdate({ instanceName, status, workspaceId }: { instanceName: string, status: StatusIntegration, workspaceId: string }) {
        if (status === "CONNECTED" || status === "DISCONNECTED") {
            const userId = this.userIds[instanceName];
            if (userId) {
                this.eventGateway.handleUpdateIntegration(userId, { instanceName, status });
                return;
            }
            const workspace = await this.prisma.workspace.findUnique({ where: { id: workspaceId } });
            if (workspace?.ownerId) {
                this.eventGateway.handleUpdateIntegration(workspace?.ownerId, { instanceName, status });
                this.userIds[instanceName] = workspace.ownerId;
            }
        }
    }

    async sendModelErrorAlert(workspaceId: string, model: AIModel) {
        // Cegah email dikirim ulang jika sudah pernah dikirim untuk workspace & model yang sama dalam 1 jam
        const rateLimitKey = `email_alert:model_error:${workspaceId}:${model.id}`;
        const isRecentlySent = await this.cacheManager.get(rateLimitKey);

        if (isRecentlySent) {
            return; // Lewati pengiriman email jika masih dalam masa cooldown
        }

        // Ambil data workspace
        const existingWorkspace = await this.prisma.workspace.findUnique({
            where: { id: workspaceId },
            select: { id: true, name: true },
        });

        if (!existingWorkspace) return;

        // Ambil anggota workspace beserta data user (email & id)
        const members = await this.prisma.workspaceMember.findMany({
            where: { workspaceId },
            include: {
                user: {
                    select: { id: true, email: true },
                },
            },
        });

        if (members.length === 0) return;

        // Buat In-App Notification di Database untuk seluruh member
        await this.prisma.notification.createMany({
            data: members.map((_member) => ({
                workspaceId: existingWorkspace.id,
                title: `Model AI Bermasalah`,
                message: `Model ${model.name} mengalami gangguan pemrosesan. Harap periksa konfigurasi AI Anda.`,
                level: "ERROR",
                metadata: {
                    action: "CONFIGURE_MODEL" as NotificationAction,
                    targetTab: "workspace"
                }
            })) as Prisma.NotificationCreateManyArgs["data"],
        });

        // Kirim email notifikasi ke semua member workspace secara paralel
        await Promise.all(
            members
                .filter((item) => item.user?.email)
                .map((item) =>
                    this.nodemailer.sendNotifModelError({
                        workspaceName: existingWorkspace.name,
                        workspaceId: existingWorkspace.id,
                        email: item.user?.email,
                        title: `⚠️ Gangguan Layanan AI pada Workspace ${existingWorkspace.name}`,
                        modelName: model.name,
                    })
                )
        );

        // Set Redis Key dengan TTL 1 jam (3600 detik) untuk kunci cooldown
        await this.cacheManager.set(rateLimitKey, true, 1000 * 60 * 60);
    }
    async sendModelErrorAlertAdmin(workspaceId: string, model: AIModel) {
        const existingWorkspace = await this.prisma.workspace.findUnique({
            where: { id: workspaceId },
        });

        if (!existingWorkspace) return;

        // 1. Ambil daftar admin & super admin
        const admins = await this.prisma.user.findMany({
            where: {
                role: { in: ["admin", "super_admin"] },
            },
            select: { email: true },
        });

        if (admins.length === 0) return;

        // 2. Hitung berapa banyak workspace yang mengaitkan model ini (baik sebagai chat/embedding model)
        const affectedWorkspaceCount = await this.prisma.workspace.count({
            where: {
                OR: [
                    { activeChatModelId: model.id },
                    { activeEmbeddingModelId: model.id },
                ],
            },
        });

        // 3. Kirim email secara paralel ke semua admin
        await Promise.all(
            admins.map((admin) =>
                this.nodemailer.sendNotifModelErrorAdmin({
                    email: admin.email,
                    modelId: model.id,
                    modelName: model.name,
                    provider: model.provider,
                    affectedWorkspaceCount,
                    totalErrorCount: 10
                })
            )
        );
    }
}