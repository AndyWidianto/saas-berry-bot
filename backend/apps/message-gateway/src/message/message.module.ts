import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { MessageProcessor } from "./queue-message.processor";
import { GeminiService } from "@library/agent/gemini.service";


@Module({
    providers: [MessageProcessor, GeminiService],
    controllers: [],
    imports: [
        BullModule.registerQueue({
            name: "message-queue"
        }),
        BullModule.registerQueue({
            name: "whatsapp-outgoing-queue"
        })
    ]
})
export class MessageModule {}