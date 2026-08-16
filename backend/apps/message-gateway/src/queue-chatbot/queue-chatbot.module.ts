import { Module } from "@nestjs/common";
import { ChatbotProcessor } from "./queue-chatbot.processor";


@Module({
    providers: [ChatbotProcessor]
})
export class QueueChatbotModule {}