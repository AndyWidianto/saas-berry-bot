import { AccessTokenStrategy } from "../../../../lib/guards/access.strategy";
import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";



@Module({
    providers: [UsersService, AccessTokenStrategy],
    controllers: [UsersController]
})
export class UsersModule {}