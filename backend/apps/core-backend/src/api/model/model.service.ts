import { CreateAIModelDto, UpdateAIModelDto } from "@library/dto/model.dto";
import { GetQueryDto } from "@library/dto/query.dto";
import { PrismaService } from "@library/prisma/prisma.service";
import { PayloadJWT } from "@library/types";
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma } from "@prisma/client";
import { WorkspaceService } from "../workspace/workspace.service";


@Injectable()
export class ModelService {
    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
        private workspaceService: WorkspaceService
    ) { }

    async create(user: PayloadJWT, data: CreateAIModelDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { id: user.id }
        });
        if (!existingUser) {
            throw new NotFoundException("User not found");
        }
        if (existingUser.role === "review" || existingUser.role === "user") {
            throw new ForbiddenException(`Akses ditolak. role ${existingUser.role} tidak diizinkan untuk menambahkan model.`)
        }
        const newAimodel = await this.prisma.aIModel.create({
            data: data
        });
        return {
            message: "Create model successfully",
            data: newAimodel,
        }
    }
    async getAll(search?: string, limitStr?: string, lastId?: string) {
        const limit = limitStr ? Number(limitStr) : 20;
        const query: Prisma.AIModelFindManyArgs = {
            where: {
                ...search ? {
                    name: { contains: search, mode: "insensitive" },
                } : {},
            },
            ...lastId ? {
                cursor: { id: lastId },
                skip: 1
            } : {},
            orderBy: {
                createdAt: "asc"
            }
        }
        const [aiModels, totalAIModels] = await this.prisma.$transaction([
            this.prisma.aIModel.findMany(query),
            this.prisma.aIModel.count({
                where: query.where
            })
        ]);
        const totalPage = Math.ceil(totalAIModels / limit);
        return {
            message: "successfully",
            data: aiModels,
            total: totalAIModels,
            nextId: aiModels.length >= limit ? aiModels[aiModels.length - 1].id : null,
            totalPage
        }
    }
    async getAllModelActive(search?: string, limitStr?: string, lastId?: string) {
        const kursRupiah = Number(this.configService.get<string>("KURS_RUPIAH")) || 17900;
        const limit = limitStr ? Math.max(1, Number(limitStr)) : 20;

        const whereCondition: Prisma.AIModelWhereInput = {
            isActive: true,
            ...(search && {
                name: { contains: search, mode: "insensitive" },
            }),
        };

        const query: Prisma.AIModelFindManyArgs = {
            where: whereCondition,
            take: limit, //  Sangat penting: membatasi jumlah data yang diambil
            ...(lastId && {
                cursor: { id: lastId },
                skip: 1,
            }),
            orderBy: {
                createdAt: "asc",
            },
        };

        const [aiModels, totalAIModels] = await this.prisma.$transaction([
            this.prisma.aIModel.findMany(query),
            this.prisma.aIModel.count({
                where: whereCondition,
            }),
        ]);

        const aimodelsMarkup = aiModels.map((am) => {
            const markup = am.tenantMarkup && am.tenantMarkup > 0 ? am.tenantMarkup : 1;

            return {
                ...am,
                inputPricePer1M: Math.round(am.inputPricePer1M * markup * kursRupiah),
                outputPricePer1M: Math.round(am.outputPricePer1M * markup * kursRupiah),
                tenantMarkup: 1,
            };
        });
        console.log(aimodelsMarkup);

        const hasNext = aiModels.length === limit;
        const nextId = hasNext ? aiModels[aiModels.length - 1].id : null;
        const totalPage = Math.ceil(totalAIModels / limit);

        return {
            message: "successfully",
            data: aimodelsMarkup,
            total: totalAIModels,
            nextId,
            totalPage,
        };
    }
    async update(user: PayloadJWT, id: string, data: UpdateAIModelDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { id: user.id }
        });
        if (!existingUser) {
            throw new NotFoundException("User not found");
        }
        if (existingUser.role === "review" || existingUser.role === "user") {
            throw new ForbiddenException(`Akses ditolak. role ${existingUser.role} tidak diizinkan untuk memperbarui model.`)
        }
        const existingModel = await this.prisma.aIModel.findUnique({
            where: { id }
        });
        if (!existingModel) {
            throw new NotFoundException("Model not found");
        }
        const updateModel = await this.prisma.aIModel.update({
            where: { id },
            data
        });
        return {
            message: "update model successfully",
            data: updateModel
        }
    }
    async delete(user: PayloadJWT, id: string) {
        const existingUser = await this.prisma.user.findUnique({
            where: { id: user.id }
        });
        if (!existingUser) {
            throw new NotFoundException("User not found");
        }
        if (existingUser.role === "review" || existingUser.role === "user") {
            throw new ForbiddenException(`Akses ditolak. role ${existingUser.role} tidak diizinkan untuk memperbarui model.`)
        }
        const existingModel = await this.prisma.aIModel.findUnique({
            where: { id }
        });
        if (!existingModel) {
            throw new NotFoundException("Model not found");
        }
        await this.prisma.aIModel.delete({
            where: { id }
        });
        return {
            message: "Delete model successfully"
        }
    }

    async getAllAiLogs(user: PayloadJWT, workspaceId: string, { limit, cursor, search }: GetQueryDto) {
        const workspace = await this.workspaceService.validateRoleWorkspace(workspaceId, user.id);
        const take = limit ? limit : 20;
        const query: Prisma.AiLogFindManyArgs = {
            where: {
                workspaceId,
                ...search ? {
                    answer: { contains: search, mode: "insensitive" },
                    question: { contains: search, mode: "insensitive" },
                    modelName: { contains: search, mode: "insensitive" }
                } : {}
            },
            ...cursor ? {
                cursor: { id: cursor },
                skip: 1
            } : {},
            take,
            orderBy: [
                // { id: "desc" },
                { createdAt: "desc" }
            ]
        }
        const [ailogs, totalAiLogs] = await this.prisma.$transaction([
            this.prisma.aiLog.findMany(query),
            this.prisma.aiLog.count({
                where: query.where
            })
        ]);
        return {
            totalPage: Math.ceil(totalAiLogs / take),
            total: totalAiLogs,
            data: ailogs,
            nextId: ailogs.length >= take ? ailogs[ailogs.length - 1].id : null
        }
    }

    async exportAILogs(user: PayloadJWT, workspaceId: string) {
        const workspace = await this.workspaceService.validateRoleWorkspace(workspaceId, user.id);
        const query: Prisma.AiLogFindManyArgs = {
            where: {
                workspaceId
            },
            orderBy: [
                // { id: "desc" },
                { createdAt: "desc" }
            ]
        }
        const ailogs = await this.prisma.aiLog.findMany(query);
        return {
            message: "Berhasil mengambil data",
            data: ailogs
        }
    }
}