import { GetQueryDto } from "@library/dto/query.dto";
import { PrismaService } from "@library/prisma/prisma.service";
import { PayloadJWT } from "@library/types";
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { WorkspaceAdminService } from "./services/workspace.service";
import { UserAdminService } from "./services/user.service";
import { CreateUserDto } from "@library/dto/user.dto";


@Injectable()
export class AdminService {
    constructor(
        private prisma: PrismaService,
        private workspaceService: WorkspaceAdminService,
        private userService: UserAdminService
    ) {}

    async validateRole(user: PayloadJWT) {
        const existing = await this.prisma.user.findUnique({
            where: { id: user.id }
        });
        if (!existing) {
            throw new NotFoundException("User tidak ditemukan");
        }
        if (existing.role === "user" || existing.role === "review") {
            throw new ForbiddenException();
        }
        return existing;
    }

    async getWorkspaces(user: PayloadJWT, query: GetQueryDto) {
        await this.validateRole(user);
        const workspaces = await this.workspaceService.getWorkspaces(query);
        return {
            message: "successfully",
            ...workspaces
        }
    }

    async getUsers(user: PayloadJWT, query: GetQueryDto) {
        await this.validateRole(user);
        const users = await this.userService.getAll(query);
        return {
            message: "Successfully",
            ...users
        }
    }

    async createUser(user: PayloadJWT, data: CreateUserDto) {
        await this.validateRole(user);
        const newUser = await this.userService.createUser(data);
        return {
            message: "Sucessfully",
            data: newUser
        }
    }
}