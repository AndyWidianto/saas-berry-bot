import { PrismaService } from "@library/prisma/prisma.service"
import { Prisma, ProviderAI } from "@prisma/client";

const prisma = new PrismaService();

export async function AiModels() {
  const models: Prisma.AIModelCreateInput[] = [
    // {
    //   name: "Gemini 2.5 Flash-Lite",
    //   modelCode: "gemini-2.5-flash-lite",
    //   provider: ProviderAI.GOOGLE,
    //   isChat: true,
    //   isEmbedding: false,
    //   isVision: true,
    //   isAudio: true,
    //   contextWindow: 1_048_576,
    //   maxOutputToken: 65_536,
    //   inputPricePer1M: 0.10,   // $0.075 per 1M token (Base: $0.075)
    //   outputPricePer1M: 0.40,   // $0.30 per 1M token (Base: $0.30)
    //   tenantMarkup: 2,
    //   isActive: true,
    // },
    {
      name: "Gemini 2.5 Flash",
      modelCode: "gemini-2.5-flash",
      provider: ProviderAI.GOOGLE,
      isChat: true,
      isEmbedding: false,
      isVision: true,
      isAudio: true,
      contextWindow: 1_048_576,
      maxOutputToken: 65_536,
      inputPricePer1M: 0.30,   // $0.075 per 1M token
      outputPricePer1M: 2.50,   // $0.30 per 1M token
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
      contextWindow: 8_192,
      maxOutputToken: 0,
      inputPricePer1M: 0.20,
      outputPricePer1M: 0,
      tenantMarkup: 2,
      isActive: true,
    },
    {
      name: "Gemini Embedding",
      modelCode: "gemini-embedding-001",
      provider: ProviderAI.GOOGLE,
      isChat: false,
      isEmbedding: true,
      isVision: false,
      isAudio: false,
      contextWindow: 2_048,
      maxOutputToken: 0,
      inputPricePer1M: 0.15,
      outputPricePer1M: 0,
      tenantMarkup: 2,
      isActive: true,
    },
    {
      name: "Gemini 3.1 Flash-Lite", // Sesuaikan nama model sesuai kebutuhan
      modelCode: "gemini-3.1-flash-lite", // Sesuaikan kode model sesuai kebutuhan
      provider: ProviderAI.GOOGLE,
      isChat: true,
      isEmbedding: false,
      isVision: true,
      isAudio: true,
      contextWindow: 1_048_576,
      maxOutputToken: 65_536,
      inputPricePer1M: 0.25,   // $0.25 per 1M token (text / image / video)
      outputPricePer1M: 1.50,   // $1.50 per 1M token (termasuk thinking tokens)
      tenantMarkup: 2,
      isActive: true,
    },
    {
      name: "Gemini 3.5 Flash-Lite", // Sesuaikan nama model sesuai kebutuhan
      modelCode: "gemini-3.5-flash-lite", // Sesuaikan kode model sesuai kebutuhan
      provider: ProviderAI.GOOGLE,
      isChat: true,
      isEmbedding: false,
      isVision: true,
      isAudio: true,
      contextWindow: 1_048_576,
      maxOutputToken: 65_536,
      inputPricePer1M: 0.30,   // $0.30 per 1M token (text / image / video / audio)
      outputPricePer1M: 2.50,   // $2.50 per 1M token (termasuk thinking tokens)
      tenantMarkup: 2,
      isActive: true,
    }
  ];

  console.log('⏳ Seeding AI Models from Google AI Studio...');
  await prisma.aIModel.deleteMany();
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