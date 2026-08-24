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

export interface WorkingHour {
    monday: { enabled: true, start: string, end: string },
    tuesday: { enabled: true, start: string, end: string },
    wednesday: { enabled: true, start: string, end: string },
    thursday: { enabled: true, start: string, end: string },
    friday: { enabled: true, start: string, end: string },
    saturday: { enabled: false, start: string, end: string },
    sunday: { enabled: false, start: string, end: string }
}

export type Days = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export type EventMessage = "messages.update" | "messages.upsert" | "presence.update";
export interface WhatsappBayliesSetting {
    rejectCalls: boolean;
    autoRead: boolean;
    event: EventMessage[];
}