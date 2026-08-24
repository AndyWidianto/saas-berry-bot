import { Global, Module } from "@nestjs/common";
import { AccessTokenStrategy } from "./access.strategy";
import { RefreshTokenStrategy } from "./refresh.strategy";
import { GoogleStrategy } from "./google.strategy";



@Global()
@Module({
    providers: [
        AccessTokenStrategy,
        RefreshTokenStrategy,
        GoogleStrategy,
    ],
    exports: [
        AccessTokenStrategy,
        RefreshTokenStrategy,
        GoogleStrategy
    ]
})
export class GuardModule {};