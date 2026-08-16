import { RoleWorkspaceMember } from "@prisma/client";
import { IsEmail, IsNotEmpty, IsOptional } from "class-validator";


export class CreateWorkspaceDto {
    @IsNotEmpty({ message: "field name is required" })
    name: string;

    @IsOptional()
    slug: string;
}


export type NotificationSettingType = "team_update" | "billing_alert" | "ai_escalation";
export class UpdateWorkspaceDto {
    @IsOptional()
    name?: string;

    @IsOptional()
    slug?: string;

    @IsOptional()
    isAiActive: boolean;

    @IsOptional()
    rewrite: boolean;
    @IsOptional()
    systemRules: string;
    @IsOptional()
    greetingText: string

    @IsOptional()
    activeChatModelId?: string;

    @IsOptional()
    activeEmbeddingModelId?: string;

    @IsOptional()
    notificationSettings: Record<NotificationSettingType, any>;
}

export class CreateMemberDto {
    @IsNotEmpty({ message: "email is required" })
    @IsEmail()
    email: string;

    @IsNotEmpty({ message: "role is required" })
    role: RoleWorkspaceMember;
}

export class CreateApiKeyDto {
    @IsNotEmpty({ message: "name is required" })
    name: string;

    // @IsNotEmpty({ message: "permission is required" })
    // permission: string[];
}