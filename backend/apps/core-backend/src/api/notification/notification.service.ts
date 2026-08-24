import { QueryNotificationDto } from "@library/dto/query.dto";
import { PrismaService } from "@library/prisma/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { WorkspaceService } from "../workspace/workspace.service";
import { PayloadJWT } from "@library/types";
import { MarkReadDto } from "@library/dto/notification.dto";



@Injectable()
export class NotificationService {
    constructor(
        private prisma: PrismaService,
        private workspaceService: WorkspaceService
    ) {}

    async getAll(user: PayloadJWT, workspaceId: string, { status, limit, cursor }: QueryNotificationDto) {
        await this.workspaceService.validateRoleWorkspace(workspaceId, user.id);
        const take = limit ? limit : 20;
        const query: Prisma.NotificationFindManyArgs = {
            where: {
                workspaceId,
                ...status ? {
                    isRead: status === "READ" ? true : false
                } : {}
            },
            ...cursor ? {
                cursor: { id: cursor },
                skip: 1
            } : {},
            take
        }
        const [notifications, totalNotification] = await this.prisma.$transaction([
            this.prisma.notification.findMany(query),
            this.prisma.notification.count({
                where: query.where
            })
        ]);
        const totalPage = Math.ceil(totalNotification / take);
        const nextId = notifications.length >= take ? notifications[notifications.length - 1].id : null;
        return {
            total: totalNotification,
            totalPage,
            nextId,
            data: notifications
        }
    }

    async markAllRead(user: PayloadJWT, workspaceId: string) {
        await this.workspaceService.validateRoleWorkspace(workspaceId, user.id);
        await this.prisma.notification.updateMany({
            where: { workspaceId },
            data: {
                isRead: true
            }
        });
        return { message: "Semua notification berhasil di baca"};
    }

    async markRead(user: PayloadJWT, workspaceId: string, data: MarkReadDto) {
         await this.workspaceService.validateRoleWorkspace(workspaceId, user.id);
        const existing = await this.prisma.notification.findUnique({
            where: { id: data.id }
        });
        if (!existing) {
            throw new NotFoundException("Notification not found");
        }
        await this.prisma.notification.update({
            where: { workspaceId, id: data.id },
            data: {
                isRead: true
            }
        });
        return {
            message: "notifikasi berhasil di tandai"
        }
    }
}