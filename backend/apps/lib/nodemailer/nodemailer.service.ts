import AdminModelAlertEmail from "@library/mail/templates/AlertModelAdmin";
import LowBalanceEmail from "@library/mail/templates/LowBalanceEmail";
import ModelErrorEmail from "@library/mail/templates/ModelErrorEmail";
import ResetPasswordEmail from "@library/mail/templates/ResetPassword";
import { PrismaService } from "@library/prisma/prisma.service";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { User } from "@prisma/client";
import { render } from "@react-email/components";
import nodemailer, { Transporter } from "nodemailer";
import React from "react";


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
            from: `"BerryBot" <${this.configService.get<string>('USERNAME_GMAIL')}>`,
            to,
            subject,
            html,
        });
    }

    async sendResetPasswordEmail(user: User, url: string, expired: number) {
        const tagHtml = await render(
            ResetPasswordEmail({
                name: user.name ?? user.username,
                resetUrl: url,
                expireMinutes: expired
            })
        )
        return await this.sendMail(user.email, 'Reset Password - Berry', tagHtml);
    }

    async sendNotificationSettingLLM(email: string, title: string, workspaceName: string, isCritical: boolean, currentBalance: number) {
        const baseUrl = this.configService.get("FRONTEND_URL") || "http://localhost:3000";
        const tagHtml = await render(
            LowBalanceEmail({
                workspaceName,
                isCritical,
                currentBalance,
                topUpUrl: `${baseUrl}/dashboard`
            })
        )
        return await this.sendMail(email, title, tagHtml);
    }

    async sendNotifModelError({
        workspaceName,
        modelName,
        workspaceId,
        email,
        title
    }) {
        const baseUrl = this.configService.get("FRONTEND_URL") || "http://localhost:3000";
        const tagHtml = await render(
            ModelErrorEmail({
                workspaceName,
                modelName,
                actionUrl: `${baseUrl}/dashboard/workspace/${workspaceId}`
            })
        )
        return await this.sendMail(email, title, tagHtml);
    }

    async sendNotifModelErrorAdmin({
        modelId,
        email,
        modelName,
        provider,
        affectedWorkspaceCount,
        totalErrorCount,
    }) {
        const baseUrl = this.configService.get("FRONTEND_URL") || "http://localhost:3000";
        const tagHtml = await render(
            AdminModelAlertEmail({
                modelId,
                modelName,
                provider,
                affectedWorkspaceCount,
                totalErrorCount,
    
            })
        )
        return await this.sendMail(email, "Model ai error", tagHtml);
    }
}