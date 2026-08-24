import { Global, Module } from "@nestjs/common";
import { BillingService } from "./billing.service";
import { GeminiService } from "@library/agent/gemini.service";


@Global()
@Module({
    providers: [BillingService, GeminiService],
    exports: [BillingService]
})
export class BillingModule {}