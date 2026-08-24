export type StatusKnowledge = "INDEXED" | "PROCESSING" | "PENDING"

export interface Knowledge {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    workspaceId: string;
    status: StatusKnowledge;
    modelName: string;
    type: string;
    totalChunk: number;
    size: number;
}