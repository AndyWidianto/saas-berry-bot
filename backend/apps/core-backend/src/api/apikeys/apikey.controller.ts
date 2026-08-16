import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ApiKeyService } from "./apikey.service";
import { AuthGuard } from "@nestjs/passport";
import { CreateApiKeyDto } from "@library/dto/workspace.dto";
import type { RequestAndPayload } from "@library/types";



@Controller("api/:workspaceId/apikey")
export class ApiKeyController {
    constructor(
        private service: ApiKeyService
    ) { }

    @Post()
    @UseGuards(AuthGuard("jwt"))
    async createSecret(@Param("workspaceId") workspaceId: string, @Body() data: CreateApiKeyDto, @Req() req: RequestAndPayload) {
        const user = req.user;
        return await this.service.createSecretKey(workspaceId, user, data);
    }

    @Get()
    @UseGuards(AuthGuard("jwt"))
    async getAllSecret(@Param("workspaceId") workspaceId: string, @Req() req: RequestAndPayload) {
        const user = req.user;
        return await this.service.getAll(workspaceId, user);
    }

    @Delete(":id")
    @UseGuards(AuthGuard("jwt"))
    async deleteSecret(@Param() params: { id: string, workspaceId: string }, @Req() req: RequestAndPayload) {
        const user = req.user;
        return await this.service.deleteSecretKey(params.workspaceId, user, params.id);
    }
}