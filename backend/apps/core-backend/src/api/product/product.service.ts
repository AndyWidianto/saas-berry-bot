import { CreateProductDto, UpdateProductDto } from "@library/dto/product.dto";
import { PrismaService } from "@library/prisma/prisma.service";
import { PayloadJWT } from "@library/types";
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { WorkspaceService } from "../workspace/workspace.service";
import { EmbeddingService } from "@library/shared/embedding.service";
import { StorageService } from "@library/storage/storage.service";
import { GetQueryDto } from "@library/dto/query.dto";
import { Prisma } from "@prisma/client";




@Injectable()
export class ProductService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly workspaceService: WorkspaceService,
        private readonly embeddingService: EmbeddingService,
        private readonly storage: StorageService,
    ) { }


    async create(user: PayloadJWT, workspaceId: string, data: CreateProductDto) {
        const workspace = await this.prisma.workspace.findFirst({
            where: { id: workspaceId },
            include: {
                embeddingModel: true
            },
        });
        if (!workspace) {
            throw new NotFoundException("Workspace not found");
        }
        const modelEmbedding = workspace.embeddingModel;
        if (!modelEmbedding) {
            throw new BadRequestException("Model embedding belum di setting.");
        }
        if (workspace.ownerId !== user.id) {
            throw new ForbiddenException("Anda bukan bagian dari team");
        }
        const product = await this.prisma.product.create({
            data: {
                ...data,
                workspaceId
            }
        });
        let rawText = "";
        Object.entries(product).forEach(([key, val]) => {
            rawText += `${key}: ${val}`;
        });
        const chunks = this.embeddingService.chunking(rawText);
        await this.embeddingService.createKnowledgeItemsProduct(workspaceId, product.id, chunks, modelEmbedding, workspace.plan, product.name);
        return {
            message: "Berhasil menambahkan product",
            data: product
        }
    }

    async update(user: PayloadJWT, workspaceId: string, id: string, data: UpdateProductDto) {
        const workspace = await this.prisma.workspace.findFirst({
            where: { id: workspaceId },
            include: {
                embeddingModel: true
            },
        });
        if (!workspace) {
            throw new NotFoundException("Workspace not found");
        }
        const modelEmbedding = workspace.embeddingModel;
        if (!modelEmbedding) {
            throw new BadRequestException("Model embedding belum di setting.");
        }
        if (workspace.ownerId !== user.id) {
            throw new ForbiddenException("Anda bukan bagian dari team");
        }
        const [findProduct, findKnowledgeItem] = await this.prisma.$transaction([
            this.prisma.product.findFirst({
                where: { id }
            }),
            this.prisma.knowledgeItem.findFirst({
                where: {
                    workspaceId,
                    productId: id
                }
            })
        ])
        if (!findProduct) {
            throw new NotFoundException("Product not found");
        }
        const product = await this.prisma.product.update({
            where: { id },
            data: data
        });
        await this.prisma.knowledgeItem.delete({
            where: { id: findKnowledgeItem?.id }
        });
        let rawText = "";
        Object.entries(product).forEach(([key, val]) => {
            rawText += `${key}: ${val}`;
        });
        const chunks = this.embeddingService.chunking(rawText);
        await this.embeddingService.createKnowledgeItemsProduct(workspaceId, product.id, chunks, modelEmbedding, workspace.plan, product.name);
        return {
            message: "Berhasil memperbarui product",
            data: product
        }
    }

    async delete(user: PayloadJWT, workspaceId: string, id: string) {
        const workspace = await this.prisma.workspace.findFirst({
            where: { id: workspaceId },
            include: {
                embeddingModel: true
            },
        });
        if (!workspace) {
            throw new NotFoundException("Workspace not found");
        }
        const modelEmbedding = workspace.embeddingModel;
        if (!modelEmbedding) {
            throw new BadRequestException("Model embedding belum di setting.");
        }
        if (workspace.ownerId !== user.id) {
            throw new ForbiddenException("Anda bukan bagian dari team");
        }
        const [findProduct, findKnowledgeItem] = await this.prisma.$transaction([
            this.prisma.product.findFirst({
                where: { id }
            }),
            this.prisma.knowledgeItem.findFirst({
                where: {
                    workspaceId,
                    productId: id
                }
            })
        ]);
        await this.prisma.$transaction([
            this.prisma.product.delete({
                where: { id: findProduct?.id }
            }),
            this.prisma.knowledgeItem.delete({
                where: { id: findKnowledgeItem?.id }
            })
        ]);
        return {
            message: "Berhasil menghapus product"
        }
    }

    async getAll(user: PayloadJWT, workspaceId: string, { limit, cursor, search, stockStatus } : GetQueryDto) {
        await this.workspaceService.validateRoleWorkspace(workspaceId, user.id);

        const take = limit ? limit : 20;
        const query: Prisma.ProductFindManyArgs = {
            where: { 
                workspaceId,
                ...(search ? { 
                    name: { contains: search, mode: "insensitive" },
                    description: { contains: search, mode: "insensitive" }
                } : {})
            },
            take: take,
            ...(cursor ? {
                cursor: { id: cursor },
                skip: 1
            } : {}),
            orderBy: {
                id: "desc"
            }
        }
        
        switch (stockStatus) {
            case "OUT_OF_STOCK": 
                query.where = {
                    ...query.where,
                    stock: 0
                }
                break;
            case "LOW_STOCK": 
                query.where = {
                    ...query.where,
                    stock: { lte: 20 }
                }
                break;
            default:
                break;
        }
        

        const [products, totalProduct] = await this.prisma.$transaction([
            this.prisma.product.findMany(query),
            this.prisma.product.count({
                where: query.where
            })
        ]);
        const totalPage = Math.ceil(totalProduct / take);
        const nextId = products.length >= take ? products[products.length - 1].id : null;
        return {
            data: products,
            total: totalProduct,
            totalPage,
            nextId
        }
    }
}