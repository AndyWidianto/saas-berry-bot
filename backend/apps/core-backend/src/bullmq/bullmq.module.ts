import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { BullmqProccessor } from "./bullmq.processor";
import { OrderModule } from "@library/order/order.module";


@Module({
    imports: [
        BullModule.registerQueue({
            name: "queue"
        }),
        OrderModule
    ],
    providers: [BullmqProccessor]
})
export class BullmqModule {}