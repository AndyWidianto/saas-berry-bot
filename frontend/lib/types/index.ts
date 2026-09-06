export * from "./integration";
export * from "./chatbot";
export * from "./balance";
export * from "./workspace";
export * from "./knowledge";
export * from "./dashboard";
export * from "./contact";
export * from "./working-hour";
export * from "./notification";
export * from "./messages";


export interface ResponseApi {
    data: any;
    totalPage: number;
    nextId: string;
    total: number;
}

export interface ResponseUpload {
    filename: string;
    url: string;
}