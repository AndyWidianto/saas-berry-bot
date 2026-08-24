import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { WorkspaceService } from "./workspace.service";
import type { RequestAndPayload } from "../../../../lib/types";
import { CreateMemberDto, CreateWorkspaceDto, UpdateWorkspaceDto } from "../../../../lib/dto/workspace.dto";
import { AuthGuard } from "@nestjs/passport";
import { SkipThrottle } from "@nestjs/throttler";



@Controller("api/workspaces")
export class WorkspaceController {
    constructor(private service: WorkspaceService) { }

    @Post()
    @UseGuards(AuthGuard("jwt"))
    async createWorkspace(@Req() req: RequestAndPayload, @Body() body: CreateWorkspaceDto) {
        const user = req.user;
        return await this.service.create(user, body);
    }

    @SkipThrottle()
    @Get()
    @UseGuards(AuthGuard("jwt"))
    async getAllWorkspace(@Req() req: RequestAndPayload, @Query() query: { search?: string, limit?: string, order?: "DESC" | "ASC", lastId?: string }) {
        const user = req.user;
        return await this.service.getAll(user, query.search, query.limit, query.lastId, query.order);
    }

    @Patch(":id")
    @UseGuards(AuthGuard("jwt"))
    async updateWorkspace(@Req() req: RequestAndPayload, @Param("id") id: string, @Body() body: UpdateWorkspaceDto) {
        const user = req.user;
        return await this.service.update(user, id, body);
    }

    @Delete(":id")
    @UseGuards(AuthGuard("jwt"))
    async deleteWorkspace(@Req() req: RequestAndPayload, @Param("id") id: string) {
        const user = req.user;
        return await this.service.delete(user, id);
    }

    @SkipThrottle()
    @Get(":id/members")
    @UseGuards(AuthGuard("jwt"))
    async getWorkspaceMembers(@Req() req: RequestAndPayload, @Param("id") id: string) {
        const user = req.user;
        return await this.service.getWorkspaceMembers(id, user);
    }

    @Post(":id/members")
    @UseGuards(AuthGuard("jwt"))
    async createWorkspaceMember(@Req() req: RequestAndPayload, @Param("id") id: string, @Body() data: CreateMemberDto) {
        const user = req.user;
        return await this.service.createTeam(id, user, data);
    }

    @Delete(":id/members/reject")
    @UseGuards(AuthGuard("jwt"))
    async rejectWorkspace(@Req() req: RequestAndPayload, @Param() params: { id: string }) {
        const user = req.user;
        return await this.service.rejectWorkspace(params.id, user);
    }

    @Patch(":id/members/accept")
    @UseGuards(AuthGuard("jwt"))
    async acceptWorkspace(@Req() req: RequestAndPayload, @Param() params: { id: string }) {
        const user = req.user;
        return await this.service.acceptWorkspace(params.id, user);
    }
}

