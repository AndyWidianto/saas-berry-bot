import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { IntegrationService } from "./integration.service";
import { CreateIntegrationDto, UpdateIntegrationDto } from "@library/dto/integration.dto";
import { AuthGuard } from "@nestjs/passport";
import { WhatsappGatewayService } from "@library/whatsapp.gateway/whatsapp.gateway.service";
import { PlatformType } from "@prisma/client";



@Controller("api/:workspaceId/integrations")
export class IntegrationController {
    constructor(
        private service: IntegrationService,
        private whatsappGatewayService: WhatsappGatewayService
    ) {}

    @Post()
    @UseGuards(AuthGuard("jwt"))
    async create(@Param("workspaceId") workspaceId: string, @Body() body: CreateIntegrationDto) {
        return await this.service.create(workspaceId, body);
    }

    @Patch(":paltform")
    async update(@Param() param: { workspaceId: string, paltform: PlatformType }, @Body() body: UpdateIntegrationDto) {
        return await this.service.update(param.workspaceId, param.paltform, body);
    }

    @Get()
    @UseGuards(AuthGuard("jwt"))
    async getAll(@Param("workspaceId") workspaceId: string, @Query() query: { search?: string, lastId?: string }) {
        return await this.service.getAll(workspaceId, query.search, query.lastId);
    }

    @Get("whatsapp/qrcode")
    @UseGuards(AuthGuard("jwt"))
    async getQrcodeWhatsapp(@Param("workspaceId") workspaceId: string) {
        return await this.whatsappGatewayService.getQrcodeWhatsapp(workspaceId);
    }
    
}

