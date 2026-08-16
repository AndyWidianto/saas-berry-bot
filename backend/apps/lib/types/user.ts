import { UserRole } from "@prisma/client";

export interface CreateUser {
    username: string;
    email: string;
    password: string;
    role: UserRole;
}

export interface ResetPassword {
    password: string;
    newPassword: string;
}

