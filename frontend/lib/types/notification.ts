

export interface Notification {
    id: string;
    createdAt: string;
    updatedAt: string;
    title: string;
    message: string;
    category: string;
    level: string;
    isRead: boolean;
    readAt: string | null;
    metadata: Record<string, any>;
    workspaceId: string;
}

export type NotificationAction = "CONFIGURE_MODEL" | "LOW_BALANCE_ALERT";

export type NotificationTarget = "billing" | "workspace";