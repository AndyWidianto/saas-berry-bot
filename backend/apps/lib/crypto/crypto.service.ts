import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  private readonly algorithm = 'aes-256-gcm';
  // Secret Key diambil dari environment variable (Wajib 32 karakter / 32 bytes)
  private readonly secretKey = Buffer.from(
    process.env.ENCRYPTION_KEY || '23467578901234567890123456324567', 
    'utf-8'
  );

  /**
   * Mengunci (Encrypt) data sensitif menggunakan Secret Key
   */
  encrypt(text: string): string {
    if (!text) return text;

    // Generate random IV 16 bytes setiap kali enkripsi
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Ambil Auth Tag untuk verifikasi integritas data
    const authTag = cipher.getAuthTag().toString('hex');

    // Format gabungan: IV:AuthTag:EncryptedData
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * Membuka (Decrypt) data sensitif menggunakan Secret Key yang sama
   */
  decrypt(cipherText: string): string {
    if (!cipherText || !cipherText.includes(':')) return cipherText;

    try {
      const [ivHex, authTagHex, encryptedHex] = cipherText.split(':');

      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, this.secretKey, iv);

      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      // Jika secret key salah atau data di database dirusak/diubah
      throw new InternalServerErrorException('Gagal mendekripsi data sensitif. Key tidak cocok atau data rusak.');
    }
  }
}