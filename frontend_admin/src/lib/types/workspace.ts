


export type Workspace = {
    id: string;
    name: string;
    logoUrl: string | null;
    systemRules: string | null;
    greetingText: string | null;
    ownerId: string;
    activeChatModelId: string | null;
    activeEmbeddingModelId: string | null;
    chunkSize: number;
    chunkOverlap: number;
    isAiActive: boolean;
    rewrite: boolean;
    workingHoursEnabled: boolean;
    timezone: string;
    workingHours: Record<string, any> | null;
    notificationSettings: Record<string, any> | null;
    createdAt: string;
    updatedAt: string;
}