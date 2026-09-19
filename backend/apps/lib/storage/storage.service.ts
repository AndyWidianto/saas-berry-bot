import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';
import { NodeHttpHandler } from "@smithy/node-http-handler";
import * as https from "https";

@Injectable()
export class StorageService {
    private readonly basePath = path.join('/', 'var', 'berry', 'images');
    private readonly basePathFile = path.join('/', 'var', 'berry', 'files');

    private s3Client: S3Client;
    private bucketName = "";
    private publicDomain = "";

    constructor(private configService: ConfigService) {
        this.publicDomain = this.configService.get("R2_PUBLIC_DOMAIN") ?? "";
        this.bucketName = this.configService.get("R2_BUCKET_NAME") ?? "";
        const accountId = this.configService.get("R2_ACCOUNT_ID") ?? "";
        this.s3Client = new S3Client({
            region: 'auto',
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: this.configService.get("R2_ACCESS_KEY_ID") ?? "",
                secretAccessKey: this.configService.get("R2_SECRET_ACCESS_KEY") ?? "",
            },
        });
    }

    private validateFile(mimetype: string, size: number) {
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

        if (!allowedMimeTypes.includes(mimetype)) {
            throw new BadRequestException(`Tipe file '${mimetype}' tidak diizinkan.`);
        }
        const maxFileSize = 10 * 1024 * 1024; // 10MB
        if (size > maxFileSize) {
            throw new BadRequestException('Ukuran file maksimal adalah 10 MB');
        }
    }

    async uploadFile(file: Express.Multer.File): Promise<{ filename: string; url: string }> {
        if (!file) {
            throw new BadRequestException('File wajib diunggah');
        }

        this.validateFile(file.mimetype, file.size)

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

    async cloudflareUploadFile(file: Express.Multer.File, key: string): Promise<string> {
        this.validateFile(file.mimetype, file.size);
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            CacheControl: 'public, max-age=31536000, immutable',
        });

        await this.s3Client.send(command);
        return `${this.publicDomain}/${key}`;
    }

    // Generate Presigned URL (Akses sementara untuk file privat)
    async cloudflareGetPresignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });

        return await getSignedUrl(this.s3Client, command, { expiresIn: expiresInSeconds });
    }

    // Hapus File dari R2
    async cloudflareDeleteFile(key: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });

        await this.s3Client.send(command);
    }

    async uploadBase64File(base64String: string, key: string) {
        // Bersihkan prefix data URI jika ada (e.g. "data:image/png;base64,")
        const matches = base64String.match(/^data:(.+);base64,(.+)$/);

        let mimeType = 'image/jpeg'; // Default fallback
        let pureBase64 = base64String;

        if (matches && matches.length === 3) {
            mimeType = matches[1];    // Mengambil MIME Type (misal: "image/png")
            pureBase64 = matches[2];  // Mengambil string Base64 murni
        }

        // Ubah string Base64 menjadi Buffer fisik
        const fileBuffer = Buffer.from(pureBase64, 'base64');

        // Buat Command PutObject untuk Cloudflare R2
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,                   // Nama file unik di R2 (misal: "uuid.png")
            Body: fileBuffer,           // Buffer hasil konversi
            ContentType: mimeType,       // Tipe file agar browser bisa menampilkan langsung
            CacheControl: 'public, max-age=31536000, immutable', // Cache CDN 1 tahun
        });

        // Kirim request ke Cloudflare R2
        await this.s3Client.send(command);

        // Kembalikan URL publik file (sesuai Custom Domain Cloudflare kamu)
        return `${this.publicDomain}/${key}`;
    }
}