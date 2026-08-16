import { Module } from "@nestjs/common";
import { WhatsappGatewayService } from "./whatsapp-gateway.service";
import { WhatsappController } from "./whatsapp.controller";
import { WhatsappService } from "./whatsapp.service";
import { GeminiService } from "@library/agent/gemini.service";
import { BullModule } from "@nestjs/bullmq";
import { WhatsappMessageProcessor } from "./whatsapp-message.processor";


@Module({
    providers: [WhatsappGatewayService, WhatsappService, GeminiService, WhatsappMessageProcessor],
    controllers: [WhatsappController],
    imports: [
        BullModule.registerQueue({
            name: "message-queue"
        }),
        BullModule.registerQueue({
            name: "whatsapp-outgoing-queue"
        }),
    ]
})
export class WhatsappModule { }