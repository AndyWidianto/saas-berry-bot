

export interface CreateAutoreplies {
    name: string;
    isActive: boolean;
    type: "keyword" | "ai_rag";
    replyContent?: string;
    aiPrompt?: string;
}

export interface UpdateAutoreplies {
    name?: string;
    isActive?: boolean;
    type?: "keyword" | "ai_rag";
    replyContent?: string;
    aiPrompt?: string;
}