import { Module } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { UserAdminService } from "./services/user.service";
import { WorkspaceAdminService } from "./services/workspace.service";
import { AdminController } from "./admin.controller";


@Module({
    providers: [
        AdminService,
        UserAdminService,
        WorkspaceAdminService
    ],
    controllers: [
        AdminController,
    ],
})
export class AdminModule {}
