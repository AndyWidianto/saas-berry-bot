import { Global, Module } from "@nestjs/common";
import { AccessTokenStrategy } from "./access.strategy";
import { RefreshTokenStrategy } from "./refresh.strategy";



@Global()
@Module({
    providers: [
        AccessTokenStrategy,
        RefreshTokenStrategy,
    ],
    exports: [
        AccessTokenStrategy,
        RefreshTokenStrategy
    ]
})
export class GuardModule {};