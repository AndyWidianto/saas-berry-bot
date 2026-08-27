

export interface WorkspaceBalance {
    workspaceId: string;
    id: string;
    amount: number;
    createdAt: Date;
    updatedAt: Date;
}

export type IntegrationChannel = "WHATSAPP" | "TELEGRAM" | "INSTAGRAM" | "FACEBOOK_MESSENGER" | "WEB_WIDGET" | "API";
export type CreditTransactionType = "TOP_UP" | "USAGE_CHAT" | "USAGE_RAG" | "REFUND" | "BONUS";

export interface CreditLedger {
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


export type InvoiceStatus = "PENDING" | "PAID" | "CANCELLED" | "REFUNDED";
export interface Invoice {
    id: string;
    invoiceNumber: string;
    workspaceId: string;
    creditAmount: number;
    subtotal: string;
    taxAmount: string;
    totalAmount: string;
    currency: string;
    status: InvoiceStatus;
    issuedAt: string;
    paidAt: string | null;
    paymentProvider: string | null;
    paymentMethod: string | null;
    externalId: string | null;
    paymentUrl: string | null;
    pdfUrl: string | null;
    createdAt: string;
    updatedAt: string;
}