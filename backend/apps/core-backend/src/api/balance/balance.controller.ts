import { Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { BalanceService } from "./balance.service";
import { AuthGuard } from "@nestjs/passport";
import type { RequestAndPayload } from "@library/types";
import { SkipThrottle } from "@nestjs/throttler";




@Controller("api/:workspaceId/balance")
export class BalanceController {
    constructor(private service: BalanceService) {}

    @Post("topup")
    @UseGuards(AuthGuard("jwt"))
    async topup() {}

    @SkipThrottle()
    @Get()
    @UseGuards(AuthGuard("jwt"))
    async getFirst(@Param("workspaceId") id: string, @Req() req: RequestAndPayload) {
        return await this.service.getFirst(req.user, id);
    }

}