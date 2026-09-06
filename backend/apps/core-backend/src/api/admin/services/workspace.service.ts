import { GetQueryDto } from "@library/dto/query.dto";
import { PrismaService } from "@library/prisma/prisma.service";
import { PayloadJWT } from "@library/types";
import { Injectable } from "@nestjs/common";



@Injectable()
export class WorkspaceAdminService {
    constructor(
        private readonly prisma: PrismaService
    ) { }

    async getWorkspaces({ limit, cursor }: GetQueryDto) {
        const take = limit ? limit : 20;
        const [workspaces, totalWorkspace] = await this.prisma.$transaction([
            this.prisma.workspace.findMany({
                ...(cursor ? {
                    cursor: { id: cursor },
                    skip: 1
                } : {}),
                take: take,
                orderBy: {
                    id: "desc"
                }
            }),
            this.prisma.workspace.count()
        ])
        return {
            data: workspaces,
            total: totalWorkspace,
            totalPage: Math.ceil(totalWorkspace / take),
            nextId: workspaces.length >= take ? workspaces[workspaces.length - 1].id : null
        };
    }
}