import { CreateIntegrationDto, UpdateIntegrationDto } from "@library/dto/integration.dto";
import { PrismaService } from "@library/prisma/prisma.service";
import { PayloadJWT } from "@library/types";
import { WhatsappGatewayService } from "@library/whatsapp.gateway/whatsapp.gateway.service";
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PlatformType, Prisma, StatusIntegration } from "@prisma/client";
import axios from "axios";



@Injectable()
export class IntegrationService {
    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
        private whatsappGatewayService: WhatsappGatewayService
    ) { }

    async create(workspaceId: string, data: CreateIntegrationDto) {
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
            where: { instanceName: dataToSave.instanceName }
        });
        if (existing) {
            throw new NotFoundException("Whatsapp Bailyes is already");
        }

        const validPlatforms = ["WHATSAPP_BAYLIES", "EMAIL"];
        if (!validPlatforms.includes(data.platform)) {
            throw new BadRequestException("platform is not found");
        }
        if (data.platform === "WHATSAPP_BAYLIES") {
            await this.whatsappGatewayService.createWhatsappBaileys(workspaceId, dataToSave.instanceName);
        }
        if (data.platform === "EMAIL") {
            dataToSave.instanceName = `${workspaceId}-EMAIL`;
        }
        const integration = await this.prisma.integration.create({
            data: dataToSave
        });
        return {
            message: "success create Whatsapp baylies",
            data: integration
        }
    }

    async getAll(workspaceId: string, search?: string, lastId?: string) {

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

    async update(workspaceId: string, paltform: PlatformType, data: UpdateIntegrationDto) {
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
}