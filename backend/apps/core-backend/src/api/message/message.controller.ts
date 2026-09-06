import { Body, Controller, Get, Param, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { MessageService } from "./message.service";
import { AuthGuard } from "@nestjs/passport";
import { CreateMessageDto, SendMessageDto } from "../../../../lib/dto/message.dto";
import { SkipThrottle } from "@nestjs/throttler";
import type { RequestAndPayload } from "@library/types";
import { GetQueryDto } from "@library/dto/query.dto";
import { FileInterceptor } from "@nestjs/platform-express";


@Controller("api/:workspaceId/messages")
export class MessageController {
    constructor(private service: MessageService) {}

    // @Post()
    // @UseGuards(AuthGuard("jwt"))
    // async createMessage(@Body() body: CreateMessageDto) {
    //     return this.service.create({...body, fromMe: true });
    // }

    @SkipThrottle()
    @Get("stats")
    @UseGuards(AuthGuard("jwt"))
    async getStats() {
        return this.service.Stats();
    }

    @Post("sendMessage")
    @UseGuards(AuthGuard("jwt"))
    async sendMessage(@Param("workspaceId") workspaceId: string, @Body() body: CreateMessageDto, @Req() req: RequestAndPayload) {
        return this.service.sendMessage(req.user, workspaceId, body)
    }


    @Post("upload")
    @UseGuards(AuthGuard("jwt")) 
    @UseInterceptors(FileInterceptor("file"))
    async upload(
        @Param("workspaceId") workspaceId: string, 
        @UploadedFile("file") file: Express.Multer.File,
        @Req() req: RequestAndPayload
    ) {
        return await this.service.uploadFile(req.user, workspaceId, file);
    }

    @Get(":contactId")
    @UseGuards(AuthGuard("jwt"))
    async getMessages(
        @Param() params: { workspaceId: string, contactId: string },
        @Req() req: RequestAndPayload,
        @Query() query: GetQueryDto
    ) {
        return this.service.getMessages(req.user, params.workspaceId, params.contactId, query)
    }
}