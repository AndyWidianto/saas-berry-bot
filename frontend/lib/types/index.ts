export * from "./integration";
export * from "./chatbot";
export * from "./balance";
export * from "./workspace";
export * from "./knowledge";
export * from "./dashboard";


export interface ResponseApi {
    data: any;
    totalPage: number;
    nextId: string;
    total: number;
}