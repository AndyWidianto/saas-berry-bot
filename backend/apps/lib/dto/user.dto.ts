import { ApiProperty, OmitType, PartialType } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { IsEmail, IsNotEmpty, Matches, MinLength } from "class-validator";


export class CreateUserDto {
    @ApiProperty({
        example: "Andy Widianto",
        description: "Nama Lengkap User"
    })
    @IsNotEmpty({ message: 'Name tidak boleh kosong' })
    name: string;

    @ApiProperty({
        example: "andy123",
        description: "Username"
    })
    @IsNotEmpty({ message: 'username tidak boleh kosong' })
    username: string;

    @ApiProperty({
        example: "example@gmail.com",
        description: "Email pengguna"
    })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({
        example: "Password12054&",
        description: "Password Pengguna"
    })
    @IsNotEmpty({ message: 'Password tidak boleh kosong' })
    @MinLength(8, { message: 'Password minimal harus 8 karakter' })
    @Matches(/[A-Z]/, {
        message: 'Password harus mengandung setidaknya satu huruf besar'
    })
    password: string;


    @ApiProperty({
        example: "Andy Widianto",
        description: "Nama Lengkap User"
    })
    @IsNotEmpty({ message: 'Role tidak boleh kosong' })
    role: UserRole;
}

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ["password"])) { }


export class ResetPasswordDto {
    @IsNotEmpty({ message: 'Password tidak boleh kosong' })
    @MinLength(8, { message: 'Password minimal harus 8 karakter' })
    @Matches(/[A-Z]/, {
        message: 'Password harus mengandung setidaknya satu huruf besar'
    })
    password: string;

    @IsNotEmpty({ message: 'Password baru tidak boleh kosong' })
    @MinLength(8, { message: 'Password baru minimal harus 8 karakter' })
    @Matches(/[A-Z]/, {
        message: 'Password baru harus mengandung setidaknya satu huruf besar'
    })
    newPassword: string;
}
