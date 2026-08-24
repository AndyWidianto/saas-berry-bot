import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class StorageService {
    private readonly basePath = path.join('/', 'var', 'berry', 'images');

    async deleteFile(filename: string): Promise<{ message: string }> {
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