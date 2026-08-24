import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { QueueNotificationProcessor } from "./queue-notification.processor";
import { NotificationService } from "./notification.service";
import { NotificationController } from "./notification.controller";



@Module({
    controllers: [NotificationController],
    providers: [QueueNotificationProcessor, NotificationService],
    imports: [
        BullModule.registerQueue({
            name: 'notification-queue'
        })
    ]
})
export class NotificationModule {}