import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, Matches, MinLength } from "class-validator";

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
    username: string;


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
}