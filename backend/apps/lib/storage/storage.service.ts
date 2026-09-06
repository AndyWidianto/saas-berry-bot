import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class StorageService {
    private readonly basePath = path.join('/', 'var', 'berry', 'images');
    private readonly basePathFile = path.join('/', 'var', 'berry', 'files');

    async uploadFile(file: Express.Multer.File): Promise<{ filename: string; url: string }> {
        if (!file) {
            throw new BadRequestException('File wajib diunggah');
        }

        // Daftar MIME type yang diizinkan (Gambar, Dokumen, Audio, Video)
        const allowedMimeTypes = [
            // Gambar
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
            // Dokumen
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
            'text/plain',
            // Audio & Video (opsional, sesuaikan kebutuhan)
            'audio/mpeg',
            'audio/ogg',
            'audio/wav',
            'video/mp4',
            'video/webm',
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(`Tipe file '${file.mimetype}' tidak diizinkan.`);
        }

        const maxFileSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxFileSize) {
            throw new BadRequestException('Ukuran file maksimal adalah 10 MB');
        }

        try {
            await fs.mkdir(this.basePathFile, { recursive: true });
            const fileExt = path.extname(file.originalname).toLowerCase();
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

            // Diubah jadi file- agar representatif untuk non-gambar
            const safeFilename = `file-${uniqueSuffix}${fileExt}`;

            const filePath = path.join(this.basePathFile, safeFilename);

            await fs.writeFile(filePath, file.buffer);

            return {
                filename: safeFilename,
                url: `/files/${safeFilename}` // Sesuaikan path static serve kamu
            };
        } catch (error: any) {
            throw new InternalServerErrorException(`Gagal mengunggah file: ${error.message}`);
        }
    }

    async deleteFile(filename: string): Promise<{ message: string }> {
        if (!filename) {
            throw new BadRequestException('Filename harus diisi');
        }

        const safeFilename = path.basename(filename);
        const filePath = path.join(this.basePathFile, safeFilename);

        try {
            await fs.access(filePath);
            await fs.unlink(filePath);

            return { message: `File ${safeFilename} berhasil dihapus` };
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                throw new NotFoundException(`File '${safeFilename}' tidak ditemukan`);
            }

            // Error sistem/permission lainnya
            throw new InternalServerErrorException(`Gagal menghapus file: ${error.message}`);
        }
    }

    async deleteProfile(filename: string): Promise<{ message: string }> {
        if (!filename) {
            throw new BadRequestException('Filename harus diisi');
        }

        const safeFilename = path.basename(filename);
        const filePath = path.join(this.basePath, safeFilename);

        try {
            await fs.access(filePath);
            await fs.unlink(filePath);

            return { message: `File ${safeFilename} berhasil dihapus` };
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                throw new NotFoundException(`File '${safeFilename}' tidak ditemukan`);
            }

            // Error sistem/permission lainnya
            throw new InternalServerErrorException(`Gagal menghapus file: ${error.message}`);
        }
    }
}