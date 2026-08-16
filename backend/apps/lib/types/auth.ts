import { UserRole } from "@prisma/client";
import { Request } from "express";


export interface Login {
    email: string;
    password: string;
}

export interface PayloadUser {
    id: string;
    email: string;
    role: UserRole;
    name: string;
    iat: number;
    exp: number;
    refreshToken?: string;
}

export interface PayloadJWT {
    id: string;
    email: string;
    role: UserRole;
    name: string;
}
export interface RequestAndPayload extends Request {
    user: PayloadUser
}
