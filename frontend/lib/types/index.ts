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
export * from "./products";


export interface ResponseApi {
    data: any;
    totalPage: number;
    nextId: string;
    total: number;
}

export interface ResultResponse<T> {
    data: T;
    totalPage: number;
    nextId: string;
    total: number;
    message?: string;
}

export interface Filter {
    cursor?: string;
    limit?: number;
    workspaceId?: string;
    search?: string;
}