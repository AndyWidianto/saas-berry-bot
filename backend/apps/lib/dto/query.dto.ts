import { IsOptional, IsString, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PlatformType } from '@prisma/client';


export class GetQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;


  @IsOptional()
  @IsString()
  search?: string;

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