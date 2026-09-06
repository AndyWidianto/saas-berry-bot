import { GetQueryDto } from "@library/dto/query.dto";
import type { RequestAndPayload } from "@library/types";
import { Body, Controller, Get, Post, Query, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AdminService } from "./admin.service";
import { CreateUserDto } from "@library/dto/user.dto";


@Controller("api/v1/admin")
export class AdminController {
    constructor(
        private readonly service: AdminService
    ) {}

    @Get("workspaces")
    @UseGuards(AuthGuard("jwt"))
    async getWorkspaces(@Req() req: RequestAndPayload, @Query() query: GetQueryDto) {
        return await this.service.getWorkspaces(req.user, query);
    }

    @Get("users")
    @UseGuards(AuthGuard("jwt")) 
    async getUsers(@Req() req: RequestAndPayload, @Query() query: GetQueryDto) {
        return await this.service.getUsers(req.user, query);
    }

    @Post("users")
    @UseGuards(AuthGuard("jwt")) 
    async createUser(@Req() req: RequestAndPayload, @Body() data: CreateUserDto) {
        return await this.service.createUser(req.user, data);
    }
}