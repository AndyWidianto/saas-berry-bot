import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { WhatsappService } from "./whatsapp.service";
import { ConfigService } from "@nestjs/config";
import { Logger, OnModuleInit } from "@nestjs/common";
import { SendMessageDto } from "@library/dto/message.dto";
import { WAMessage, WAPresence } from "@whiskeysockets/baileys";


@Processor("whatsapp-outgoing-queue")
export class WhatsappMessageProcessor extends WorkerHost implements OnModuleInit {
    private secretKey = "";
    private readonly logger = new Logger();
    constructor(
        private whatsappService: WhatsappService,
        private configService: ConfigService
    ) {
        super();
    }

    onModuleInit() {
        this.secretKey = this.configService.get<string>("SECRET_WHATSAPP") || "doweweipwip1ip29120190xkjwqowoqi";
    }

    async process(job: Job, token?: string): Promise<any> {
        this.logger.log("Memproses pesan masuk");
        const data = job.data;
        try {
            switch (job.name) {
                case "send-message":
                    const { instanceName, target, message } = job.data as SendMessageDto;
                    if (data.type === "text") {
                        await this.whatsappService.sendMessage(this.secretKey, { instanceName: instanceName, to: target, text: message });
                    }
                    break;
                case "presence-update":
                    const dataPrecence: { instanceName: string, status: WAPresence, target: string } = job.data;
                    await this.whatsappService.precenceUpdate(dataPrecence.instanceName, dataPrecence.status, dataPrecence.target);
                    break;
                case "read-message": 
                    await this.whatsappService.readMessage(data.instanceName, data.data);
                default:
                    break;
            }
        } catch (err) {
            throw err;
        }
    }
}