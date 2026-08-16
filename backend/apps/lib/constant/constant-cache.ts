import { WASocket } from "@whiskeysockets/baileys";


export const CACHE_RAM_QR_CODE: Record<string, string | null> = {};


export const CACHE_RAM_SOCK_SESSION: Record<string, WASocket> = {};


export const CACHE_RAM_BLOCK_CONTACT: Record<string, { id: string, blocking: boolean,  name: string | null, expired: Date }> = {};