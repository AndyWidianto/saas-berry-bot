import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { AuthGuard } from "@nestjs/passport";
import { QueryNotificationDto } from "@library/dto/query.dto";
import { SkipThrottle } from "@nestjs/throttler";
import type { RequestAndPayload } from "@library/types";
import { MarkReadDto } from "@library/dto/notification.dto";



@Controller("api/:workspaceId/notifications")
export class NotificationController {
    constructor(
        private service: NotificationService
    ) { }

    @SkipThrottle()
    @Get()
    @UseGuards(AuthGuard("jwt"))
    async getAll(
        @Param("workspaceId") workspaceId: string,
        @Req() req: RequestAndPayload,
        @Query() query: QueryNotificationDto) {
        return await this.service.getAll(req.user, workspaceId, query)
    }

    @Post("markread/all")
    @UseGuards(AuthGuard("jwt"))
    async markAllRead(@Param("workspaceId") workspaceId: string, @Req() req: RequestAndPayload) {
        return await this.service.markAllRead(req.user, workspaceId);
    }

    @Post("markread")
    @UseGuards(AuthGuard("jwt"))
    async markRead(@Param("workspaceId") workspaceId: string, @Req() req: RequestAndPayload, @Body() body: MarkReadDto) {
        return await this.service.markRead(req.user, workspaceId, body);
    }
}