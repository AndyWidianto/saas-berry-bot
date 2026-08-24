import { Module } from "@nestjs/common";
import { KnowledgeService } from "./knowledge.service";
import { KnowledgeController } from "./knowledge.controller";
import { AccessTokenStrategy } from "../../../../lib/guards/access.strategy";
import { GeminiService } from "../../../../lib/agent/gemini.service";
import { BullModule } from "@nestjs/bullmq";
import { KnowledgeProcessor } from "./knowledge.processor";


@Module({
    providers: [KnowledgeService, AccessTokenStrategy, GeminiService, KnowledgeProcessor],
    controllers: [KnowledgeController],
    exports: [KnowledgeService],
    imports: [
        BullModule.registerQueue({
            name: "queue-knowledge-base"
        })
    ]
})
export class KnowledgeModule {}