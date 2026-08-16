import { PrismaService } from "@library/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AIModel, WorkspaceBalance } from "@prisma/client";
import { BigNumber } from "bignumber.js";
import { get_encoding } from "tiktoken";




@Injectable()
export class BillingService {
    private MARKUP_FACTOR = 2.5;
    constructor(
        private prisma: PrismaService,
        private configService: ConfigService
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

    totalCostInput(rawText: string, model: AIModel) {
        const kursRupiah = Number(this.configService.get<string>("KURS_RUPIAH")) || 17900;
        const encoding = get_encoding('cl100k_base');

        const tokens = encoding.encode(rawText);
        const totalTokens = tokens.length;

        encoding.free();

        const inputPer1M = model.inputPricePer1M;
        const MARKUP_FACTOR = model.tenantMarkup;
        const totalCostUSD = (totalTokens / 1_000_000) * (inputPer1M * MARKUP_FACTOR);
        const totalCostIDR = totalCostUSD * kursRupiah;
        return {
            totalCost: totalCostIDR,
            totalUsedToken: tokens.length
        }
    }

    totalCostOutput(rawText: string, model: AIModel) {
        const kursRupiah = Number(this.configService.get<string>("KURS_RUPIAH")) || 17900;
        const encoding = get_encoding('cl100k_base');

        const tokens = encoding.encode(rawText);
        const totalTokens = tokens.length;

        encoding.free();

        const outputPer1M = model.outputPricePer1M;
        const MARKUP_FACTOR = model.tenantMarkup;
        const totalCostUSD = (totalTokens / 1_000_000) * (outputPer1M * MARKUP_FACTOR);
        const totalCostIDR = totalCostUSD * kursRupiah;
        return {
            totalCost: totalCostIDR,
            totalUsedToken: tokens.length
        }
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