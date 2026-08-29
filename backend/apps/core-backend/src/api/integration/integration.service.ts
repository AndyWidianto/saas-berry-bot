import { CreateIntegrationDto, UpdateIntegrationDto } from "@library/dto/integration.dto";
import { PrismaService } from "@library/prisma/prisma.service";
import { PayloadJWT } from "@library/types";
import { WhatsappGatewayService } from "@library/whatsapp.gateway/whatsapp.gateway.service";
import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PlatformType, Prisma, StatusIntegration } from "@prisma/client";
import axios from "axios";
import { WorkspaceService } from "../workspace/workspace.service";



@Injectable()
export class IntegrationService {
    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
        private whatsappGatewayService: WhatsappGatewayService,
        private workspaceService: WorkspaceService
    ) { }

    async validateRole(user: PayloadJWT, workspaceId: string) {
        const existing = await this.prisma.workspaceMember.findFirst({
            where: { userId: user.id, workspaceId }
        });
        if (!existing) {
            throw new ForbiddenException("Akses ditolak. anda bukan bagian dari workspace ini.")
        }
        if (existing.role === "MEMBER") {
            throw new ForbiddenException("Akses ditolak. Role member tidak diizinkan untuk merubah data.");
        }
        return existing;
    }
    async create(user: PayloadJWT, workspaceId: string, data: CreateIntegrationDto) {
        const workspace = await this.workspaceService.validateRoleWorkspace(workspaceId, user.id);
        let dataToSave = {
            name: data.name,
            instanceName: `${workspaceId}-${data.platform}`,
            platform: data.platform,
            number: data.number,
            settings: data.settings,
            status: "CONNECTING" as StatusIntegration,
            email: data.email,
            workspaceId: workspaceId
        }
        const existing = await this.prisma.integration.findFirst({
            where: { instanceName: dataToSave.instanceName, workspaceId }
        });
        if (existing) {
            throw new NotFoundException("WhatsApp (Unofficial) is already");
        }

        const validPlatforms = ["WHATSAPP_BAYLIES", "EMAIL", "WHATSAPP"];
        if (!validPlatforms.includes(data.platform)) {
            throw new BadRequestException("platform is not found");
        }
        const integration = await this.prisma.integration.create({
            data: dataToSave
        });
        if (data.platform === "WHATSAPP_BAYLIES") {
            await this.whatsappGatewayService.createWhatsappBaileys(workspaceId, dataToSave.instanceName);
        }
        if (data.platform === "EMAIL") {
            dataToSave.instanceName = `${workspaceId}-EMAIL`;
        }
        if (data.platform === "WHATSAPP") {
            dataToSave.instanceName = `${workspace.name.split(" ").join("").toLowerCase()}-${data.platform}`;
        }
        return {
            message: `Berhasil membuat integration ke ${data.platform === "WHATSAPP_BAYLIES" ? 'WhatsApp (Unofficial)' : data.platform}`,
            data: integration
        }
    }

    async deleteWhatsappNonofficial(user: PayloadJWT, workspaceId: string, id: string) {
        const member = await this.validateRole(user, workspaceId);

        const existing = await this.prisma.integration.findUnique({
            where: { id }
        });
        if (!existing) {
            throw new NotFoundException("Device not found");
        }
        if (existing.platform === "WHATSAPP_BAYLIES") {
            await this.whatsappGatewayService.deleteWhatsApp(workspaceId);
        }
        await this.prisma.integration.delete({
            where: { id }
        });
        return {
            message: `Berhasil hapus device ${existing.platform === "WHATSAPP_BAYLIES" ? "WhatsApp (Nonofficial)" : existing.platform}`
        }
    }

    async getAll(user: PayloadJWT, workspaceId: string, search?: string, lastId?: string) {
        await this.validateRole(user, workspaceId);
        const query: Prisma.IntegrationFindManyArgs = {
            where: {
                ...search ? {
                    name: { contains: search, mode: "insensitive" },
                } : {},
                workspaceId: workspaceId
            },
            ...lastId ? {
                cursor: {
                    id: lastId,
                },
                skip: 1,
            } : {}
        }

        const [integrations, totalIntegration] = await this.prisma.$transaction([
            this.prisma.integration.findMany(query),
            this.prisma.integration.count({
                where: query.where
            })
        ]);
        return {
            message: "successfully",
            data: integrations,
            totalPage: 1,
            total: totalIntegration,
            nextId: integrations.length > 0 ? integrations[integrations.length - 1].id : null
        }
    }

    async update(user: PayloadJWT, workspaceId: string, paltform: PlatformType, data: UpdateIntegrationDto) {
        await this.validateRole(user, workspaceId);
        const existing = await this.prisma.integration.findFirst({
            where: {
                workspaceId: workspaceId,
                platform: paltform
            }
        });
        if (!existing) {
            throw new NotFoundException("Integration not found");
        }
        const updateIntegration = await this.prisma.integration.update({
            where: { workspaceId, id: existing.id },
            data: data
        });
        return {
            message: "Update successfully",
            data: updateIntegration
        }
    }
    async getQrcodeWhatsapp(user: PayloadJWT, workspaceId: string) {
        await this.validateRole(user, workspaceId);
        return await this.whatsappGatewayService.getQrcodeWhatsapp(workspaceId);
    }
}