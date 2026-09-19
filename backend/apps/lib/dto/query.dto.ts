import { IsOptional, IsString, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PlatformType } from '@prisma/client';



export const StatusStock = {
  OUT_OF_STOCK: "OUT_OF_STOCK",
  IN_STOCK: "IN_STOCK",
  LOW_STOCK: "LOW_STOCK"
}

export class GetQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;


  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(StatusStock, { message: "Status stock tidak sesuai" })
  stockStatus?: "OUT_OF_STOCK" | "IN_STOCK" | "LOW_STOCK";

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Limit minimal adalah 1' })
  @Max(100, { message: 'Limit maksimal adalah 100' })
  limit?: number = 20;
}

export class QueryNotificationDto extends GetQueryDto {
  @IsOptional()
  @IsString()
  status: "READ" | "UNREAD";
}

export class GetQueryContactDto extends GetQueryDto {
  @IsOptional()
  @IsString()
  platform?: PlatformType;
}