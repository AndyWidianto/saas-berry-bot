import { NodemailerService } from "@library/nodemailer/nodemailer.service";
import { CreateMemberDto, CreateWorkspaceDto, NotificationSettingType, UpdateWorkspaceDto } from "../../../../lib/dto/workspace.dto";
import { PrismaService } from "../../../../lib/prisma/prisma.service";
import { PayloadJWT, WorkspaceWithModels, KnowledgeChunk } from "../../../../lib/types";
import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { AIModel, Prisma, Workspace } from "@prisma/client";
import InviteEmail from "@library/mail/templates/InviteMember";
import React from "react";
import { render } from "@react-email/components";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import { Decimal } from "@prisma/client/runtime/library";
import { ConfigService } from "@nestjs/config";
import { CryptoService } from "@library/crypto/crypto.service";
import { StorageService } from "@library/storage/storage.service";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { ProductSettings } from "@library/dto/product.dto";


@Injectable()
export class WorkspaceService {
    constructor(
        private prisma: PrismaService,
        private nodemailerService: NodemailerService,
        private configService: ConfigService,
        private readonly crypto: CryptoService,
        private readonly storage: StorageService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        @InjectQueue("queue") private readonly serviceQueue: Queue
    ) { }

    async validateRoleWorkspace(workspaceId: string, userId: string) {
        const keyWorkspaceValidate = `validate:${workspaceId}:${userId}`;
        let existingWorkspace = await this.cacheManager.get<Workspace>(keyWorkspaceValidate);
        if (!existingWorkspace) {
            const findWorkspace = await this.prisma.workspace.findFirst({
                where: { id: workspaceId }
            });
            if (!findWorkspace) {
                throw new NotFoundException("Workspace not found");
            }
            existingWorkspace = findWorkspace;
        }
        if (existingWorkspace?.ownerId !== userId) {
            throw new ForbiddenException("Akses ditolak. Anda bukan bagian dari workspace ini.")
        }
        this.cacheManager.set(keyWorkspaceValidate, existingWorkspace, 1000 * 60 * 5);
        return existingWorkspace;
    }
    generateSlug(name: string): string {
        if (!name) return '';
        return name
            .toLowerCase()
            .trim()                             //  Hapus spasi di awal dan akhir teks
            .normalize('NFD')                   //  Pisahkan karakter beraksen (misal: é menjadi e + aksen)
            .replace(/[\u0300-\u036f]/g, '')     //  Hapus aksen tersebut
            .replace(/[^a-z0-9\s-]/g, '')       //  Hapus semua karakter khusus kecuali huruf, angka, spasi, dan minus
            .replace(/[\s_]+/g, '-')            //  Ubah spasi dan underscore menjadi satu tanda hubung (-)
            .replace(/-+/g, '-')                //  Satukan tanda hubung yang dobel (misal: "a--b" menjadi "a-b")
            .replace(/^-+|-+$/g, '');           //  Hapus tanda hubung jika ada di paling awal atau paling akhir
    }
    async create(user: PayloadJWT, data: CreateWorkspaceDto) {
        const findUser = await this.prisma.user.findFirst({
            where: { id: user.id }
        });
        if (!findUser) {
            throw new ForbiddenException("user not found");
        }
        const [modelChat, modelEmebd] = await this.prisma.$transaction([
            this.prisma.aIModel.findFirst({
                where: { isChat: true, isActive: true },
                orderBy: {
                    inputPricePer1M: "asc"
                }
            }),
            this.prisma.aIModel.findFirst({
                where: { isEmbedding: true, isActive: true },
                orderBy: {
                    inputPricePer1M: "asc"
                }
            })
        ]);
        const newWorkspace = await this.prisma.workspace.create({
            data: {
                name: data.name,
                ownerId: user.id,
                members: {
                    create: {
                        role: "OWNER",
                        userId: user.id
                    }
                },
                activeEmbeddingModelId: modelEmebd?.id,
                activeChatModelId: modelChat?.id,
                notificationSettings: {
                    ai_escalation: true,
                    billing_alert: true,
                    team_update: true
                } as Record<NotificationSettingType, boolean>
            }
        });
        return {
            message: "create workspace successfully",
            data: newWorkspace
        }
    }
    async update(user: PayloadJWT, id: string, data: UpdateWorkspaceDto) {
        const findUser = await this.prisma.user.findFirst({
            where: { id: user.id }
        });
        if (!findUser) {
            throw new ForbiddenException("user not found");
        }
        const findWorkspace = await this.getOne(id);
        if (findWorkspace.ownerId !== user.id) {
            throw new ForbiddenException("you not allowed to update workspace");
        }
        const { workingHours, notificationSettings, productSettings, ...restDto } = data;
        if (productSettings && productSettings.deliveryMethod && productSettings.deliveryMethod.rajaOngkirConfig
            && productSettings.deliveryMethod.rajaOngkirConfig.apiKey
        ) {
            const encrypt = this.crypto.encrypt(productSettings.deliveryMethod.rajaOngkirConfig.apiKey);
            productSettings.deliveryMethod.rajaOngkirConfig.apiKey = encrypt;
        }
        const newFilename = productSettings?.paymentMethod?.qris?.filename;

        if (productSettings && newFilename) {
            const existingProductSettings = findWorkspace.productSettings as unknown as ProductSettings;
            const oldFilename = existingProductSettings?.paymentMethod?.qris?.filename;
            if (oldFilename && oldFilename !== newFilename) {
                await this.storage.cloudflareDeleteFile(oldFilename);
                await this.serviceQueue.remove(`cleanup-${oldFilename}`);
            }

            const newJobId = `cleanup-${newFilename}`;
            await this.serviceQueue.remove(newJobId);
        }
        const updatedWorkspace = await this.prisma.workspace.update({
            where: { id },
            data: {
                ...restDto,
                ...(workingHours && { workingHours: workingHours as unknown as Prisma.InputJsonValue }),
                ...(notificationSettings && { notificationSettings: notificationSettings as unknown as Prisma.InputJsonValue }),
                ...(productSettings && {
                    productSettings: productSettings as unknown as Prisma.InputJsonValue
                })
            },
        });
        await this.cacheManager.del(findWorkspace.id);
        return {
            message: "update workspace successfully",
            data: updatedWorkspace
        }
    }
    async getAll(
        user: PayloadJWT,
        search?: string,
        limitStr?: string,
        lastId?: string,
        order?: "DESC" | "ASC"
    ) {
        const limit = limitStr ? Number(limitStr) : 10;
        const orderBy: "asc" | "desc" = order?.toLowerCase() === "desc" ? "desc" : "asc";

        const whereCondition: Prisma.WorkspaceMemberWhereInput = {
            userId: user.id,
            ...(search
                ? {
                    workspace: {
                        name: { contains: search, mode: "insensitive" },
                    },
                }
                : {}),
            status: "ACTIVE"
        };

        const [members, totalWorkspaces] = await this.prisma.$transaction([
            this.prisma.workspaceMember.findMany({
                where: whereCondition,
                take: limit,
                ...(lastId
                    ? {
                        cursor: { id: lastId },
                        skip: 1,
                    }
                    : {}),
                orderBy: {
                    workspace: {
                        createdAt: orderBy,
                    },
                },
                include: {
                    workspace: true,
                },
            }),
            this.prisma.workspaceMember.count({
                where: whereCondition,
            }),
        ]);
        const workspace = members.map(m => m.workspace);
        return {
            message: "successfully",
            total: totalWorkspaces,
            data: workspace,
            nextId: members.length > 0 ? members[members.length - 1].id : null,
        };
    }
    async getOne(id: string) {
        const existing = await this.prisma.workspace.findFirst({
            where: { id }
        });
        if (!existing) {
            throw new NotFoundException("Workspace not found");
        }
        return existing;
    }
    async delete(user: PayloadJWT, id: string) {
        const findUser = await this.prisma.user.findFirst({
            where: { id: user.id }
        });
        if (!findUser) {
            throw new ForbiddenException("user not found");
        }
        const findWorkspace = await this.getOne(id);
        if (findWorkspace.ownerId !== user.id) {
            throw new ForbiddenException("you not allowed to delete workspace");
        }
        await this.prisma.workspace.delete({
            where: {
                id: findWorkspace.id,
            }
        });
        return {
            message: "delete Workspace successfully",
            status: "success"
        }
    }

