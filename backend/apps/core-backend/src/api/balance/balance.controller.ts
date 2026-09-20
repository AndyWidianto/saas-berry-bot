import { Body, Controller, Get, Param, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { BalanceService } from "./balance.service";
import { AuthGuard } from "@nestjs/passport";
import type { RequestAndPayload } from "@library/types";
import { SkipThrottle } from "@nestjs/throttler";
import { TopupDto } from "@library/dto/balance.dto";
import type { Request, Response } from "express";




@Controller("api")
export class BalanceController {
    constructor(private service: BalanceService) { }

    @Post(":workspaceId/topup")
    @UseGuards(AuthGuard("jwt"))
    async topup(@Param("workspaceId") id: string, @Req() req: RequestAndPayload, @Body() body: TopupDto) {
        return await this.service.topup(req.user, id, body)
    }

    @Post("midtrans-callback")
    async midtransCallback(@Req() res: Response, @Body() body: any, @Query("secret") secret?: string) {
        res.status(200).json({ message: "ok" });

        this.service.midtransCallback(body, secret || "").catch((err) => {
            console.error("Error processing Midtrans callback:", err);
        });
    }


    @SkipThrottle()
    @Get("/:workspaceId/balance")
    @UseGuards(AuthGuard("jwt"))
    async getFirst(@Param("workspaceId") id: string, @Req() req: RequestAndPayload) {
        return await this.service.getFirst(req.user, id);
    }

}