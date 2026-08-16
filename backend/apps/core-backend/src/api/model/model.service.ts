import { CreateAIModelDto, UpdateAIModelDto } from "@library/dto/model.dto";
import { PrismaService } from "@library/prisma/prisma.service";
import { PayloadJWT } from "@library/types";
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma } from "@prisma/client";


@Injectable()
export class ModelService {
    constructor(
        private prisma: PrismaService,
        private configService: ConfigService
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
        const limit = limitStr ? Number(limitStr) : 10;
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
            totalPage
        }
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

    async getAllAiLogs(workspaceId: string) {
        const [ailogs, totalAiLogs] = await this.prisma.$transaction([
            this.prisma.aiLog.findMany({
                where: { workspaceId }
            }),
            this.prisma.aiLog.count({
                where: { workspaceId }
            })
        ]);
        return {
            totalPage: 1,
            total: totalAiLogs,
            data: ailogs,
            nextId: null
        }
    }
}