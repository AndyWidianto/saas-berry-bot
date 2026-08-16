import { ApiProperty, PartialType } from '@nestjs/swagger';
import { ProviderAI } from '@prisma/client';
import { 
  IsString, 
  IsNotEmpty, 
  IsEnum, 
  IsBoolean, 
  IsOptional, 
  IsInt, 
  Min, 
  IsNumber 
} from 'class-validator';

export class CreateAIModelDto {
    @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  modelCode: string;

  @ApiProperty()
  @IsEnum(ProviderAI)
  @IsNotEmpty()
  provider: ProviderAI;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isChat?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isEmbedding?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isVision?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isAudio?: boolean;

  @ApiProperty()
  @IsInt()
  @Min(0)
  @IsOptional()
  contextWindow?: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  @IsOptional()
  maxOutputToken?: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @IsOptional()
  inputPricePer1M?: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @IsOptional()
  outputPricePer1M?: number;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateAIModelDto extends PartialType(CreateAIModelDto) {}
export class BuyTokenDto {
    @ApiProperty()
    @IsNotEmpty({ message: "token is required" })
    token: number;
}