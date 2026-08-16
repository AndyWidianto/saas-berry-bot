import { Prisma } from "@prisma/client";

export interface CreateKnowledgeAI {
    file: Express.Multer.File;
}


export interface KnowledgeChunk {
    content: string;
    similarity: number;
}

export interface WorkspaceBalance {
    id: string;
    createdAt: string;
    updatedAt: string;
    workspaceId: string;
    amount: string;
}


export type WorkspaceWithModels = Prisma.WorkspaceGetPayload<{
    include: {
        chatModel: true;
        embeddingModel: true;
        workspaceBalances: true;
        messages: true;
    };
}>;

export type EventMessage = "messages.update" | "messages.upsert" | "presence.update";
export interface WhatsappBayliesSetting {
    rejectCalls: boolean;
    autoRead: boolean;
    event: EventMessage[];
}