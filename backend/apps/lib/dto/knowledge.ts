import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";



export class CreateKnowledgeDto { 

    @ApiProperty()
    @IsNotEmpty({ message: "field name is required" })
    name: string;

    @ApiProperty()
    @IsOptional()
    content?: string;
}


export class UpdateKnowledgeDto extends PartialType(CreateKnowledgeDto) {}