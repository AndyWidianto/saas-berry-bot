import { Module } from "@nestjs/common";
import { MessageService } from "./message.service";
import { AccessTokenStrategy } from "../../../../lib/guards/access.strategy";
import { MessageController } from "./message.controller";
import { WhatsappGatewayService } from "@library/whatsapp.gateway/whatsapp.gateway.service";
import { GeminiService } from "@library/agent/gemini.service";


@Module({
    providers: [MessageService, AccessTokenStrategy, WhatsappGatewayService, GeminiService],
    controllers: [MessageController],
    exports: [MessageService]
})
export class MessageModule {}