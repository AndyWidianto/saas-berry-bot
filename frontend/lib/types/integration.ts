
export type PlatformIntegration = "WHATSAPP_BAYLIES" | "EMAIL" | "TELEGRAM" | "API";

export type StatusIntegration = "CONNECTING" | "CONNECTED" | "DISCONNECTED"
export interface Integrations {
    number: string | null;
    status: StatusIntegration;
    workspaceId: string;
    id: string;
    instanceName: string;
    name: string;
    email: string | null;
    platform: PlatformIntegration;
    settings: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}


export interface CreateIntegration {
    number: string | null;
    name: string;
    email: string | null;
    platform: PlatformIntegration;
    settings: Record<string, any>;
}

export interface WhatsappBayliesSetting {
    rejectCalls: boolean;
    autoRead: boolean;
    event: string[];
}