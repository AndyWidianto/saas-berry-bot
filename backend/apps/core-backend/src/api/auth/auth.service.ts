import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { ContactMeDto, ForgotPasswordDto, RegisterDto, ResetPasswordAuthDto } from "../../../../lib/dto/auth.dto";
import { PrismaService } from "../../../../lib/prisma/prisma.service";
import { TokenService } from "../../../../lib/token/token.service";
import { Login, PayloadJWT, UserOAuth } from "../../../../lib/types";
import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import bcrypt from "bcryptjs";
import type { Cache } from "cache-manager";
import { NodemailerService } from "@library/nodemailer/nodemailer.service";
import RegisterPinEmail from "@library/mail/templates/RegisterPinEmail";
import { render } from "@react-email/components";
import React from "react";
import ContactEmail from "@library/mail/templates/ContactEmail";
import { WorkspaceService } from "../workspace/workspace.service";


@Injectable()
export class AuthService {
    private logger = new Logger()
    constructor(
        private readonly prisma: PrismaService,
        private readonly tokenService: TokenService,
        private nodemailerService: NodemailerService,
        private workspaceService: WorkspaceService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }


    async contactMe(data: ContactMeDto) {
        try {
            const htmlContent = await render(
                ContactEmail({
                    name: data.name,
                    email: data.email,
                    workspace: data.workspace,
                    message: data.message,
                })
            );
            await this.nodemailerService.sendMail(
                process.env.ADMIN_EMAIL ?? 'andywidianto56@gmail.com', // Alamat email tujuan penerima notifikasi
                `[Contact Form] Pesan Baru dari ${data.name}`,
                htmlContent,
            );

            return {
                statusCode: 200,
                message: 'Pesan berhasil terkirim.',
            };
        } catch (error) {
            console.error('Failed to send contact email:', error);
            throw new InternalServerErrorException('Gagal mengirim pesan. Silakan coba beberapa saat lagi.');
        }
    }
    async me(user: PayloadJWT) {
        const exisitngUser = await this.prisma.user.findUnique({ where: { id: user.id } });
        if (!exisitngUser) {
            throw new BadRequestException("User tidak ditemukan!");
        }
        return {
            message: "berhasil mendapatkan user",
            data: {
                id: exisitngUser.id,
                name: exisitngUser.name,
                email: exisitngUser.email,
                role: exisitngUser.role,
                username: exisitngUser.username,
                profileUrl: exisitngUser.profileUrl
            }
        }
    }
    async Login({ email, password }: Login) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new BadRequestException("Email atau Password tidak valid.");
        }
        const passwordValid = await bcrypt.compare(password, user.password);
        if (!passwordValid) {
            throw new BadRequestException("Email atau Password tidak valid.");
        }
        const accessToken = await this.tokenService.createAccessToken({ id: user.id, email: user.email, role: user.role, name: user.name || "" });
        const refreshToken = await this.tokenService.createRefreshToken({ id: user.id, email: user.email, role: user.role, name: user.name || "" });

        await this.prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: refreshToken },
        });
        return {
            accessToken, refreshToken, user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                username: user.username,
                profileUrl: user.profileUrl
            }
        };
    }
    async Register(dto: RegisterDto) {
        if (!dto.codePin) {
            throw new BadRequestException("Code pin wajib diisi.");
        }
        const existingCodePin = await this.cacheManager.get(dto.email);
        if (!existingCodePin) {
            throw new BadRequestException("Code pin tidak cocok. mohon masukan code dengan benar.")
        }
        if (existingCodePin !== dto.codePin) {
            throw new BadRequestException("Code pin tidak cocok. mohon masukan code dengan benar.")
        }
        const userExists = await this.prisma.user.findUnique({
            where: { email: dto.email }
        });
        if (userExists) {
            throw new ConflictException("Email sudah digunakan");
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                username: dto.name.toLocaleLowerCase() + this.randomPin(100, 9000),
                email: dto.email,
                password: hashedPassword,
                role: "user",
            }
        });
        const PayloadJWT: PayloadJWT = {
            email: user.email,
            id: user.id,
            name: user.name || "",
            role: user.role
        }
        const workspaceName = `Default-${this.randomPin()}`;
        await this.workspaceService.create(PayloadJWT, { name: workspaceName });

        return { message: "Register successfully" };
    }

    async validateOAuth(data: UserOAuth) {
        let exisitngUser = await this.prisma.user.findUnique({
            where: { email: data.email }
        });
        if (!exisitngUser) {
            const newUser = await this.prisma.user.create({
                data: {
                    username: `${data.firstName}_${this.randomPin(100000, 9000000)}`,
                    email: data.email,
                    name: `${data.firstName} ${data.lastName}`,
                    password: "",
                    role: "user",
                    profileUrl: data.picture,
                    thumbnail: null
                }
            });
            if (!newUser) {
                throw new BadRequestException("User not found");
            }
            exisitngUser = newUser;
        }
        const accessToken = await this.tokenService.createAccessToken({ id: exisitngUser.id, email: exisitngUser.email, role: exisitngUser.role, name: exisitngUser.name || "" })
        const refreshToken = await this.tokenService.createRefreshToken({ id: exisitngUser.id, email: exisitngUser.email, role: exisitngUser.role, name: exisitngUser.name || "" })
        return {
            accessToken, refreshToken, user: {
                id: exisitngUser.id,
                name: exisitngUser.name,
                email: exisitngUser.email,
                role: exisitngUser.role,
                username: exisitngUser.username,
                profileUrl: exisitngUser.profileUrl
            }
        }
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
    async DeleteAccount(data: { id: string, email: string, iat: number, exp: number, refreshToken?: string }) {
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

    private randomPin(min = 100_000, max = 900_000) {
        return Math.floor(min + Math.random() * max).toString();
    }
    async getPinCode(data: RegisterDto) {
        const pin = this.randomPin();

        const existingUser = await this.prisma.user.findUnique({
            where: { email: data.email }
        });
        if (existingUser) {
            throw new ConflictException("Email sudah digunakan");
        }
        const pinHtml = await render(
            React.createElement(
                RegisterPinEmail,
                { pinCode: pin, userName: data.name, expirationMinutes: 5 }
            )
        )
        try {
            await this.nodemailerService.sendMail(data.email, "Kode Verifikasi Pendaftaran", pinHtml);
            console.log(`Email OTP berhasil dikirim ke: ${data.email}`);
        } catch (error) {
            console.error("Gagal mengirim email OTP via Nodemailer:", error);
            throw new InternalServerErrorException("Gagal mengirim kode OTP. Silakan coba lagi.");
        }
        await this.cacheManager.set(data.email, pin, 1000 * 60 * 5);
        return {
            message: "Code pin berhasil dikirim ke email",
        }
    }
    async forgotPassword(data: ForgotPasswordDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: data.email },
        });

        if (!existingUser) {
            this.logger.warn(`Forgot password request for non-existing email: ${data.email}`);

            return {
                message: 'Jika email terdaftar di sistem kami, instruksi pemulihan password telah dikirimkan.',
            };
        }

        const resetToken = crypto.randomUUID();

        await this.cacheManager.set(resetToken, {
            userId: existingUser.id,
            token: resetToken,
        }, 1000 * 60 * 30);

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        await this.nodemailerService.sendResetPasswordEmail(existingUser, resetUrl, 30);

        return {
            message: 'Jika email terdaftar di sistem kami, instruksi pemulihan password telah dikirimkan.',
        };
    }

    async resetPassword(data: ResetPasswordAuthDto) {
        const existing = await this.cacheManager.get<{ userId: string; token?: string }>(data.key);

        if (!existing) {
            throw new BadRequestException("Token tidak valid atau telah expired.");
        }

        const newPasswordHash = await bcrypt.hash(data.password, 10);

        await this.prisma.user.update({
            where: { id: existing.userId },
            data: {
                password: newPasswordHash,
            },
        });

        await this.cacheManager.del(data.key);

        return {
            message: "Berhasil memperbarui password",
        };
    }
}