import { Injectable, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from "cloudinary";

@Injectable()
export class CloudinaryService {
    constructor(private configService: ConfigService) {
        cloudinary.config({
            cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
        });
    }
    async uploadFile(filename: string, file: Express.Multer.File): Promise<UploadApiResponse> {
        if (!file) {
            throw new BadRequestException('File tidak ditemukan');
        }

        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'complaints_attachments',
                    public_id: filename.split('.').slice(0, -1).join('.'), // Menentukan nama file tanpa ekstensi di Cloudinary
                    resource_type: 'auto',
                },
                (error, result) => {
                    if (error) return reject(error);
                    if (!result) return reject(new Error("Upload gagal"));
                    resolve(result);
                }
            );
            uploadStream.end(file.buffer);
        });
    }
    async deleteFile(publicId: string): Promise<any> {
        if (!publicId) {
            throw new BadRequestException('Public ID tidak boleh kosong');
        }

        return new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(
                publicId,
                {
                    resource_type: 'image', 
                    invalidate: true 
                },
                (error, result) => {
                    if (error) return reject(error);
                    if (result?.result === 'not found') {
                        return reject(new BadRequestException('File tidak ditemukan di Cloudinary'));
                    }

                    resolve(result);
                }
            );
        });
    }
}