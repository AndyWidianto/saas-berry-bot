import { PrismaService } from "@library/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { WorkspaceService } from "../workspace/workspace.service";
import { PayloadJWT } from "@library/types";
import { GetQueryDto } from "@library/dto/query.dto";



@Injectable()
export class InvoiceService {

    constructor(
        private workspaceService: WorkspaceService,
        private prisma: PrismaService
    ) { }

    async getAll(user: PayloadJWT, workspaceId: string, { cursor, limit }: GetQueryDto) {
        const workspace = await this.workspaceService.validateRoleWorkspace(workspaceId, user.id);

        limit = limit ? limit : 10;
        const query: Prisma.CreditLedgerFindManyArgs = {
            where: { workspaceId },
            ...cursor ? {
                cursor: { id: cursor },
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

    async getAllInvoices(user: PayloadJWT, workspaceId: string, { limit, cursor }: GetQueryDto) {
        await this.workspaceService.validateRoleWorkspace(workspaceId, user.id);
        limit = limit ? Number(limit) : 10;
        const query: Prisma.InvoiceFindManyArgs = {
            where: {
                workspaceId, status: {
                    in: ["CANCELLED", "PENDING", "REFUNDED"]
                }
            },
            ...cursor ? {
                cursor: { id: cursor },
                skip: 1
            } : {},
            take: limit,
            orderBy: [
                { id: "desc" },
                { createdAt: "desc" }
            ]
        };
        const [invoices, totalInvoice] = await this.prisma.$transaction([
            this.prisma.invoice.findMany(query),
            this.prisma.invoice.count({
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

    async import(user: PayloadJWT, workspaceId: string, lastId?: string) {
        const workspace = await this.workspaceService.validateRoleWorkspace(workspaceId, user.id);
        const query: Prisma.CreditLedgerFindManyArgs = {
            where: { workspaceId },
            ...lastId ? {
                cursor: { id: lastId },
                skip: 1
            } : {},
            orderBy: [
                { id: "desc" },
                { createdAt: "desc" }
            ]
        };
        const contacts = await this.prisma.creditLedger.findMany(query);
        return {
            data: contacts,
            message: "Berhasil mengambil data"
        }
    }
}