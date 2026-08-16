
export interface Workspace {
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    slug: string;
    logoUrl: string | null;
    ownerId: string;
    rewrite: boolean;
    isAiActive: boolean;
    activeChatModelId: string;
    chunkSize: number;
    chunkOverlap: number;
    activeEmbeddingModelId: string;
    notificationSettings: Record<NotificationSettingType, any>
}

export type RoleWorkspaceMember = "ADMIN" | "OWNER" | "MEMBER";
export type MemberStatus = "INVITED" | "ACTIVE" | "SUSPENDED";

export type NotificationSettingType = "team_update" | "billing_alert" | "ai_escalation";

export interface WorkspaceMember {
    id: string;
    role: RoleWorkspaceMember;
    createdAt: string;
    updatedAt: string;
    status: MemberStatus;
    invitedEmail: string | null;
    invitedBy: string | null;
    lastActiveAt: string | null;
    userId: string | null;
    workspaceId: string;
    user: {
        id: string;
        name: string;
        email: string;
        profileUrl?: string | null;
    }
}
export interface UpdateWorkspace {
    name?: string;
    slug?: string;
    isAiActive?: boolean;
    rewrite?: boolean;
    activeChatModelId?: string;
    activeEmbeddingModelId?: string;
    notificationSettings?: Partial<Record<NotificationSettingType, any>>;
}