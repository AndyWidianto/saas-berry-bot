import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, Matches, MinLength } from "class-validator";

export class SendMessageDto {
    @ApiProperty()
    @IsNotEmpty({ message: "Field type is required"})
    type: "text" | "image" | "voice";

    @ApiProperty()
    @IsNotEmpty({ message: "Field instanceName is required" })
    instanceName: string;

    @ApiProperty()
    @IsNotEmpty({ message: "Field target is required" })
    target: string;

    @ApiProperty()
    @IsNotEmpty({ message: "Field message is required" })
    message: string;
}

export class SendMessageApiDto {
    @ApiProperty()
    @IsNotEmpty({ message: "Field type is required"})
    type: "text" | "image" | "voice";

    @ApiProperty()
    @IsNotEmpty({ message: "Field target is required" })
    id: string;

    @ApiProperty()
    @IsNotEmpty({ message: "Field message is required" })
    message: string;
}

export class MessageTextDto {
    @ApiProperty()
    @IsNotEmpty({ message: "Field instanceName is required"})
    instanceName: string;

    @ApiProperty()
    @IsNotEmpty({ message: "Field to is required" })
    to: string;

    @ApiProperty()
    @IsNotEmpty({ message: "Field message is required" })
    text: string;
}


export class CreateMessageDto {

    @IsOptional()
    whatsappId?: string;

    @IsNotEmpty({ message: 'remoteJid tidak boleh kosong' })
    remoteJid: string;

    @IsOptional()
    pushName?: string;

    @IsNotEmpty({ message: 'content tidak boleh kosong' })
    content: string;

    @IsNotEmpty({ message: 'type tidak boleh kosong' })
    type: string;

    @IsNotEmpty({ message: 'status tidak boleh kosong' })
    status: string;
}