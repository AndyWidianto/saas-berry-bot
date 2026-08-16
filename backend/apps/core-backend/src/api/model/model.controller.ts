import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ModelService } from "./model.service";
import { AuthGuard } from "@nestjs/passport";
import { BuyTokenDto, CreateAIModelDto, UpdateAIModelDto } from "@library/dto/model.dto";
import type { RequestAndPayload } from "@library/types";



@Controller("api")
export class ModelController {

    constructor(private service: ModelService) { }

    @Get("aimodels")
    @UseGuards(AuthGuard("jwt"))
    async getAll(@Query() query: { search?: string, limit?: string, lastId?: string }) {
        return await this.service.getAll(query.search, query.search, query.lastId);
    }

    @Post("aimodels")
    @UseGuards(AuthGuard("jwt"))
    async createModel(@Body() data: CreateAIModelDto, @Req() req: RequestAndPayload) {
        const user = req.user;
        return await this.service.create(user, data);
    }

    @Patch("aimodels/:id")
    @UseGuards(AuthGuard("jwt"))
    async updateModel(@Body() data: UpdateAIModelDto, @Req() req: RequestAndPayload, @Param("id") id: string) {
        const user = req.user;
        return await this.service.update(user, id, data);
    }

    @Delete("aimodels/:id")
    @UseGuards(AuthGuard("jwt"))
    async deleteModel(@Req() req: RequestAndPayload, @Param("id") id: string) {
        const user = req.user;
        return await this.service.delete(user, id);
    }

    // @Post(":workspaceId/aimodels/:modelId/buy")
    // @UseGuards(AuthGuard("jwt"))
    // async buyTokens(@Body() body: BuyTokenDto, @Param() { workspaceId, modelId }: { workspaceId: string, modelId: string }) {
    //     return await this.service.buyToken(workspaceId, modelId, body.token);
    // }

    // @Get(":workspaceId/aimodels/tokenbalances")
    // async getTokenBalance(@Param("workspaceId") id: string) {
    //     return await this.service.getTokenBalance(id);
    // }

    @Get(":workspaceId/aimodels/ailogs")
    @UseGuards(AuthGuard("jwt"))
    async getAiLogs(@Param("workspaceId") id: string) {
        return await this.service.getAllAiLogs(id);
    }

}