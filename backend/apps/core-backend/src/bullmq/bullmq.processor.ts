import { EventGateway } from "@core/event/event.gateway";
import { OrderService } from "@library/order/order.service";
import { StorageService } from "@library/storage/storage.service";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";



@Processor("queue")
export class BullmqProccessor extends WorkerHost {
    constructor(
        private readonly storage: StorageService,
        private readonly orderService: OrderService,
        private readonly eventGateway: EventGateway
    ) {
        super();
    }

    async process(job: Job, token?: string): Promise<any> {
        const data = job.data;

        switch (job.name) {
            case "file-cleanup":
                const { key, url } = data;
                await this.storage.cloudflareDeleteFile(key);
                break;
            case "create-order": 
                const { orderId, userId, workspaceId, data: order } = data;
                const newOrder = await this.orderService.prosessingOrder(workspaceId, orderId, order);
                this.eventGateway.newOrder(userId, newOrder);
                break;
        }
    }
}