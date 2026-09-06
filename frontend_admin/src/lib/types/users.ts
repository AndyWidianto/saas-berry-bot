
export type UserRole = "user" | "admin" | "super_admin" | "review";

export type User = {
    id: string;
    name: string | null;
    createdAt: Date;
    updatedAt: Date;
    username: string;
    password: string;
    email: string;
    refreshToken: string | null;
    role: UserRole;
    thumbnail: string | null;
    profileUrl: string | null;
}