import { Global, Module } from "@nestjs/common";
import { ChattingService } from "./chatting.service";
import { BullModule } from "@nestjs/bullmq";



@Global()
@Module({
    providers: [ChattingService],
    exports: [ChattingService],
    imports: [
        BullModule.registerQueue({
            name: "notification-queue"
        })
    ]
})
export class ChattingModule {}