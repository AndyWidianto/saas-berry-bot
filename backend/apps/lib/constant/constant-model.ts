

interface GeminiModel {
    id: string;
    totalError: number;
    isActive: boolean;
    whenUpdate: Date;
}

export const CACHE_RAM_MODEl_GEMINI: Record<string, GeminiModel> = {}