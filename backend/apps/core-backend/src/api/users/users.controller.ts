import { CreateUserDto, ResetPasswordDto, UpdateUserDto } from "../../../../lib/dto/user.dto";
import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { UsersService } from "./users.service";
import { AuthGuard } from "@nestjs/passport";
import type { RequestAndPayload } from "../../../../lib/types";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { existsSync, mkdirSync } from "fs";
import { diskStorage } from "multer";
import { extname } from "path";



const UPLOAD_DIR = '/var/berry/images';
@Controller("api/users")
export class UsersController {

    constructor(private service: UsersService) { }


    @ApiOperation({ summary: "Membuat user baru" })
    @ApiResponse({
        status: 201, example: {
            password: "",
            name: "",
            username: "",
            email: "",
            role: "",
            id: "",
            refreshToken: "",
            thumbnail: "",
            profileUrl: "",
            createdAt: "",
            updatedAt: "",
        }, type: "application/json", description: "User berhasil dibuat!"
    })
    @ApiResponse({ status: 400, description: "Input tidak valid" })
    @Post()
    @UseGuards(AuthGuard("jwt"))
    async createUser(@Req() req: RequestAndPayload, @Body() body: CreateUserDto) {
        const userId = req.user.id;
        return await this.service.create(userId, body);
    }

    @ApiOperation({ summary: "Update user" })
    @ApiResponse({
        status: 200, example: {
            password: "",
            name: "",
            username: "",
            email: "",
            role: "",
            id: "",
            refreshToken: "",
            thumbnail: "",
            profileUrl: "",
            createdAt: "",
            updatedAt: "",
        }, description: "User berhasil diupdate!"
    })
    @ApiResponse({ status: 400, description: "Input tidak valid" })
    @Patch()
    @UseGuards(AuthGuard("jwt"))
    async updateUser(@Req() req: RequestAndPayload, @Body() body: UpdateUserDto) {
        const user = req.user;
        return this.service.updateUser(user, body);
    }

    @ApiOperation({ summary: "Reset password user" })
    @ApiResponse({
        status: 200, example: {
            message: "Reset Password successfully"
        }, description: "User berhasil diupdate!"
    })
    @ApiResponse({ status: 400, description: "Input tidak valid" })
    @Post("reset-password")
    @UseGuards(AuthGuard("jwt"))
    async resetPassword(@Req() req: RequestAndPayload, @Body() body: ResetPasswordDto) {
        const userId = req.user.id;
        return this.service.resetPassword(userId, body);
    }

    @ApiOperation({ summary: "mendapatkan stats user" })
    @ApiResponse({ status: 200, description: "User berhasil mendapatkan stats!" })
    @Get("stats")
    @UseGuards(AuthGuard("jwt"))
    async getStats() {
        return this.service.getStats();
    }

    @ApiOperation({ summary: "Upload profile" })
    @ApiResponse({ status: 200, description: "Upload profile berhasil!" })
    @Post("upload")
    @UseGuards(AuthGuard("jwt"))
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: (req, file, cb) => {
                    // Buat folder otomatis jika belum ada
                    if (!existsSync(UPLOAD_DIR)) {
                        mkdirSync(UPLOAD_DIR, { recursive: true });
                    }
                    cb(null, UPLOAD_DIR);
                },
                filename: (req, file, cb) => {
                    // Generate nama file unik (timestamp + random number)
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    cb(null, `foto-${uniqueSuffix}${ext}`);
                },
            }),
            fileFilter: (req, file, cb) => {
                // Validasi tipe file (hanya gambar)
                if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
                    return cb(
                        new BadRequestException('Hanya file gambar yang diperbolehkan!'),
                        false,
                    );
                }
                cb(null, true);
            },
            limits: {
                fileSize: 5 * 1024 * 1024, // Maksimal 5 MB
            },
        }),
    )
    async uploadProfile(@Req() req: RequestAndPayload, @UploadedFile() file: Express.Multer.File) {
        const user = req.user;
        const host = `${req.protocol}://${req.get("host")}`;
        return this.service.uploadProfile(user, host, file);
    }

    @ApiOperation({ summary: "Delete user" })
    @ApiResponse({
        status: 200, example: {
            message: "Delete successfully"
        }, description: "Delete user berhasil!"
    })
    @ApiResponse({ status: 404, description: "User not found" })
    @Delete(":id")
    @UseGuards(AuthGuard("jwt"))
    async deleteUser(@Req() req: RequestAndPayload, @Param("id") id: string) {
        const userId = req.user.id;
        return await this.service.delete(userId, id);
    }
}