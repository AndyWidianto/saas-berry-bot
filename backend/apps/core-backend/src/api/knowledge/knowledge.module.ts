import { Module } from "@nestjs/common";
import { KnowledgeService } from "./knowledge.service";
import { KnowledgeController } from "./knowledge.controller";
import { AccessTokenStrategy } from "../../../../lib/guards/access.strategy";
import { GeminiService } from "../../../../lib/agent/gemini.service";


@Module({
    providers: [KnowledgeService, AccessTokenStrategy, GeminiService],
    controllers: [KnowledgeController],
    exports: [KnowledgeService]
})
export class KnowledgeModule {}