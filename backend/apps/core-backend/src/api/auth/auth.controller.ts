import { Body, Controller, Delete, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto, RegisterDto } from "../../../../lib/dto/auth.dto";
import type { Response } from "express";
import type { RequestAndPayload } from "../../../../lib/types";
import { AuthGuard } from "@nestjs/passport";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";



@Controller("api")
export class AuthController {
    constructor(private readonly service: AuthService) { }

    @ApiOperation({ summary: "Login ke website" })
    @ApiResponse({
        status: 200, example: {
            accessToken: "",
            refreshToken: "",
            user: {
                id: "",
                name: "",
                email: "",
                role: "",
                username: "",
                profileUrl: "",
            }
        }, description: "Login Berhasil"
    })
    @ApiResponse({ status: 400, description: "Input tidak valid!" })
    @Post("login")
    async Login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
        const { accessToken, refreshToken, user } = await this.service.Login(body);
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict', // strict
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return { accessToken, user };
    }

    @ApiOperation({ summary: "Refresh Token" })
    @ApiResponse({
        status: 200, example: {
            accessToken: "ewlwepw....",
        }, description: "berhasil mendapatkan access token"
    })
    @Post("refreshToken")
    @UseGuards(AuthGuard("jwt-refresh"))
    async refreshToken(@Req() req: RequestAndPayload) {
        const user = req.user;
        const refresh = await this.service.RefreshToken(user);
        return { accessToken: refresh.accessToken };
    }

    @ApiOperation({ summary: "Logout" })
    @ApiResponse({
        status: 200, example: {
            message: ""
        }, description: "Logout Berhasil"
    })
    @Post("logout")
    @UseGuards(AuthGuard("jwt"))
    async logout(@Res({ passthrough: true }) res: Response, @Req() req: RequestAndPayload) {
        const user = req.user;
        res.clearCookie("refreshToken");
        return await this.service.Logout(user.id)
    }

    @ApiOperation({ summary: "Delete Account" })
    @ApiResponse({
        status: 200, example: {
            message: ""
        }, description: "Delete Account berhasil"
    })
    @Delete("deleteAccount")
    @UseGuards(AuthGuard("jwt-refresh"))
    async deleteAccount(@Req() req: RequestAndPayload) {
        const user = req.user
        return this.service.DeleteAccount(user);
    }
}