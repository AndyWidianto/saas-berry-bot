import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsOptional, IsUrl } from "class-validator";



export class CreateKnowledgeDto { 

    @ApiProperty()
    @IsNotEmpty({ message: "field name is required" })
    name: string;

    @ApiProperty()
    @IsOptional()
    content?: string;
}


export class UpdateKnowledgeDto extends PartialType(CreateKnowledgeDto) {}

export class CreateKnowledgeUrlDto {
  @IsNotEmpty()
  @IsUrl({}, { message: 'URL tidak valid' })
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    return value.trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
  })
  url: string;
}


