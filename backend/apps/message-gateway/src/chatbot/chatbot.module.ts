import { Global, Module } from "@nestjs/common";
import { ChatbotService } from "./chatbot.service";
import { ChatbotController } from "./chatbot.controller";
import { AccessTokenStrategy } from "@library/guards/access.strategy";
import { GeminiService } from "@library/agent/gemini.service";
import { KnowledgeService } from "@core/api/knowledge/knowledge.service";
import { BullModule } from "@nestjs/bullmq";
import { ChatbotProcessor } from "../queue-chatbot/queue-chatbot.processor";


@Global()
@Module({
    providers: [ChatbotService, AccessTokenStrategy, GeminiService, KnowledgeService, ChatbotProcessor],
    controllers: [ChatbotController],
    exports: [ChatbotService],
    imports: [
        BullModule.registerQueue({
            name: "queue-chatbot-api"
        }),
        BullModule.registerQueue({
            name: "notification-queue"
        })
    ]
})
export class ChatbotModule {}