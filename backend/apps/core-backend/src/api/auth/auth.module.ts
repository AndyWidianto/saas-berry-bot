import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { TokenService } from "../../../../lib/token/token.service";
import { ConfigModule } from "@nestjs/config";
import { PassportModule } from "@nestjs/passport";
import { AccessTokenStrategy } from "../../../../lib/guards/access.strategy";
import { RefreshTokenStrategy } from "../../../../lib/guards/refresh.strategy";

@Module({
    providers: [AuthService, TokenService, AccessTokenStrategy, RefreshTokenStrategy],
    controllers: [AuthController],
    imports: [
        JwtModule.register({}),
        ConfigModule,
        PassportModule
    ]
})
export class AuthModule {};