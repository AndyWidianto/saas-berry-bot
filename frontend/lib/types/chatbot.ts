
export type ProviderAI = "GOOGLE" | "OPENAI" | "MISTRAL" | "LOCAL_OLLAMA";
export interface AIModel {
    id: string;
    name: string;
    modelCode: string;
    provider: ProviderAI;
    isChat: boolean;
    isEmbedding: boolean;
    isVision: boolean;
    isAudio: boolean;
    contextWindow: number;
    maxOutputToken: number;
    inputPricePer1M: number;
    outputPricePer1M: number;
    isActive: boolean;
}

export interface TokenBalance {
    id: string;
    workspaceId: string;
    name: string;
    modelCode: string;
    provider: ProviderAI;
    isPrimary: boolean;
    remainingToken: number;
    totalUsedToken: number;
    totalUsedEmbeddingToken: number;
    createdAt: string;
    updatedAt: string;
}

export interface ApiKeyDataResponse {
  name: string;
  workspaceId: string;
  id: string;
  keyPrefix: string;
  secretHash: string;
  permissions: string[];
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string;
}


export interface AILogs {
    id: string;
    workspaceId: string;
    createdAt: string;
    question: string;
    answer: string;
    confidence: number;
    isFallback: boolean;
    isEscalated: boolean;
    modelName: string | null;
    latencyMs: number | null;
    tokensUsed: number | null;
    messageId: string | null;
}

export interface CreateApiKeyResponse {
  message: string;
  data: ApiKeyDataResponse;
  secretKey: string;
}