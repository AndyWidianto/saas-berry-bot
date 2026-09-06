
export interface Contact {
    id: string;
    senderId: string;
    createdAt: string;
    updatedAt: string;
    workspaceId: string;
    name: string | null;
    phoneNumber: string | null;
    avatarUrl: string | null;
    isBlocked: boolean;
    metadata: Record<string, any> | null;
    lastActiveAt: string;
    lastMessage: string | null;
    lastMessageAt: string;
    unreadCount: number;
}