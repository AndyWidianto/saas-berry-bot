import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import type { PayloadJWT } from "../types";

@Injectable()
export class TokenService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly config: ConfigService
    ) { }

    async createAccessToken({ id, email, role, name }: PayloadJWT) {
        return this.jwtService.signAsync(
            { id, email, role, name },
            {
                secret: this.config.get<string>("SECRET_ACCESS_TOKEN"),
                expiresIn: "17m"
            }
        );
    }

    async createRefreshToken({ id, email, role, name }: PayloadJWT) {
        return this.jwtService.signAsync(
            { id, email, role, name },
            {
                secret: this.config.get<string>("SECRET_REFRESH_TOKEN"),
                expiresIn: "7d"
            }
        );
    }
}