import { CreateKnowledgeDto, CreateKnowledgeUrlDto, UpdateKnowledgeDto } from "../../../../lib/dto/knowledge";
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { FileInterceptor } from "@nestjs/platform-express";
import { KnowledgeService } from "./knowledge.service";
import type { RequestAndPayload } from "../../../../lib/types";
import { SkipThrottle } from "@nestjs/throttler";


@Controller("api/:workspaceId/knowledges")
export class KnowledgeController {
    constructor(private service: KnowledgeService) { }

    @UseGuards(AuthGuard("jwt"))
    @Post()
    @UseInterceptors(FileInterceptor("file"))
    async CreateKnowledgeAI(@Req() req: RequestAndPayload, @Param("workspaceId") workspaceId: string, @UploadedFile("file") file: Express.Multer.File) {
        const user = req.user;
        return this.service.createKnowledge(user, workspaceId, { file });
    }

    @UseGuards(AuthGuard("jwt"))
    @Post("url")
    async CreateKnowledgeAIFromURL(@Req() req: RequestAndPayload, @Param("workspaceId") workspaceId: string, @Body() body: CreateKnowledgeUrlDto) {
        const user = req.user;
        return this.service.createKnowledgeFromURL(user, workspaceId, body);
    }


    @UseGuards(AuthGuard("jwt"))
    @Delete(":id")
    async deleteKnowlege(@Req() req: RequestAndPayload, @Param() { id, workspaceId }: { id: string, workspaceId: string }) {
        const user = req.user;
        return this.service.deleteKnowledge(user, workspaceId, id);
    }

    @SkipThrottle()
    @UseGuards(AuthGuard("jwt"))
    @Get()
    async Knowledges(@Param("workspaceId") workspaceId: string, @Query() query: { lastId: string, limit: string, search: string }) {
        return this.service.getAllKnowledge(workspaceId, query.lastId, query.limit, query.search);
    }
}