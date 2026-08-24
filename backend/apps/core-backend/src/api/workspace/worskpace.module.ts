import { Global, Module } from "@nestjs/common";
import { WorkspaceService } from "./workspace.service";
import { WorkspaceController } from "./workspace.controller";


@Global()
@Module({
    providers: [WorkspaceService],
    controllers: [WorkspaceController],
    exports: [WorkspaceService]
})
export class WorkspaceModule {}