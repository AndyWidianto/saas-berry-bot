import { Controller, Get, Param, Query, Req, UseGuards } from "@nestjs/common";
import { InvoiceService } from "./invoice.service";
import { AuthGuard } from "@nestjs/passport";
import { SkipThrottle } from "@nestjs/throttler";
import type { RequestAndPayload } from "@library/types";





@Controller("api/:workspaceId")
export class InvoiceController {
    constructor(
        private service: InvoiceService
    ) { }


    @SkipThrottle()
    @Get("creditledger")
    @UseGuards(AuthGuard("jwt"))
    async getAll(
        @Req() req: RequestAndPayload,
        @Param("workspaceId") workspaceId: string,
        @Query() query: { lastId?: string, limit?: string }) {
        return await this.service.getAll(req.user, workspaceId, query.lastId, query.limit);
    }

    @SkipThrottle()
    @Get("invoices")
    @UseGuards(AuthGuard("jwt"))
    async getAllInvoice(
        @Req() req: RequestAndPayload,
        @Param("workspaceId") workspaceId: string,
        @Query() query: { lastId?: string, limit?: string }) {
        return await this.service.getAllInvoices(req.user, workspaceId, query.lastId, query.limit);
    }

    @Get("invoices/import")
    @UseGuards(AuthGuard("jwt"))
    async import(@Req() req: RequestAndPayload, @Param("workspaceId") workspaceId: string, @Query() query: { lastId?: string, limit?: string }) {
        return await this.service.import(req.user, workspaceId, query.lastId);
    }
}