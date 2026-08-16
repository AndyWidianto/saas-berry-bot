import { PrismaService } from "@library/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";



@Injectable()
export class InvoiceService {

    constructor(
        private prisma: PrismaService
    ) {}

    async getAll(workspaceId: string, lastId?: string, limitStr?: string) {
        const limit = limitStr ? Number(limitStr) : 10;
        const query: Prisma.CreditLedgerFindManyArgs = {
            where: { workspaceId },
            ...lastId ? {
                cursor: { id: lastId },
                skip: 1
            } : {},
            take: limit,
            orderBy: [
                { id: "desc" },
                { createdAt: "desc" }
            ]
        };
        const [invoices, totalInvoice] = await this.prisma.$transaction([
            this.prisma.creditLedger.findMany(query),
            this.prisma.creditLedger.count({
                where: query.where
            })
        ]);
        return {
            data: invoices,
            totalPage: Math.ceil(totalInvoice / limit),
            total: totalInvoice,
            nextId: invoices.length > 0 ? invoices[invoices.length - 1].id : null
        }
    }
}