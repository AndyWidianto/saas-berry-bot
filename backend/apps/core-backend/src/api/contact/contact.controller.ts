import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ContactService } from "./contact.service";
import { AuthGuard } from "@nestjs/passport";





@Controller("api/:workspaceId/contacts")
export class ContactController {
    constructor(
        private service: ContactService
    ) {}

    @Get()
    @UseGuards(AuthGuard("jwt"))
    async getAll(@Param("workspaceId") workspaceId: string) {
        return await this.service.getAll(workspaceId);
    }
}