import { PrismaService } from "@library/prisma/prisma.service";
import { PayloadJWT } from "@library/types";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { WorkspaceBalance } from "@prisma/client";
import { WorkspaceService } from "../workspace/workspace.service";


@Injectable()
export class BalanceService {
    constructor(
        private prisma: PrismaService,
        private workspaceService: WorkspaceService
    ) { }

    async topup(workspaceId: string, nominal: number) {
        if (nominal < 20000) {
            throw new BadRequestException("Minimal topup 20000");
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