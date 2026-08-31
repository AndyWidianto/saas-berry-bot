import { ApiProperty, PartialType } from "@nestjs/swagger";
import { PlatformType } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsOptional } from "class-validator";


export class CreateIntegrationDto {
    @ApiProperty()
    @IsOptional()
    number: string | null;

    @ApiProperty()
    @IsNotEmpty({ message: "field name is required"})
    name: string;

    @ApiProperty()
    @IsOptional()
    email: string | null;

    @ApiProperty()
    @IsNotEmpty({ message: "field platform is required"})
    @IsEnum(PlatformType, {
        message: `platform must be one of the following values: ${Object.values(PlatformType).join(', ')}`
    })
    platform: PlatformType

    @ApiProperty()
    @IsOptional()
    settings: Record<string, any>;
}

export class UpdateIntegrationDto extends PartialType(CreateIntegrationDto) {}