import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";




export class ContactMeDto {
    @IsNotEmpty({ message: 'Nama tidak boleh kosong.' })
    @IsString({ message: 'Nama harus berupa teks.' })
    @MaxLength(100, { message: 'Nama maksimal 100 karakter.' })
    @Transform(({ value }) => value?.trim())
    name: string;

    @IsNotEmpty({ message: 'Email tidak boleh kosong.' })
    @IsEmail({}, { message: 'Format email tidak valid.' })
    @Transform(({ value }) => value?.trim().toLowerCase())
    email: string;

    @IsOptional()
    @IsString({ message: 'Nama workspace harus berupa teks.' })
    @MaxLength(100, { message: 'Nama workspace maksimal 100 karakter.' })
    @Transform(({ value }) => value?.trim())
    workspace?: string;

    @IsNotEmpty({ message: 'Pesan tidak boleh kosong.' })
    @IsString({ message: 'Pesan harus berupa teks.' })
    @MinLength(10, { message: 'Pesan minimal 10 karakter.' })
    @MaxLength(2000, { message: 'Pesan maksimal 2000 karakter.' })
    @Transform(({ value }) => value?.trim())
    message: string;
}

export class LoginDto {
    @ApiProperty({ example: "example@gmail.com" })
    @IsNotEmpty({ message: 'Email tidak boleh kosong' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: "Example12345" })
    @IsNotEmpty({ message: 'Password tidak boleh kosong' })
    password: string;
}

export class RegisterDto {
    @ApiProperty()
    @IsNotEmpty()
    name: string;


    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Password tidak boleh kosong' })
    @MinLength(8, { message: 'Password minimal harus 8 karakter' })
    @Matches(/[A-Z]/, {
        message: 'Password harus mengandung setidaknya satu huruf besar'
    })
    password: string;

    @ApiProperty()
    @IsOptional()
    codePin: number;
}


export class ForgotPasswordDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    email: string;
}

export class ResetPasswordAuthDto {
    @ApiProperty()
    @IsNotEmpty()
    key: string;


    @ApiProperty()
    @IsNotEmpty({ message: 'Password tidak boleh kosong' })
    @MinLength(8, { message: 'Password minimal harus 8 karakter' })
    @Matches(/[A-Z]/, {
        message: 'Password harus mengandung setidaknya satu huruf besar'
    })
    password: string;
}