import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { OrderService } from "./order.service";
import { AuthGuard } from "@nestjs/passport";
import type { RequestAndPayload } from "@library/types";
import { GetQueryDto } from "@library/dto/query.dto";
import { OrderData, UpdateOrderStatusDto } from "@library/dto/order.dto";


@Controller("api/:workspaceId/orders")
export class OrderController {
    constructor(
        private readonly service: OrderService
    ) { }

    @Get()
    @UseGuards(AuthGuard("jwt"))
    async getAll(
        @Param("workspaceId") workspaceId: string,
        @Req() req: RequestAndPayload,
        @Query() query: GetQueryDto
    ) {
        return await this.service.getAll(req.user, workspaceId, query);
    }

    @Patch(":id")
    @UseGuards(AuthGuard("jwt"))
    async handleAccept(@Req() req: RequestAndPayload, @Body() data: UpdateOrderStatusDto, @Param() params: { id: string, workspaceId: string }) {
        return await this.service.updateStatus(req.user, params.workspaceId, params.id, data);
    }
} 