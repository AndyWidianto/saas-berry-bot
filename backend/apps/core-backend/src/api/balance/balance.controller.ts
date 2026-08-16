import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { BalanceService } from "./balance.service";
import { AuthGuard } from "@nestjs/passport";




@Controller("api/:workspaceId/balance")
export class BalanceController {
    constructor(private service: BalanceService) {}

    @Post("topup")
    @UseGuards(AuthGuard("jwt"))
    async topup() {}

    @Get()
    @UseGuards(AuthGuard("jwt"))
    async getFirst(@Param("workspaceId") id: string) {
        return await this.service.getFirst(id);
    }

}