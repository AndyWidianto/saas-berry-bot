import { Global, Module } from "@nestjs/common";
import { OrderService } from "./order.service";



@Global()
@Module({
    providers: [OrderService],
    exports: [OrderService]
})
export class OrderModule {}