import { MessageMediaDto, MessageTextDto, SendMessageDto } from "@library/dto/message.dto";
import { HttpException, Injectable, InternalServerErrorException, Logger, NotFoundException, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";



@Injectable()
export class WhatsappGatewayService implements OnModuleInit {
    private baseUrl = "";
    private secretKey = "";
    private logger = new Logger();
    constructor(
        private configService: ConfigService
    ) { }

    onModuleInit() {
        this.baseUrl = this.configService.get<string>("BASE_URL_WHATSAPP") || "http://localhost:4000";
        this.secretKey = this.configService.get<string>("SECRET_WHATSAPP") || "eweowepoqepqeopq";
    }

    async sendMessage(workspaceId: string, data: MessageTextDto) {
        try {
            const res = await axios.post(`${this.baseUrl}/${workspaceId}/whatsapp/sendMessage`, data, {
                headers: {
                    "secret-key": this.secretKey
                }
            });
            const result = res.data;
            return result;
        } catch (err) {
            if (axios.isAxiosError(err)) {
                this.logger.error("Error: ", err.status);
            }
            console.error("Fetch error: ", err);
        }
    }

    async sendMedia(workspaceId: string, data: MessageMediaDto) {
        try {
            const res = await axios.post(`${this.baseUrl}/${workspaceId}/whatsapp/sendMedia`, data, {
                headers: {
                    "secret-key": this.secretKey
                }
            });
            const result = res.data;
            return result;
        } catch (err) {
            if (axios.isAxiosError(err)) {
                this.logger.error("Error: ", err.status);
            }
            console.error("Fetch error: ", err);
        }
    }

    async createWhatsappBaileys(workspaceId: string, instanceName: string) {
        try {
            const res = await axios.post(`${this.baseUrl}/${workspaceId}/whatsapp/create`, { instanceName }, {
                headers: {
                    "secret-key": this.secretKey
                }
            });
            console.log(res.data);
        } catch (err) {
            console.error(err);
            if (axios.isAxiosError(err)) {
                if (err.status === 500) {
                    throw new InternalServerErrorException(err);
                }
                const message = err.response?.data.message || "Gagal terhubung ke WhatsApp (Unofficial)";
                throw new HttpException(message, err.status || 400);
            }
        }
    }

    async getQrcodeWhatsapp(workspaceId: string) {
        try {
            const res = await axios.get(`${this.baseUrl}/${workspaceId}/whatsapp/qrcode/${workspaceId}-WHATSAPP_BAYLIES`, {
                headers: {
                    "secret-key": this.secretKey
                }
            });
            const data = res.data;
            return {
                message: "successfully",
                data: data
            }
        } catch (err) {
            console.error(err);
            if (axios.isAxiosError(err)) {
                const statusCode = err.response?.status;
                const message = err.response?.data.message;
                if (statusCode === 404) {
                    throw new NotFoundException(message || "Qrcode not found");
                }
            }
            throw new InternalServerErrorException(err);
        }
    }

    async deleteWhatsApp(workspaceId: string) {
        try {
            const res = await axios.delete(`${this.baseUrl}/${workspaceId}/whatsapp/${workspaceId}-WHATSAPP_BAYLIES`, {
                headers: {
                    "secret-key": this.secretKey
                }
            });
            const data = res.data;
            return {
                message: "successfully",
                data: data
            }
        } catch (err) {
            console.error(err);
            if (axios.isAxiosError(err)) {
                const statusCode = err.response?.status;
                const message = err.response?.data.message;
                if (statusCode === 404) {
                    throw new NotFoundException(message || "Gagal menghapus WhatsApp (Unofficial)");
                }
            }
            throw new InternalServerErrorException(err);
        }
    }
}