import { Module } from "@nestjs/common";
import { IntegrationService } from "./integration.service";
import { IntegrationController } from "./integration.controller";
import { WhatsappGatewayService } from "@library/whatsapp.gateway/whatsapp.gateway.service";



@Module({
    providers: [IntegrationService, WhatsappGatewayService],
    controllers: [IntegrationController]
})
export class IntegrationModule {}