import { CreateApiKeyDto } from "@library/dto/workspace.dto";
import { PrismaService } from "@library/prisma/prisma.service";
import { PayloadJWT } from "@library/types";
import { ForbiddenException, Injectable } from "@nestjs/common";
import * as crypto from "crypto";



@Injectable()
export class ApiKeyService {
    private keyPrefix = "berry_live.";
    constructor(
        private prisma: PrismaService
    ) { }

    generateShortApiKey(length: number = 32): string {
        const randomString = crypto.randomBytes(length)
            .toString('base64url')
            .replace(/[^a-zA-Z0-9]/g, '');

        return `${randomString}`;
    }
    getRandomInt(min = 1000, max = 9000): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    async createSecretKey(workspaceId: string, user: PayloadJWT, data: CreateApiKeyDto) {
        const existingWorkspaceMember = await this.prisma.workspaceMember.findFirst({
            where: { workspaceId, userId: user.id }
        });
        if (!existingWorkspaceMember) {
            throw new ForbiddenException("Akses ditolak. Anda bukan bagian dari team ini.");
        }
        if (existingWorkspaceMember.role === "MEMBER") {
            throw new ForbiddenException("Akses ditolak. Role member tidak di izinkan untuk membuat api key.");
        }
        const secretKey = this.generateShortApiKey();
        const secretHash = crypto.createHash('sha256').update(secretKey).digest('hex');
        const newApiKey = await this.prisma.apiKey.create({
            data: {
                name: data.name,
                keyPrefix: `${this.keyPrefix}-${workspaceId}-${this.getRandomInt()}`,
                permissions: ["*"],
                workspaceId,
                createdById: user.id,
                secretHash: secretHash
            }
        });
        return {
            message: "Membuat key baru berhasil",
            data: { ...newApiKey },
            secretKey: secretKey
        }
    }
    async getAll(workspaceId: string, user: PayloadJWT) {
        const existingMember = await this.prisma.workspaceMember.findFirst({
            where: { workspaceId, userId: user.id }
        });
        if (!existingMember) {
            throw new ForbiddenException("Akses ditolak. Anda tidak terdaftar di workspace ini");
        }
        if (existingMember.role === "MEMBER") {
            throw new ForbiddenException("Akses ditolak. Role member tidak di izinkan.")
        }
        const [apikeys, totalApiKey]  = await this.prisma.$transaction([
            this.prisma.apiKey.findMany({ where: { workspaceId }}),
            this.prisma.apiKey.count({
                where: { workspaceId }
            })
        ]);
        return {
            total: totalApiKey,
            data: apikeys,
            totalPage: 1,
            nextId: null
        }
    }

    async deleteSecretKey(workspaceId: string, user: PayloadJWT, id: string) {
        const existingMember = await this.prisma.workspaceMember.findFirst({
            where: { workspaceId, userId: user.id }
        });
        if  (!existingMember) {
            throw new ForbiddenException("Akses ditolak. Anda tidak terdaftar di workspace ini.");
        }
        if (existingMember.role === "MEMBER") {
            throw new ForbiddenException("Akses ditolak. Role member tidak di izinkan untuk menghapus api key.");
        }
        await this.prisma.apiKey.delete({
            where: { workspaceId, id }
        });
        return {
            message: "Delete api key berhasil"
        }
    }
}