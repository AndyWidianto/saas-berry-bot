import { ApiProperty } from "@nestjs/swagger";
import { PlatformType } from "@prisma/client";
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsUrl, IsIn } from 'class-validator';

export class SendMessageDto {
    @ApiProperty()
    @IsNotEmpty({ message: "Field type is required" })
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
    @IsNotEmpty({ message: "Field type is required" })
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
    @IsNotEmpty({ message: "Field instanceName is required" })
    instanceName: string;

    @ApiProperty()
    @IsNotEmpty({ message: "Field to is required" })
    to: string;

    @ApiProperty()
    @IsNotEmpty({ message: "Field message is required" })
    text: string;
}


export class MessageMediaDto {
    @ApiProperty()
    @IsNotEmpty({ message: "Field instanceName is required" })
    instanceName: string;

    @ApiProperty()
    @IsNotEmpty({ message: "Field to is required" })
    to: string;

    @ApiProperty()
    @IsNotEmpty({ message: "iamgeUrl is required" })
    imageUrl: string;

    @ApiProperty()
    @IsOptional()
    caption: string;
}

export class CreateMessageDto {
    @IsEnum(PlatformType)
    @IsNotEmpty()
    platform: PlatformType;

    @IsString()
    @IsOptional()
    providerMessageId?: string;

    @IsBoolean()
    @IsOptional()
    fromMe?: boolean = false;

    @IsString()
    @IsNotEmpty()
    senderId: string;

    @IsString()
    @IsOptional()
    senderName?: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsIn(['text', 'image', 'document', 'audio', 'video'])
    @IsOptional()
    type?: string = 'text';

    @IsOptional()
    thumbnail?: string;

    //@IsUrl({}, { message: 'mediaUrl harus berupa URL valid' })
    @IsOptional()
    mediaUrl?: string;

    @IsString()
    @IsOptional()
    status?: string = 'sent';
}