import { Global, Module } from "@nestjs/common";
import { WorkspaceService } from "./workspace.service";
import { WorkspaceController } from "./workspace.controller";
import { BullModule } from "@nestjs/bullmq";


@Global()
@Module({
    providers: [WorkspaceService],
    controllers: [WorkspaceController],
    exports: [WorkspaceService],
    imports: [
        BullModule.registerQueue({
            name: "queue"
        })
    ]
})
export class WorkspaceModule {}