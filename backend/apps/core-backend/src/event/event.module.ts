import { Module } from "@nestjs/common";
import { EventGateway } from "./event.gateway";
import { JwtModule } from "@nestjs/jwt";
import { ScheduleService } from "./schedule.service";
import { ScheduleModule } from "@nestjs/schedule";



@Module({
    providers: [EventGateway, ScheduleService],
    exports: [EventGateway],
    imports: [
        JwtModule.register({
            secret: process.env.SECRET_ACCESS_TOKEN!
        }),
        ScheduleModule.forRoot()
    ]
})
export class EventModule {}