import { BadRequestException, Injectable, OnModuleInit } from "@nestjs/common";
import { Content, GoogleGenerativeAI } from "@google/generative-ai";
import { ConfigService } from "@nestjs/config";
import { Message } from "@prisma/client";


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
            const genModel = this.genAI.getGenerativeModel({
                model: model,
                systemInstruction: systemRules,
            });
            const stratChat = genModel.startChat({
                history: [...history]
            });
            const result = await stratChat.sendMessage(`message: ${prompt}`);
            const text = result.response.text();
            console.log(text);
            let cleanedText = (text.split('===JAWABAN===').pop() || text).trim();
            return {
                text: text,
                cleanedText
            };
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

    async countTokens(
        text: string | string[],
        model: string = "text-embedding-004"
    ): Promise<number> {
        try {
            const modelAI = this.genAI.getGenerativeModel({ model });
            let contents: string | string[];

            if (Array.isArray(text)) {
                contents = text;
            } else {
                contents = [text];
            }

            const result = await modelAI.countTokens(contents);

            return result.totalTokens;
        } catch (err: unknown) {
            console.error(`Gagal menghitung token embedding untuk model ${model}:`, err);
            throw new BadRequestException("Gagal menghitung jumlah token embedding");
        }
    }


    sanitizeHistory(messages: Message[]): Content[] {
        if (!messages || messages.length === 0) return [];

        const rawHistory: Content[] = messages
            .filter(m => m.content && m.content.trim() !== "") // Buang pesan kosong
            .map(m => ({
                role: m.fromMe ? "model" : "user",
                parts: [{ text: m.content }]
            }));

        const sanitized: Content[] = [];

        for (const item of rawHistory) {
            if (sanitized.length === 0) {
                if (item.role === "user") {
                    sanitized.push(item);
                }
                continue;
            }

            const lastItem = sanitized[sanitized.length - 1];

            if (lastItem.role === item.role) {
                lastItem.parts[0].text += `\n${item.parts[0].text}`;
            } else {
                sanitized.push(item);
            }
        }

        return sanitized;
    }
}