export type * from "./users";
export type * from "./workspace";

export type GETResponse = {
    data: any,
    totalPage: number,
    total: number,
    nextId: string
}


export type Page =
  | "overview"
  | "workspaces"
  | "users"
  | "ai-models"
  | "provider-keys"
  | "vector-db"
  | "articles"
  | "knowledge-base"
  | "transactions"
  | "logs"
  | "settings"



export interface UserAuth {
  id: string;
  name: string;
  email: string;
  role: string;
  username: string;
  profileUrl: string;
}
export interface ResponseLogin {
  accessToken: string;
  refreshToken: string;
  user: UserAuth;
}

export enum ProviderAI {
  GOOGLE = "GOOGLE",
  OPENAI = "OPENAI",
  MISTRAL = "MISTRAL",
  LOCAL_OLLAMA = "LOCAL_OLLAMA",
}

export interface AIModel {
  id: string;
  name: string;
  modelCode: string;
  provider: ProviderAI;
  tenantMarkup: number;
  isChat: boolean;
  isEmbedding: boolean;
  isVision: boolean;
  isAudio: boolean;
  contextWindow: number;
  maxOutputToken: number;
  inputPricePer1M: number;
  outputPricePer1M: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}


export interface CreateAIModel {
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

export interface CreateArticle {
  title: string;
  slug?: string; // Jika kosong, backend bisa generate otomatis dari title
  content: string;
  // SEO Fields
  metaTitle?: string;
  metaDescription: string;
  keywords?: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  excerpt?: string;
  authorName?: string; // Default: "Tim Redaksi" (diatur di Prisma/Backend)
  isPublished?: boolean;
  publishedAt?: string;
  isIndexable?: boolean;
  tagIds?: string[];
}


export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string | null;
  featuredImage: string | null;
  featuredImageAlt: string | null;
  excerpt: string | null;
  authorName: string;
  isPublished: boolean;
  publishedAt: string | null;
  isIndexable: boolean;
  createdAt: string;
  updatedAt: string;
}