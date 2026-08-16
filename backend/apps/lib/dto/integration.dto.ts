import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";


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
    platform: "WHATSAPP_BAYLIES" | "EMAIL";

    @ApiProperty()
    @IsOptional()
    settings: Record<string, any>;
}

export class UpdateIntegrationDto extends PartialType(CreateIntegrationDto) {}