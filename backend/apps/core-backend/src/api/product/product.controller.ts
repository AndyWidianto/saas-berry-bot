import { CreateProductDto, UpdateProductDto } from "@library/dto/product.dto";
import type { RequestAndPayload } from "@library/types";
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ProductService } from "./product.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { AuthGuard } from "@nestjs/passport";
import { GetQueryDto } from "@library/dto/query.dto";
import { SkipThrottle } from "@nestjs/throttler";


@Controller("api/:workspaceId/products")
export class ProductController {
    constructor(private readonly service: ProductService) {}

    @Post()
    @UseGuards(AuthGuard("jwt"))
    async create(
        @Param("workspaceId") workspaceId: string,
        @Req() req: RequestAndPayload,
        @Body() body: CreateProductDto
    ) {
        return await this.service.create(req.user, workspaceId, body);
    }

    @Patch(":id")
    @UseGuards(AuthGuard("jwt"))
    async update(
        @Param() params: { workspaceId: string, id: string },
        @Req() req: RequestAndPayload,
        @Body() body: UpdateProductDto
    ) {
        return await this.service.update(req.user, params.workspaceId, params.id, body);
    }

    @Delete(":id")
    @UseGuards(AuthGuard("jwt"))
    async delete(
        @Param() params: { workspaceId: string, id: string },
        @Req() req: RequestAndPayload,
    ) {
        return await this.service.delete(req.user, params.workspaceId, params.id);
    }

    @SkipThrottle()
    @Get()
    @UseGuards(AuthGuard("jwt"))
    async getAll(
        @Param() params: { workspaceId: string },
        @Req() req: RequestAndPayload,
        @Query() query: GetQueryDto
    ) {
        return await this.service.getAll(req.user, params.workspaceId, query);
    }
}