import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { InvoiceService } from "./invoice.service";
import { AuthGuard } from "@nestjs/passport";





@Controller("api/:workspaceId/invoices")
export class InvoiceController {
    constructor(
        private service: InvoiceService
    ) {}

    @Get()
    @UseGuards(AuthGuard("jwt"))
    async getAll(@Param("workspaceId") workspaceId: string, @Query() query: { lastId?: string, limit?: string }) {
        return await this.service.getAll(workspaceId, query.lastId, query.limit);
    }
}