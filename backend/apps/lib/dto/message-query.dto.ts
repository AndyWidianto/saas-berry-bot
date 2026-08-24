import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetQueryBotDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Limit minimal adalah 1' })
  @Max(100, { message: 'Limit maksimal adalah 100' })
  limit?: number = 20;
}