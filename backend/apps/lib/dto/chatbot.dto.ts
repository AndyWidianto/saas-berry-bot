import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { 
  IsNotEmpty, 
  IsOptional, 
  IsString, 
  ValidateNested, 
  IsEmail, 
  MaxLength 
} from 'class-validator';

export class UserMetaDataDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  externalId?: string; // ID user di database milik Klien (misal: "usr_9988")

  @ApiProperty()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string; // Nama user (misal: "Andy Widianto")


  @ApiProperty()
  @IsEmail()
  @IsOptional()
  email?: string; // Email user
}


export class SendPublicMessageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'sessionId wajib diisi untuk mengikat riwayat percakapan.' })
  sessionId: string;


  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'message tidak boleh kosong.' })
  @MaxLength(4000, { message: 'Pesan terlalu panjang, maksimal 4000 karakter.' })
  message: string;

  @ApiProperty()
  @IsOptional()
  @ValidateNested()
  @Type(() => UserMetaDataDto)
  user?: UserMetaDataDto;
}

export class CreateKnowledgeDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  @MaxLength(4000, { message: 'Pesan terlalu panjang, maksimal 4000 karakter.' })
  url?: string;

}