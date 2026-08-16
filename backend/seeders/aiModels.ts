import { PrismaService } from "@library/prisma/prisma.service"
import { Prisma, ProviderAI } from "@prisma/client";

const prisma = new PrismaService();

export async function AiModels() {
  const models: Prisma.AIModelCreateInput[] = [
    {
      name: "Gemini 2.0 Flash",
      modelCode: "gemini-2.0-flash",
      provider: ProviderAI.GOOGLE,
      isChat: true,
      isEmbedding: false,
      isVision: true,
      isAudio: true,
      contextWindow: 1048576,
      maxOutputToken: 8192,
      inputPricePer1M: 0.075,   // $0.075 per 1M token (Base: $0.075)
      outputPricePer1M: 0.30,   // $0.30 per 1M token (Base: $0.30)
      isActive: true,
    },
    {
      name: "Gemini 1.5 Flash",
      modelCode: "gemini-1.5-flash",
      provider: ProviderAI.GOOGLE,
      isChat: true,
      isEmbedding: false,
      isVision: true,
      isAudio: true,
      contextWindow: 1048576,
      maxOutputToken: 8192,
      inputPricePer1M: 0.075,   // $0.075 per 1M token
      outputPricePer1M: 0.30,   // $0.30 per 1M token
      isActive: true,
    },
    {
      name: "Gemini 1.5 Pro",
      modelCode: "gemini-1.5-pro",
      provider: ProviderAI.GOOGLE,
      isChat: true,
      isEmbedding: false,
      isVision: true,
      isAudio: true,
      contextWindow: 2097152,
      maxOutputToken: 8192,
      inputPricePer1M: 1.25,    // $1.25 per 1M token (Base: $1.25)
      outputPricePer1M: 5.00,    // $5.00 per 1M token (Base: $5.00)
      isActive: true,
    },
    {
      name: "Gemma 2 27B IT",
      modelCode: "gemma-2-27b-it",
      provider: ProviderAI.GOOGLE,
      isChat: true,
      isEmbedding: false,
      isVision: false,
      isAudio: false,
      contextWindow: 8192,
      maxOutputToken: 2048,
      inputPricePer1M: 0.04,    // Model open-weights, di-set murah
      outputPricePer1M: 0.12,
      isActive: true,
    },
    {
      name: "Gemma 2 9B IT",
      modelCode: "gemma-2-9b-it",
      provider: ProviderAI.GOOGLE,
      isChat: true,
      isEmbedding: false,
      isVision: false,
      isAudio: false,
      contextWindow: 8192,
      maxOutputToken: 2048,
      inputPricePer1M: 0.02,
      outputPricePer1M: 0.06,
      isActive: true,
    },
    {
      name: "Text Embedding 004",
      modelCode: "text-embedding-004",
      provider: ProviderAI.GOOGLE,
      isChat: false,
      isEmbedding: true,
      isVision: false,
      isAudio: false,
      contextWindow: 2048,
      maxOutputToken: 0,
      inputPricePer1M: 0.02,    // $0.02 per 1M token (Base: $0.02)
      outputPricePer1M: 0.00,
      isActive: true,
    },
    {
      name: "Gemini Embedding 2",
      modelCode: "gemini-embedding-2",
      provider: ProviderAI.GOOGLE,
      isChat: false,
      isEmbedding: true,
      isVision: false,
      isAudio: false,
      contextWindow: 2048,
      maxOutputToken: 0,
      inputPricePer1M: 0.02,    // $0.02 per 1M token (Base: $0.02)
      outputPricePer1M: 0.00,
      isActive: true,
    },
    {
      name: "Gemini Embedding 001",
      modelCode: "gemini-embedding-001",
      provider: ProviderAI.GOOGLE,
      isChat: false,
      isEmbedding: true,
      isVision: false,
      isAudio: false,
      contextWindow: 2048,
      maxOutputToken: 0,
      inputPricePer1M: 0.02,    // $0.02 per 1M token (Base: $0.02)
      outputPricePer1M: 0.00,
      isActive: true,
    },
    {
      name: "Gemma 4 26B A4B IT",
      modelCode: "gemma-4-26b-a4b-it",
      provider: ProviderAI.GOOGLE,
      isChat: true,
      isEmbedding: false,
      isVision: false,
      isAudio: false,
      contextWindow: 8192,
      maxOutputToken: 2048,
      inputPricePer1M: 0.02,
      outputPricePer1M: 0.06,
      isActive: true,
    },
    {
      name: "Gemini 2.5 Flash",
      modelCode: "gemini-2.5-flash",
      provider: ProviderAI.GOOGLE,
      isChat: true,
      isEmbedding: false,
      isVision: false,
      isAudio: false,
      contextWindow: 8192,
      maxOutputToken: 2048,
      inputPricePer1M: 0.02,
      outputPricePer1M: 0.06,
      isActive: true,
    },
    {
      name: "Gemini 2.0 Flash-Lite",
      modelCode: "gemini-2.0-flash-lite",
      provider: ProviderAI.GOOGLE,
      isChat: true,
      isEmbedding: false,
      isVision: false,
      isAudio: false,
      contextWindow: 8192,
      maxOutputToken: 2048,
      inputPricePer1M: 0.02,
      outputPricePer1M: 0.06,
      isActive: true,
    }
  ];

  console.log('⏳ Seeding AI Models from Google AI Studio...');

  for (const model of models) {
    await prisma.aIModel.upsert({
      where: { modelCode: model.modelCode },
      update: {
        name: model.name,
        isChat: model.isChat,
        isEmbedding: model.isEmbedding,
        isVision: model.isVision,
        isAudio: model.isAudio,
        contextWindow: model.contextWindow,
        maxOutputToken: model.maxOutputToken,
        inputPricePer1M: model.inputPricePer1M,
        outputPricePer1M: model.outputPricePer1M,
        isActive: model.isActive,
      },
      create: model,
    });
  }

  console.log('✅ AI Models seeding completed!');
}