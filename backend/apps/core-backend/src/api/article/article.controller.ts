import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ArticleService } from "./article.service";
import { CreateArticleDto } from "@library/dto/article.dto";
import type { RequestAndPayload } from "@library/types";
import { AuthGuard } from "@nestjs/passport";



@Controller("api/articles")
export class ArticleController {
    constructor(private service: ArticleService) {}

    @Get()
    @UseGuards(AuthGuard("jwt"))
    async getArticles(@Req() req: RequestAndPayload) {
        const user = req.user;
        return this.service.getAll(user);
    }

    @Get(":id")
    async getFirst(@Param("id") id: string) {
        return this.service.getFirst(id);
    }

    @Post()
    @UseGuards(AuthGuard("jwt"))
    async createArticle(@Body() data: CreateArticleDto, @Req() req: RequestAndPayload) {
        const user = req.user;  
        return await this.service.createArticle(user, data);
    }
}
