import { RegisterDto } from "../../../../lib/dto/auth.dto";
import { PrismaService } from "../../../../lib/prisma/prisma.service";
import { TokenService } from "../../../../lib/token/token.service";
import { Login } from "../../../../lib/types";
import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import bcrypt from "bcryptjs";


@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly tokenService: TokenService
    ) { }

    async Login({ email, password }: Login) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new BadRequestException("Email or Password invalid");
        }
        const passwordValid = await bcrypt.compare(password, user.password);
        if (!passwordValid) {
            throw new BadRequestException("Email or Password invalid");
        }
        const accessToken = await this.tokenService.createAccessToken({ id: user.id, email: user.email, role: user.role, name: user.name || "" });
        const refreshToken = await this.tokenService.createRefreshToken({ id: user.id, email: user.email, role: user.role, name: user.name || "" });

        await this.prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: refreshToken }
        })
        return { accessToken, refreshToken, user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            username: user.username,
            profileUrl: user.profileUrl
        } };
    }
    async Register(dto: RegisterDto) {
        const userExists = await this.prisma.user.findUnique({
            where: { email: dto.email }
        });
        if (userExists) {
            throw new ConflictException("Email sudah digunakan");
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        await this.prisma.user.create({
            data: {
                username: dto.username,
                email: dto.email,
                password: hashedPassword,
                role: "admin"
            }
        });
        return { message: "Register successfully" };
    }
    async RefreshToken({ id, email, refreshToken }: { id: string, email: string, refreshToken?: string }) {
        const existing = await this.prisma.user.findUnique({
            where: { id }
        });
        if (!existing) {
            throw new NotFoundException("User not found");
        }
        if (!refreshToken || existing.refreshToken !== refreshToken) {
            throw new ForbiddenException("Forbidden");
        }
        const accessToken = await this.tokenService.createAccessToken({ id: existing.id, email: existing.email, role: existing.role, name: existing.name || "" });
        return { accessToken };
    }
    async Logout(id: string) {
        await this.prisma.user.update({
            where: { id },
            data: {
                refreshToken: null
            }
        });

        return { message: "Logged out successfully" };
    }
    async DeleteAccount(data: { id: string, email: string, iat: number, exp: number, refreshToken?: string}) {
        const user = await this.prisma.user.findUnique({ where: { id: data.id } });
        if (!user) {
            throw new NotFoundException("User tidak ditemukan");
        }
        if (user.refreshToken !== data.refreshToken) {
            throw new ForbiddenException("Forbidden");
        }
        await this.prisma.user.delete({
            where: { id: data.id }
        });

        return { message: "Akun berhasil dihapus selamanya" };
    }
}