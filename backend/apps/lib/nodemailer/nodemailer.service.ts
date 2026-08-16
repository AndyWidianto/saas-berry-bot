import { PrismaService } from "@library/prisma/prisma.service";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import nodemailer, { Transporter } from "nodemailer";


@Injectable()
export class NodemailerService implements OnModuleInit {
    private transporter: Transporter;
    private username = "";
    constructor(
        private prisma: PrismaService,
        private configService: ConfigService
    ) { }

    async onModuleInit() {
        const username = this.configService.get<string>("USERNAME_GMAIL") || "";
        this.username = username;
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: username,
                pass: this.configService.get<string>("PASSWORD_GMAIL"),
            }
        })
    }

    async sendMail(to: string, subject: string, html: string) {
        return await this.transporter.sendMail({
            from: `"KurmaBot" <${this.configService.get<string>('USERNAME_GMAIL')}>`,
            to,
            subject,
            html,
        });
    }
}