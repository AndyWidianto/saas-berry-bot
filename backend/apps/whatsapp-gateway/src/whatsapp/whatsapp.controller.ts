import { Body, Controller, Delete, Get, Headers, Param, Post } from "@nestjs/common";
import { WhatsappGatewayService } from "./whatsapp-gateway.service";
import { MessageMediaDto, MessageTextDto } from "@library/dto/message.dto";
import { WhatsappService } from "./whatsapp.service";


@Controller("/:workspaceId/whatsapp")
export class WhatsappController {
    constructor(
        private service: WhatsappGatewayService,
        private whatsappService: WhatsappService
    ) { }

    @Post("create")
    async create(@Headers("secret-key") secret: string, @Param("workspaceId") workspaceId: string, @Body("instanceName") name: string) {
        return await this.service.handleCreate(secret, workspaceId, name);
    }

    @Get("qrcode/:instanceName")
    async getQrcode(@Param("instanceName") instanceName: string, @Headers("secret-key") secret: string) {
        return await this.service.getQrCode(secret, instanceName)
    }

    @Post("sendMessage")
    async sendMessage(@Headers("secret-key") secret: string, @Body() body: MessageTextDto) {
        return await this.whatsappService.sendMessage(secret, body);
    }
    @Post("sendMedia")
    async sendMedia(@Headers("secret-key") secret: string, @Body() body: MessageMediaDto) {
        return await this.whatsappService.sendMedia(secret, body);
    }

    @Delete(":instanceName")
    async delete(@Param("instanceName") instanceName: string, @Headers("secret-key") secret: string) {
        return await this.service.deleteInstance(secret, instanceName);
    }
}