import { PrismaService } from "@library/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";



@Injectable()
export class ContactService {
    constructor(
        private prisma: PrismaService,
    ) {}

    async getAll(workspaceId: string) {
        const query: Prisma.ContactFindManyArgs = {
            where: { workspaceId },
            orderBy: {
                createdAt: "desc"
            }
        };
        const [contacts, totalContact] = await this.prisma.$transaction([
            this.prisma.contact.findMany(query),
            this.prisma.contact.count({
                where: query.where
            })
        ]);
        return {
            total: totalContact,
            data: contacts,
            totalPage: 1,
            nextId: null
        }
    }
}