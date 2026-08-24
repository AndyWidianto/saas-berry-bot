import { GeminiService } from "@library/agent/gemini.service";
import { PrismaService } from "@library/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AIModel, Message, WorkspaceBalance } from "@prisma/client";
import { BigNumber } from "bignumber.js";
import { get_encoding } from "tiktoken";




@Injectable()
export class BillingService {
    private MARKUP_FACTOR = 2.5;
    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
        private gemini: GeminiService
    ) { }

    calculatePayToken(rawText: string, model: AIModel) {
        const kursRupiah = Number(this.configService.get<string>("KURS_RUPIAH")) || 17900;
        const encoding = get_encoding('cl100k_base');

        const tokens = encoding.encode(rawText);
        const totalTokens = tokens.length;

        encoding.free();

        const inputPer1M = model.inputPricePer1M;
        const MARKUP_FACTOR = 2.5;
        const totalCostUSD = (totalTokens / 1_000_000) * (inputPer1M * MARKUP_FACTOR);
        const totalCostIDR = totalCostUSD * kursRupiah;
        return {
            totalCost: totalCostIDR,
            totalUsedToken: tokens.length
        }
    }

    async totalCostInput(
        systemInstruction: string,
        prompt: string,
        model: AIModel,
        messages: Message[] = []
    ) {
        let totalTokens: number = 0;

        if (model.provider === "OPENAI") {
            const encoding = get_encoding('cl100k_base');
            let tokenCount = 0;

            if (systemInstruction) {
                tokenCount += encoding.encode(systemInstruction).length + 4;
            }

            for (const msg of messages) {
                tokenCount += encoding.encode(msg.content).length + 4;
            }

            if (prompt) {
                tokenCount += encoding.encode(prompt).length + 4;
            }

            tokenCount += 2;
            totalTokens = tokenCount;

            encoding.free();
        }

        if (model.provider === "GOOGLE") {
            if (model.isEmbedding) {
                totalTokens = await this.gemini.countTokens(prompt, model.modelCode);
            } else {
                const history = this.gemini.sanitizeHistory(messages);

                // Kirimkan prompt, systemInstruction, dan history secara terpisah ke SDK Gemini
                totalTokens = await this.gemini.countPromptTokens(
                    model.modelCode,
                    prompt,
                    systemInstruction,
                    history
                );
            }
        }

        const kursRupiah = Number(this.configService.get<string>("KURS_RUPIAH")) || 17900;
        const inputPer1M = model.inputPricePer1M;
        const MARKUP_FACTOR = model.tenantMarkup > 0 ? model.tenantMarkup : 1.5; // Fallback ke 1.5 jika markup tidak diisi

        const totalCostUSD = (totalTokens / 1_000_000) * (inputPer1M * MARKUP_FACTOR);
        const totalCostIDR = totalCostUSD * kursRupiah;

        return {
            totalCost: totalCostIDR,
            totalUsedToken: totalTokens
        };
    }

    async totalCostOutput(rawText: string, model: AIModel) {
        if (model.isEmbedding || !rawText) {
            return {
                totalCost: 0,
                totalUsedToken: 0
            };
        }

        let totalTokens: number = 0;

        if (model.provider === "OPENAI") {
            const encoding = get_encoding('cl100k_base');
            const tokens = encoding.encode(rawText);
            totalTokens = tokens.length;
            encoding.free();
        } else if (model.provider === "GOOGLE") {
            totalTokens = await this.gemini.countTokens(rawText, model.modelCode);
        }

        const kursRupiah = Number(this.configService.get<string>("KURS_RUPIAH")) || 17900;
        const outputPer1M = model.outputPricePer1M;
        const MARKUP_FACTOR = model.tenantMarkup || 1; // Fallback ke 1 jika markup kosong

        const totalCostUSD = (totalTokens / 1_000_000) * (outputPer1M * MARKUP_FACTOR);
        const totalCostIDR = totalCostUSD * kursRupiah;

        return {
            totalCost: totalCostIDR,
            totalUsedToken: totalTokens
        };
    }

    hasEnoughBalance(balance: WorkspaceBalance, aiModel: AIModel, aiModel2?: AIModel): boolean {
        const kursRupiah = Number(this.configService.get<string>("KURS_RUPIAH")) || 17900;
        const amountBalance = BigNumber(balance.amount.toString());
        const outputPer1M = aiModel.outputPricePer1M;
        const inputPer1M = aiModel.inputPricePer1M;
        const totalCostUSD = (outputPer1M + inputPer1M + (aiModel2 ? aiModel.inputPricePer1M + aiModel.outputPricePer1M : 0)) * this.MARKUP_FACTOR;
        const totalCostIDR = totalCostUSD * kursRupiah;
        if (amountBalance.isLessThan(totalCostIDR)) {
            return false;
        }
        return true;
    }
}