import { BadRequestException, Injectable, InternalServerErrorException, OnModuleInit } from "@nestjs/common";
import { Message, Ollama } from "ollama";
import { Content, GoogleGenerativeAI } from "@google/generative-ai";
import { ConfigService } from "@nestjs/config";
import { CACHE_RAM_MODEl_GEMINI } from "../constant/constant-model";
import { AIModel } from "@prisma/client";


interface GoogleAPIError {
    code?: number;
    status?: string;
    message?: string;
}

@Injectable()
export class GeminiService implements OnModuleInit {
    private genAI: GoogleGenerativeAI;

    constructor(private configService: ConfigService) { }

    onModuleInit() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    }

    isGoogleError(err: any): err is GoogleAPIError {
        return err && typeof err === 'object' && ('code' in err || 'status' in err);
    }


    async embeddingsGemini(modelName: string, text: string) {
        try {
            const model = this.genAI.getGenerativeModel({ model: modelName });
            const result = await model.embedContent({
                content: {
                    role: "user",
                    parts: [{ text: text }]
                },
            });

            const embedding = result.embedding;
            return embedding.values;
        } catch (err: unknown) {
            console.error(`Gagal mendapatkan jawaban dari model ${modelName}:`, err);
            throw new BadRequestException("Gagal melakukan embeddings");
        }
    }

    async chatbot(model: string, prompt: string, systemRules: string, history: Content[] = []) {
        try {
            console.log("Message: ", prompt);
            const genModel = this.genAI.getGenerativeModel({
                model: model,
                systemInstruction: `${systemRules} \n FORMAT OUTPUT WAJIB: ===JAWABAN=== \n [Hasil Teks]`,
            });
            const stratChat = genModel.startChat({
                history: [...history]
            });
            const result = await stratChat.sendMessage(`message: ${prompt}`);
            const text = result.response.text();
            console.log(text);
            let cleanedText = (text.split('===JAWABAN===').pop() || text).trim();
            return cleanedText;
        } catch (err: unknown) {
            console.error(`Gagal mendapatkan jawaban dari model ${model}:`, err);
            throw new BadRequestException("Gagal mendapatkan jawaban");
        }
    }
    async countPromptTokens(
        model: string,
        prompt: string,
        systemRules: string, // Sudah berisi instruksi + gabungan RAG chunks
        history: Content[] = []
    ): Promise<number> {
        try {
            const genModel = this.genAI.getGenerativeModel({
                model: model,
                systemInstruction: systemRules,
            });
            const contents: Content[] = [
                ...history,
                {
                    role: "user",
                    parts: [{ text: prompt }],
                },
            ];

            // Panggil method countTokens resmi dari SDK Gemini
            const result = await genModel.countTokens({ contents });
            return result.totalTokens;

        } catch (err: unknown) {
            console.error(`Gagal menghitung token untuk model ${model}:`, err);
            throw new BadRequestException("Gagal menghitung jumlah token");
        }
    }
}