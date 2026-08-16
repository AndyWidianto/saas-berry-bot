

export interface WorkspaceBalance {
    workspaceId: string;
    id: string;
    amount: number;
    createdAt: Date;
    updatedAt: Date;
}

export type IntegrationChannel = "WHATSAPP" | "TELEGRAM" | "INSTAGRAM" | "FACEBOOK_MESSENGER" | "WEB_WIDGET" | "API";
export type CreditTransactionType = "TOP_UP" | "USAGE_CHAT" | "USAGE_RAG" | "REFUND" | "BONUS";

export interface Invoice {
    id: string;
    workspaceId: string;
    invoiceId: string | null;
    amount: number;
    type: CreditTransactionType;
    channel: IntegrationChannel | null;
    description: string;
    tokensUsed: number | null;
    externalMsgId: string | null;
    createdAt: string;  
}