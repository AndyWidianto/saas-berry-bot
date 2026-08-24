import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { IntegrationService } from "./integration.service";
import { CreateIntegrationDto, UpdateIntegrationDto } from "@library/dto/integration.dto";
import { AuthGuard } from "@nestjs/passport";
import { WhatsappGatewayService } from "@library/whatsapp.gateway/whatsapp.gateway.service";
import { PlatformType } from "@prisma/client";
import type { RequestAndPayload } from "@library/types";
import { SkipThrottle } from "@nestjs/throttler";



@Controller("api/:workspaceId/integrations")
export class IntegrationController {
    constructor(
        private service: IntegrationService,
        private whatsappGatewayService: WhatsappGatewayService
    ) { }

    @Post()
    @UseGuards(AuthGuard("jwt"))
    async create(@Param("workspaceId") workspaceId: string, @Body() body: CreateIntegrationDto, @Req() req: RequestAndPayload) {
        return await this.service.create(req.user, workspaceId, body);
    }

    @Patch(":paltform")
    @UseGuards(AuthGuard("jwt"))
    async update(@Param() param: { workspaceId: string, paltform: PlatformType },
        @Body() body: UpdateIntegrationDto,
        @Req() req: RequestAndPayload) {
        return await this.service.update(req.user, param.workspaceId, param.paltform, body);
    }

    @SkipThrottle()
    @Get()
    @UseGuards(AuthGuard("jwt"))
    async getAll(@Param("workspaceId") workspaceId: string,
        @Query() query: { search?: string, lastId?: string },
        @Req() req: RequestAndPayload) {
        return await this.service.getAll(req.user, workspaceId, query.search, query.lastId);
    }

    @SkipThrottle()
    @Get("whatsapp/qrcode")
    @UseGuards(AuthGuard("jwt"))
    async getQrcodeWhatsapp(@Param("workspaceId") workspaceId: string, @Req() req: RequestAndPayload) {
        return await this.service.getQrcodeWhatsapp(req.user, workspaceId);
    }

    @Delete("whatsapp/unofficial/:id")
    @UseGuards(AuthGuard("jwt"))
    async deleteWhatsapp(@Param() param: { workspaceId: string, id: string }, @Req() req: RequestAndPayload) {
        return await this.service.deleteWhatsappNonofficial(req.user, param.workspaceId, param.id);
    }

    @Post("whatsapp/official/:instanceName")
    async webhookWhatsAppOfficial(@Param("workspaceId") workspaceId: string, @Req() req: RequestAndPayload, @Body() body: any) {
        console.log(body);
    }

}

