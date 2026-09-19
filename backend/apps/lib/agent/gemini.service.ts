import { BadRequestException, Injectable, OnModuleInit } from "@nestjs/common";
import { Content, GoogleGenerativeAI } from "@google/generative-ai";
import { ConfigService } from "@nestjs/config";
import { Message } from "@prisma/client";
import { response } from "express";
import sizeOf from 'image-size';


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

    async analisisImage(modelName: string, prompt: string, base64: string, mimeType: string, grandTotal: number) {
        let response = {
            text: '',
            valid: true,
            total: 0,
        }
        try {

            const model = this.genAI.getGenerativeModel({
                model: modelName
            })
            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: base64,
                        mimeType: mimeType,
                    },
                },
            ]);
            const responseText = result.response.text();
            // Clean string JSON jika ada format markdown triple backtick
            const cleanJsonString = responseText.replace(/```json|```/g, '').trim();
            const aiData = JSON.parse(cleanJsonString);

            // D. Validasi Hasil AI dengan Database
            if (!aiData.isValidReceipt) {
                response = {
                    text: "❌ Gambar yang Kamu kirim bukan bukti transfer valid.",
                    valid: false,
                    total: 0,
                }
            }

            if (aiData.status !== 'SUCCESS') {
                response = {
                    text: "⚠️ Bukti transfer terdeteksi, tetapi statusnya masih pending/gagal. Mohon kirimkan yang sudah sukses.",
                    valid: false,
                    total: 0,
                }
            }

            // Cocokkan Nominal
            if (aiData.amount >= grandTotal) {
                // Pembayaran Sukses! Update State
                response = {
                    text: `✅ **PEMBAYARAN BERHASIL!**\n\nNominal: Rp${aiData.amount.toLocaleString('id-ID')}\nMetode: ${aiData.paymentMethod}\n\nPesananmu sedang diproses oleh tim kami. Terima kasih!`,
                    valid: true,
                    total: 0,
                }
            } else {
                response = {
                    text: `⚠️ Nominal transfer (Rp${aiData.amount.toLocaleString('id-ID')}) tidak sesuai dengan tagihan (Rp${grandTotal.toLocaleString('id-ID')}). Mohon periksa kembali.`,
                    valid: false,
                    total: aiData.amount,
                }
            }

        } catch (error) {
            console.error('Error processing image:', error);
            response = {
                text: 'Gagal membaca gambar. Pastikan tulisan di screenshot terlihat jelas.',
                valid: false,
                total: 0,
            }
        }
        return response;
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

    calculateImageTokensFromBase64(base64String: string): number {
        try {
            const cleanBase64 = base64String.replace(/^data:image\/\w+;base64,/, '');
            const imageBuffer = Buffer.from(cleanBase64, 'base64');

            const dimensions = sizeOf(imageBuffer);
            let width = dimensions.width || 0;
            let height = dimensions.height || 0;

            // Fallback jika dimensi gagal dibaca
            if (!width || !height) {
                return 258;
            }

            // 1. Gambar kecil (<= 384px di kedua sisi) selalu dihitung 1 tile (258 token)
            if (width <= 384 && height <= 384) {
                return 258;
            }

            // 2. Skala down jika melebihi 1024px (mempertahankan aspect ratio)
            const MAX_SIDE = 1024;
            if (width > MAX_SIDE || height > MAX_SIDE) {
                if (width > height) {
                    height = Math.round((height * MAX_SIDE) / width);
                    width = MAX_SIDE;
                } else {
                    width = Math.round((width * MAX_SIDE) / height);
                    height = MAX_SIDE;
                }
            }

            // 3. Hitung jumlah ubin (tiles) 384x384
            const TILE_SIZE = 384;
            const tilesX = Math.ceil(width / TILE_SIZE);
            const tilesY = Math.ceil(height / TILE_SIZE);
            const totalTiles = tilesX * tilesY;

            return totalTiles * 258;
        } catch (error) {
            console.error('[GeminiTokenCalculator Error]:', error);
            return 516; // Fallback aman (~2 tiles)
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
                parts: [{ text: `${m.mediaUrl ? `Url: ${m.mediaUrl}` : ''} \n${m.content}` }]
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