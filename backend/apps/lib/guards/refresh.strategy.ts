import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-jwt";
import { Request } from "express";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: (req: Request) => {
                let token = '';
                if (req && req.cookies) {
                    token = req.cookies["refreshToken"];
                }
                return token;
            },
            secretOrKey: configService.get<string>("SECRET_REFRESH_TOKEN")!,
            passReqToCallback: true
        });
    }

    validate(req: Request, payload: { id: string, email: string, iat: number, exp: number }) {
        const refreshToken = req.cookies["refreshToken"];
        return { ...payload, refreshToken };
    }
}