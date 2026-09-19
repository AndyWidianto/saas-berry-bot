import { BadRequestException, Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Message } from "@prisma/client";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.js";



@Injectable()
export class OpenaiService implements OnModuleInit {

    private openai: OpenAI;
    constructor(private configService: ConfigService) { }

    async onModuleInit() {
        const connect = new OpenAI({
            apiKey: this.configService.get<string>("OPEN_AI_SECRET") || ""
        });
        this.openai = connect;
    }

    sanitizeHistory(messages: Message[]): ChatCompletionMessageParam[] {
        if (!messages || messages.length === 0) return [];

        const rawHistory: ChatCompletionMessageParam[] = messages
            .filter((m) => m.content && m.content.trim() !== "")
            .map((m) => ({
                role: m.fromMe ? ("assistant" as const) : ("user" as const),
                content: `${m.mediaUrl ? `Url: ${m.mediaUrl}` : ''} \n${m.content}`.trim(),
            }));

        const sanitized: ChatCompletionMessageParam[] = [];

        for (const item of rawHistory) {
            // Objek pertama wajib ber-role "user"
            if (sanitized.length === 0) {
                if (item.role === "user") {
                    sanitized.push({ ...item });
                }
                continue;
            }

            const lastIndex = sanitized.length - 1;
            const lastItem = sanitized[lastIndex];
            
            if (lastItem.role === item.role) {
                sanitized[lastIndex] = {
                    ...lastItem,
                    content: `${lastItem.content}\n${item.content}`,
                };
            } else {
                sanitized.push({ ...item });
            }
        }

        return sanitized;
    }

    async chatbot(
        model: string,
        prompt: string,
        systemRules: string,
        history: ChatCompletionMessageParam[] = []
    ) {
        try {
            const messages: ChatCompletionMessageParam[] = [
                { role: 'system', content: systemRules },
                ...history,
                { role: 'user', content: prompt }
            ];

            const response = await this.openai.chat.completions.create({
                model: model,
                messages: messages
            });

            const text = response.choices[0]?.message?.content || "";
            const promptTokens = response.usage?.prompt_tokens || 0;
            const completionTokens = response.usage?.completion_tokens || 0;
            const totalTokens = response.usage?.total_tokens || 0;

            const cleanedText = (text.split('===JAWABAN===').pop() || text).trim();

            return {
                text: cleanedText,
                rawText: text,
                usage: {
                    promptTokens,
                    completionTokens,
                    totalTokens
                }
            };
        } catch (err: unknown) {
            console.error(`Gagal mendapatkan jawaban dari model ${model}:`, err);
            throw new BadRequestException("Gagal mendapatkan jawaban dari AI");
        }
    }

    async embeddings(modelName: string, text: string) {
        try {
            const response = await this.openai.embeddings.create({
                model: modelName,
                input: text
            });

            const vector = response.data[0]?.embedding || [];
            const totalTokens = response.usage?.total_tokens || 0;

            return {
                totalTokens,
                vector,
                raw: response.data
            };
        } catch (err: unknown) {
            console.error(`Gagal melakukan embedding dengan model ${modelName}:`, err);
            throw new BadRequestException("Gagal melakukan embeddings");
        }
    }
}