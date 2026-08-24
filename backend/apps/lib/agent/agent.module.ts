import { Global, Module } from "@nestjs/common";
import { GeminiService } from "./gemini.service";
import { OpenaiService } from "./openai.service";



@Global()
@Module({
    providers: [GeminiService, OpenaiService],
    exports: [GeminiService, OpenaiService]
})
export class AgentModule {}