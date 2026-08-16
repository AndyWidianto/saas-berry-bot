import type { proto } from "@whiskeysockets/baileys";


export interface MessageUpsertData {
  key: {
    remoteJid: string;
    remoteJidAlt: string;
    fromMe: boolean;
    id: string;
    participant: string;
    addressingMode: string;
  },
  pushName: string;
  message: proto.IMessage;
  status: "DELIVERY_ACK",
  messageType: string;
  messageTimestamp: string;
  base64?: string;
  instanceId: string;
  source: string;
}

export interface MessageUpdateData {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  update: {
    status: number;
  };
}

export interface ConnectionUpdateData {
  state: "open" | "connecting" | "close";
  statusReason?: number;
}

// 2. Gabungkan menggunakan OR (|)
export type EvolutionWebhookPayload =
  | { event: "messages.upsert"; data: MessageUpsertData; instance: string; apikey: string }
  | { event: "messages.update"; data: MessageUpdateData; instance: string; apikey: string }
  | { event: "connection.update"; data: ConnectionUpdateData; instance: string; apikey: string };