    async getWorkspaceMembers(workspaceId: string, user: PayloadJWT) {
        const existingMember = await this.prisma.workspaceMember.findFirst({
            where: { userId: user.id }
        });
        if (!existingMember) {
            throw new ForbiddenException("Akses ditolak. Anda bukan bagian dari workspace ini.");
        }
        const query: Prisma.WorkspaceMemberFindManyArgs = {
            where: {
                workspaceId: workspaceId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profileUrl: true,
                    }
                }
            }
        };
        const [members, totalMember] = await this.prisma.$transaction([
            this.prisma.workspaceMember.findMany(query),
            this.prisma.workspaceMember.count({
                where: query.where
            })
        ]);
        return {
            data: members,
            total: totalMember,
            totalPage: 1,
            nextId: null
        }
    }

    async createTeam(workspaceId: string, user: PayloadJWT, data: CreateMemberDto) {
        const existingMember = await this.prisma.workspaceMember.findFirst({
            where: {
                userId: user.id,
                workspaceId: workspaceId
            },
            include: {
                workspace: true
            }
        });

        if (!existingMember) {
            throw new ForbiddenException("Akses ditolak. Anda tidak terdaftar di workspace ini");
        }

        if (existingMember.role === "MEMBER") {
            throw new ForbiddenException("Akses ditolak. Role member tidak memiliki izin untuk menambah anggota");
        }

        const existingUser = await this.prisma.user.findFirst({
            where: { email: data.email }
        });

        if (!existingUser) {
            throw new NotFoundException("User dengan email tersebut tidak ditemukan");
        }

        const isAlreadyMember = await this.prisma.workspaceMember.findFirst({
            where: {
                userId: existingUser.id,
                workspaceId: workspaceId
            }
        });

        if (isAlreadyMember) {
            throw new ConflictException("User tersebut sudah menjadi anggota di workspace ini");
        }
        const newMember = await this.prisma.workspaceMember.create({
            data: {
                userId: existingUser.id,
                role: data.role ?? "MEMBER",
                workspaceId,
                status: "INVITED",
                invitedBy: user.name,
                invitedEmail: user.email,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true
                    }
                }
            }
        });
        const emailHtml = await render(
            React.createElement(InviteEmail, {
                workspaceName: existingMember.workspace.name,
                inviteLink: this.configService.get<string>("API_BACKEND_CORE") || "http://localhost:4000",
            })
        );
        const subject = `Undangan Menjadi ${data.role || 'Member'} di Workspace`;
        await this.nodemailerService.sendMail(data.email, subject, emailHtml);

        return {
            message: "Berhasil mengundang anggota baru ke workspace",
            data: newMember
        };
    }

    async getWorkspace(workspaceId: string) {
        let existingWorkspace: WorkspaceWithModels | null | undefined = await this.cacheManager.get(workspaceId);
        if (existingWorkspace && existingWorkspace.workspaceBalances) {
            existingWorkspace.workspaceBalances.amount = new Decimal(existingWorkspace.workspaceBalances.amount);
        }
        if (!existingWorkspace) {
            const now = new Date();
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

            existingWorkspace = await this.prisma.workspace.findFirst({
                where: { id: workspaceId },
                include: {
                    chatModel: true,
                    embeddingModel: true,
                    workspaceBalances: true,
                    messages: {
                        where: {
                            createdAt: { gte: oneDayAgo }
                        },
                        take: 5,
                        orderBy: { createdAt: "desc" }
                    },
                },
            });
            if (!existingWorkspace) return null;
        }
        return existingWorkspace;
    }

    async updateCacheWorkspace(workspaceId: string, workspace: WorkspaceWithModels) {
        await this.cacheManager.set(workspaceId, workspace, 1000 * 60 * 5);
    }

    async rejectWorkspace(workspaceId: string, user: PayloadJWT) {
        const existingMember = await this.prisma.workspaceMember.findFirst({ where: { userId: user.id, workspaceId } });
        if (!existingMember) {
            throw new NotFoundException("Member not found");
        }
        await this.prisma.workspaceMember.delete({
            where: { id: existingMember.id }
        });
        return { message: "Delete member successfully" }
    }
    async acceptWorkspace(workspaceId: string, user: PayloadJWT) {
        const existingMember = await this.prisma.workspaceMember.findFirst({ where: { userId: user.id, workspaceId } });
        if (!existingMember) {
            throw new NotFoundException("Member not found");
        }
        const newMember = await this.prisma.workspaceMember.update({
            where: { id: existingMember.id },
            data: {
                status: "ACTIVE",
            }
        });
        return {
            message: "Successfully",
            data: newMember
        }
    }

    async uploadFile(user: PayloadJWT, workspaceId: string, file: Express.Multer.File) {
        await this.validateRoleWorkspace(workspaceId, user.id);
        if (!file) {
            throw new BadRequestException("File is required");
        }
        const filename = `${Date.now()}${file.originalname}`
        const url = await this.storage.cloudflareUploadFile(file, filename);
        await this.serviceQueue.add(
            'file-cleanup', // Nama Job (Kategori)
            {
                key: filename,
                url: url
            },
            {
                delay: 1000 * 60 * 5, // 5 menit
                jobId: `cleanup-${filename}`, // ID UNIK (Wajib untuk pembatalan!)
                removeOnComplete: true,
                removeOnFail: true // Disarankan agar Redis tidak penuh jika ada error
            }
        );
        return {
            url,
            thumbnail: filename
        }
    }
}