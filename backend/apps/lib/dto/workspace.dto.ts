import { Days } from "@library/types";
import { RoleWorkspaceMember } from "@prisma/client";
import { Transform, Type } from "class-transformer";
import { IsBoolean, IsEmail, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { ProductSettings } from "./product.dto";


export class CreateWorkspaceDto {
  @IsNotEmpty({ message: "field name is required" })
  name: string;
}


export type NotificationSettingType = "team_update" | "billing_alert" | "ai_escalation";

export class WorkingHourDetailDto {
  @IsBoolean()
  enabled: boolean;

  @IsString()
  start: string; // "08:00"

  @IsString()
  end: string; // "17:00"
}

export class WeeklyWorkingHoursDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => WorkingHourDetailDto)
  monday?: WorkingHourDetailDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => WorkingHourDetailDto)
  tuesday?: WorkingHourDetailDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => WorkingHourDetailDto)
  wednesday?: WorkingHourDetailDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => WorkingHourDetailDto)
  thursday?: WorkingHourDetailDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => WorkingHourDetailDto)
  friday?: WorkingHourDetailDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => WorkingHourDetailDto)
  saturday?: WorkingHourDetailDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => WorkingHourDetailDto)
  sunday?: WorkingHourDetailDto;
}

export class UpdateWorkspaceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isAiActive?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  rewrite?: boolean;

  @IsOptional()
  @IsString()
  systemRules?: string;

  @IsOptional()
  @IsString()
  greetingText?: string;

  @IsOptional()
  @IsBoolean()
  isProductActive?: boolean;

  @IsOptional()
  @IsString()
  @IsUUID() // Buka komentar jika ID menggunakan UUID/CUID
  activeChatModelId?: string;

  @IsOptional()
  @IsString()
  @IsUUID() // Buka komentar jika ID menggunakan UUID/CUID
  activeEmbeddingModelId?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  workingHoursEnabled?: boolean;

  @IsOptional()
  @IsString()
  timezone?: string; // e.g. "Asia/Jakarta"

  @IsOptional()
  @ValidateNested()
  @Type(() => ProductSettings)
  productSettings: ProductSettings;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => WeeklyWorkingHoursDto) //  Gunakan class baru ini
  workingHours?: WeeklyWorkingHoursDto;

  @IsOptional()
  @IsObject()
  notificationSettings?: Record<NotificationSettingType, any>;
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