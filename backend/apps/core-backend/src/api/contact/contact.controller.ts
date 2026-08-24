import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ContactService } from "./contact.service";
import { AuthGuard } from "@nestjs/passport";
import { CreateWorkspaceContactDto, DeleteContactsDto } from "@library/dto/contact.dto";
import type { RequestAndPayload } from "@library/types";
import { GetQueryDto } from "@library/dto/query.dto";
import { SkipThrottle } from "@nestjs/throttler";





@Controller("api/:workspaceId/contacts")
export class ContactController {
    constructor(
        private service: ContactService
    ) {}

    @SkipThrottle()
    @Get()
    @UseGuards(AuthGuard("jwt"))
    async getAll(@Req() req: RequestAndPayload, @Param("workspaceId") workspaceId: string, @Query() query: GetQueryDto) {
        return await this.service.getAll(req.user, workspaceId, query);
    }

    @Get("export-pdf")
    @UseGuards(AuthGuard("jwt"))
    async exportToPdf(@Req() req: RequestAndPayload, @Param("workspaceId") workspaceId: string, @Query() query: GetQueryDto) {
        return await this.service.exportContactsPdf(req.user, workspaceId, query);
    }

    @Post() 
    @UseGuards(AuthGuard("jwt"))
    async addContact(@Req() req: RequestAndPayload, @Param("workspaceId") workspaceId: string, @Body() body: CreateWorkspaceContactDto) {
        return await this.service.addContactToWorkspace(req.user, workspaceId, body);
    }
    

    @Post("delete") 
    @UseGuards(AuthGuard("jwt"))
    async deleteContacts(@Req() req: RequestAndPayload, @Param("workspaceId") workspaceId: string, @Body() body: DeleteContactsDto) {
        return await this.service.deleteContacts(req.user, workspaceId, body.ids);
    }

    @Delete(":id") 
    @UseGuards(AuthGuard("jwt"))
    async deleteContact(@Req() req: RequestAndPayload, @Param("workspaceId") workspaceId: string, @Body() body: CreateWorkspaceContactDto) {
        return await this.service.addContactToWorkspace(req.user, workspaceId, body);
    }
}