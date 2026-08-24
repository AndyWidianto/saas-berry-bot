import { Body, Controller, Delete, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ContactMeDto, ForgotPasswordDto, LoginDto, RegisterDto, ResetPasswordDto } from "../../../../lib/dto/auth.dto";
import type { Response } from "express";
import type { RequestAndPayload } from "../../../../lib/types";
import { AuthGuard } from "@nestjs/passport";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { SkipThrottle, Throttle } from "@nestjs/throttler";



@Controller("api")
export class AuthController {
    constructor(private readonly service: AuthService) { }


    @Throttle({ default: { limit: 3, ttl: 1000 * 60 }})
    @Post("contact/me")
    async ContactMe(@Body()  body: ContactMeDto) {
        return await this.service.contactMe(body);
    }

    @SkipThrottle()
    @Get("auth/me")
    @UseGuards(AuthGuard('jwt'))
    async getMe(@Req() req: RequestAndPayload) {
        return await this.service.me(req.user);
    }

    @Throttle({ default: { limit: 3, ttl: 1000 * 60 }})
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

    @SkipThrottle()
    @Get('auth/google')
    @UseGuards(AuthGuard('google'))
    async googleAuth() {
    }

    @SkipThrottle()
    @Get('auth/google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req, @Res() res: Response) {
        const { accessToken, refreshToken, user } = await this.service.validateOAuth(req.user);
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict', // strict
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.redirect(`http://localhost:3000/auth/success?token=${accessToken}`);
    }

    @Throttle({ default: { limit: 3, ttl: 1000 * 60 * 3 }})
    @Post("auth/code-pin")
    async codePin(@Body() body: RegisterDto) {
        return await this.service.getPinCode(body);
    }

    @Throttle({ default: { limit: 3, ttl: 1000 * 60 * 3 }})
    @Post("auth/register")
    async authRegister(@Body() body: RegisterDto) {
        return await this.service.Register(body);
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

    @Throttle({ default: { limit: 3, ttl: 1000 * 60 * 3 }})
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

    @Throttle({ default: { limit: 3, ttl: 1000 * 60 * 3 }})
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

    @Throttle({ default: { limit: 3, ttl: 1000 * 60 * 3 }})
    @Post("auth/forgot-password")
    async forgotPassword(@Body() body: ForgotPasswordDto) {
        return await this.service.forgotPassword(body);
    }

    @Throttle({ default: { limit: 3, ttl: 1000 * 60 * 3 }})
    @Post("auth/reset-password")
    async resetPassword(@Body() body: ResetPasswordDto) {
        return await this.service.resetPassword(body);
    }
}