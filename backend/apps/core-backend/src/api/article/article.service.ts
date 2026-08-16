import { CreateArticleDto } from "@library/dto/article.dto";
import { PrismaService } from "@library/prisma/prisma.service";
import { PayloadJWT } from "@library/types";
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";




@Injectable()
export class ArticleService {
    constructor(private prisma: PrismaService) { }

    async getAll(user: PayloadJWT, search?: string, lastId?: string, limitStr?: string) {
        const existingUser = await this.prisma.user.findUnique({ where: { id: user.id } });
        if (!existingUser) {
            throw new NotFoundException("User not found");
        }
        if (existingUser.role === "user" || existingUser.role === "review") {
            throw new ForbiddenException(`Akses ditolak. Role ${existingUser.role} tidak diizinkan untuk membuat artikel.`);
        }
        const limit = limitStr ? Number(limitStr) : 10;
        const query: Prisma.ArticleFindManyArgs = {
            where: {
                ...search ? {
                    content: { contains: search, mode: "insensitive" },
                    title: { contains: search, mode: "insensitive" }
                } : {}
            },
            ...lastId ? {
                cursor: { id: lastId },
                skip: 1,
            } : {},
            take: limit,
            orderBy: {
                createdAt: "desc"
            }
        }
        const [articles, totalArticles] = await this.prisma.$transaction([
            this.prisma.article.findMany(query),
            this.prisma.article.count({
                where: query.where
            })
        ]);
        const totalPage = Math.ceil(totalArticles / limit);
        return {
            data: articles,
            totalPage,
            total: totalArticles,
            nextId: articles.length > 0 ? articles[articles.length - 1].id : null
        }
    }

    async getFirst(id: string) {
        const existing = await this.prisma.article.findFirst({
            where: { id }
        });
        if (!existing) {
            throw new BadRequestException("Article tidak ditemukan");
        }
        return {
            message: "Article ditemukan",
            data: existing
        };
    }
    async createArticle(user: PayloadJWT, data: CreateArticleDto) {
        const existingUser = await this.prisma.user.findUnique({ where: { id: user.id } });
        if (!existingUser) {
            throw new NotFoundException("User not found");
        }
        if (existingUser.role === "user" || existingUser.role === "review") {
            throw new ForbiddenException(`Akses ditolak. Role ${existingUser.role} tidak diizinkan untuk membuat artikel.`);
        }
        const { tagIds, slug, title, isPublished, publishedAt, ...articleData } = data;
        const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const finalPublishedAt = isPublished ? (publishedAt ? new Date(publishedAt) : new Date()) : null;

        const newArticle = await this.prisma.article.create({
            data: {
                ...articleData,
                title,
                slug: finalSlug,
                isPublished: isPublished ?? false,
                publishedAt: finalPublishedAt,
                tags: tagIds && tagIds.length > 0 ? {
                    create: tagIds.map((tagId) => ({
                        tag: {
                            connect: { id: tagId }
                        }
                    }))
                } : undefined
            },
            include: {
                tags: {
                    include: {
                        tag: true
                    }
                }
            }
        });
        return {
            message: "Article berhasil dibuat",
            data: newArticle
        }
    }
}