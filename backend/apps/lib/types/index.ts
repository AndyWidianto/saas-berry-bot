export type * from "./auth";
export type * from "./autreplies";
export type * from "./webhook";
export type * from "./chatbot";
export type * from "./user";
export type * from "./notification";
export type * from "./balance";


export interface WorkingHours {
    schedules: { day: string, enabled: true, open: string, close: string }[]
}

