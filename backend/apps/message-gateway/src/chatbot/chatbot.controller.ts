import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { ChatbotService } from "./chatbot.service";
import { SendPublicMessageDto } from "@library/dto/chatbot.dto";



@Controller("api/chatbot")
export class ChatbotController {

    constructor(private service: ChatbotService) { }

    @Post("generate/:keyPrefix")
    async generateAI(@Param() params: { keyPrefix: string }, @Req() req: Request, @Body() data: SendPublicMessageDto)  {
        const apikey = req.headers["apikey"];
        return await this.service.chatBot(params.keyPrefix, apikey, data);
    }

    @Post("telegram")
    async telegram() {

    }

    @Get("model-ai")
    async Model() {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
            const data = await response.json();

            console.log("Daftar Model Tersedia:");
            data.models.forEach(m => {
                console.log(`- Nama: ${m.name}`);
                console.log(`  Kemampuan: ${m.supportedGenerationMethods.join(", ")}`);
            });
            return data;
        } catch (error) {
            console.error("Gagal ambil list model:", error);
        }
    }
}