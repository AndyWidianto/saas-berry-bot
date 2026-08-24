import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsObject, IsArray } from 'class-validator';

export class CreateWorkspaceContactDto  {
  @IsNotEmpty({ message: 'Nomor telepon atau Sender ID wajib diisi' })
  @IsString()
  phoneOrSenderId: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class DeleteContactsDto {
  @IsNotEmpty({ message: 'Nomor telepon atau Sender ID wajib diisi' })
  @IsArray({ message: "Ids wajib array string"})
  ids: string[];
}