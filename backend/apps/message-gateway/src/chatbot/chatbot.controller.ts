import { Body, Controller, Get, Param, Post, Query, Req, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ChatbotService } from "./chatbot.service";
import { CreateKnowledgeDto, SendPublicMessageDto } from "@library/dto/chatbot.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { GetQueryBotDto } from "@library/dto/message-query.dto";



@Controller("api/bot")
export class ChatbotController {

    constructor(private service: ChatbotService) { }


    @Post("telegram/:instanceName")
    async telegram(@Param("instanceName") instanceName: string) {

    }

    @Post(":keyPrefix/sendMessage")
    async generateAI(@Req() req: Request, @Param("keyPrefix") keyPrefix: string, @Body() data: SendPublicMessageDto) {
        const apikey = req.headers["apikey"];
        return await this.service.chatBot(apikey, keyPrefix, data);
    }

    @Post(":keyPrefix/embeddings")
    @UseInterceptors(FileInterceptor("file"))
    async embeddings(
        @Req() req: Request,
        @Body() data: CreateKnowledgeDto,
        @Param("keyPrefix") keyPrefix: string,
        @UploadedFile("file") file: Express.Multer.File) {
        const apikey = req.headers["apikey"];
        return await this.service.embeddings(apikey, keyPrefix, data, file);
    }

    @Get(":keyPrefix/contacts")
    async getContact(@Req() req: Request, @Param() params: { keyPrefix: string }, @Query() query: GetQueryBotDto) {
        const apikey = req.headers["apikey"];
        return await this.service.getContacts(params.keyPrefix, apikey, query);
    }

    @Get(":keyPrefix/messages/:contactId")
    async getMessages(@Req() req: Request, @Param() params: { contactId: string, keyPrefix: string }, @Query() query: GetQueryBotDto) {
        const apikey = req.headers["apikey"];
        return await this.service.getMessages(params.keyPrefix, apikey, params.contactId, query);
    }

    // @Get("model-ai")
    // async Model() {
    //     try {
    //         const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    //         const data = await response.json();

    //         console.log("Daftar Model Tersedia:");
    //         data.models.forEach(m => {
    //             console.log(`- Nama: ${m.name}`);
    //             console.log(`  Kemampuan: ${m.supportedGenerationMethods.join(", ")}`);
    //         });
    //         return data;
    //     } catch (error) {
    //         console.error("Gagal ambil list model:", error);
    //     }
    // }
}