import { PlatformIntegration } from "./integration";


export interface Message {
    id: string;
    platform: PlatformIntegration;
    providerMessageId: string | null;
    fromMe: boolean;
    senderId: string;
    senderName: string | null;
    content: string;
    type: string;
    mediaUrl: string | null;
    workspaceId: string;
    contactId: string | null;
    status: string;
    thumbnail: string;
    createdAt: string;
    updatedAt: string;
}
