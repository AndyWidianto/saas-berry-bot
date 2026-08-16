import { PrismaService } from "@library/prisma/prisma.service";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { WorkspaceBalance } from "@prisma/client";


@Injectable()
export class BalanceService {
    constructor(
        private prisma: PrismaService,
    ) { }

    async topup(workspaceId: string, nominal: number) {
        if (nominal < 20000) {
            throw new BadRequestException("Minimal topup 20000");
        }
    }
    async getFirst(workspaceId: string) {
        const existing = await this.prisma.workspace.findFirst({
            where: { id: workspaceId }
        });
        if (!existing) {
            throw new NotFoundException("Workspace not found");
        }
        let balance = await this.prisma.workspaceBalance.findFirst({
            where: { workspaceId }
        });
        const dataToSend: Record<string, string | {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            workspaceId: string;
            amount: number;
        }> = {
            message: "Successfully"
        }
        if (!balance) {
            const newBalance = await this.prisma.workspaceBalance.create({
                data: {
                    workspaceId,
                    amount: 0
                }
            });
            balance = newBalance;
        }
        dataToSend.data = {
            ...balance,
            amount: balance.amount.toNumber()
        }
        return dataToSend;
    }
}