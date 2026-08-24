import { GeminiService } from "@library/agent/gemini.service";
import { Global, Module } from "@nestjs/common";
import { EmbeddingService } from "./embedding.service";
import { OpenaiService } from "@library/agent/openai.service";
import { BullModule } from "@nestjs/bullmq";


@Global()
@Module({
    providers: [GeminiService, EmbeddingService, OpenaiService],
    exports: [EmbeddingService],
    imports: [
        BullModule.registerQueue({
            name: "queue-knowledge-base"
        })
    ]
})
export class EmbeddingModule {};