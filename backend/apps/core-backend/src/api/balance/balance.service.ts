import { PrismaService } from "@library/prisma/prisma.service";
import { PayloadJWT } from "@library/types";
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, OnModuleInit } from "@nestjs/common";
import { InvoiceStatus, WorkspaceBalance } from "@prisma/client";
import { WorkspaceService } from "../workspace/workspace.service";
import { MidtransCallbackDto, TopupDto } from "@library/dto/balance.dto";
import MidtransClient from "midtrans-client";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";


@Injectable()
export class BalanceService implements OnModuleInit {
    private snap: MidtransClient.Snap;
    constructor(
        private prisma: PrismaService,
        private workspaceService: WorkspaceService,
        private configService: ConfigService
    ) { }

    onModuleInit() {
        const isProduction = this.configService.get<string>("PRODUCTION") === "true";
        this.snap = new MidtransClient.Snap({
            isProduction: isProduction,
            serverKey: this.configService.get<string>("MIDTRANS_SERVER_KEY") || "",
            clientKey: this.configService.get<string>("MIDTRANS_CLIENT_KEY") || ""
        });
    }

    async topup(user: PayloadJWT, workspaceId: string, data: TopupDto) {
        await this.workspaceService.validateRoleWorkspace(workspaceId, user.id);
        if (data.nominal < 20000) {
            throw new BadRequestException("Minimal topup 20000");
        }

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const startOfMonth = new Date(year, now.getMonth(), 1);
        const endOfMonth = new Date(year, now.getMonth() + 1, 0, 23, 59, 59, 999);

        const totalInvoiceThisMonth = await this.prisma.invoice.count({
            where: {
                createdAt: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            }
        });

        const nextNumber = String(totalInvoiceThisMonth + 1).padStart(4, '0');
        const orderId = `INV-${year}-${month}-${nextNumber}`;

        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: data.nominal
            },
            customer_details: {
                first_name: user.name || "Customer",
                email: user.email,
                workspaceId: workspaceId
            }
        };

        const transaction = await (this.snap as any).createTransaction(parameter);

        await this.prisma.invoice.create({
            data: {
                invoiceNumber: orderId,
                workspaceId: workspaceId,
                creditAmount: data.nominal,
                subtotal: data.nominal,
                taxAmount: 0,
                totalAmount: data.nominal,
                currency: "IDR",
                status: "PENDING",
                paymentProvider: "midtrans",
                paymentUrl: transaction.redirect_url,
            }
        });

        return { token: transaction.token, redirect: transaction.redirect_url };
    }

    async midtransCallback(req: Request) {
        const notification = await this.verifyNotification(req.body);
        const orderId = notification.order_id;
        const transactionStatus = notification.transaction_status;
        const fraudStatus = notification.fraud_status;
        const invoice = await this.prisma.invoice.findUnique({
            where: { id: orderId }
        });
        if (!invoice) {
            throw new NotFoundException("Invoice tidak ditemukan");
        }

        if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
            if (fraudStatus === 'accept' || !fraudStatus) {
                console.log(`Order ${orderId} berhasil dibayar.`);
                await this.prisma.$transaction([
                    this.prisma.invoice.update({
                        where: { id: orderId },
                        data: {
                            status: "PAID"
                        }
                    }),
                    this.prisma.workspaceBalance.update({
                        where: { workspaceId: invoice.workspaceId },
                        data: {
                            amount: invoice.subtotal
                        }
                    }),
                    this.prisma.creditLedger.create({
                        data: {
                            workspaceId: invoice.workspaceId,
                            invoiceId: invoice.id,
                            amount: invoice.creditAmount,
                            type: "TOP_UP",
                            description: `Topup via Midtrans (${invoice.invoiceNumber})`,
                        }
                    })
                ])
            }
        } else if (['cancel', 'deny', 'expire'].includes(transactionStatus)) {
            await this.prisma.invoice.update({
                where: { invoiceNumber: orderId },
                data: {
                    status: "CANCELLED"
                }
            });
        } else if (transactionStatus === 'refund') {
            await this.prisma.invoice.update({
                where: { invoiceNumber: orderId },
                data: {
                    status: "REFUNDED"
                }
            });
        }
        return { status: 'OK' };
    }
    async verifyNotification(notificationPayload: Record<string, any>) {
        try {
            // Gunakan 'as any' agar TypeScript tidak komplain properti transaction
            const statusResponse = await (this.snap as any).transaction.notification(notificationPayload);
            return statusResponse;
        } catch (error: any) {
            throw new InternalServerErrorException(
                `Failed to verify Midtrans notification: ${error.message}`,
            );
        }
    }
    async getFirst(user: PayloadJWT, workspaceId: string) {
        const workspace = await this.workspaceService.validateRoleWorkspace(workspaceId, user.id);
        let balance = await this.prisma.workspaceBalance.findFirst({
            where: { workspaceId: workspace.id }
        });

        if (!balance) {
            balance = await this.prisma.workspaceBalance.create({
                data: {
                    workspaceId: workspace.id,
                    amount: 0
                }
            });
        }

        return {
            message: "Successfully",
            data: {
                ...balance,
                amount: Number(balance.amount)
            }
        };
    }
}