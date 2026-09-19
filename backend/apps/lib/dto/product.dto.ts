import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsNotEmpty,
  IsUrl,
  Min,
  IsArray,
  ValidateNested,
  IsObject,
  IsEnum
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';



export class Field {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  id: number;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsBoolean()
  required: boolean = false;
}

export class QrisMethod {
  @IsString()
  @IsOptional()
  name: string;
  @IsString()
  @IsOptional()
  imageUrl: string;
  @IsString()
  @IsOptional()
  filename: string;
}

export class BankTranfer {
  @IsString()
  @IsNotEmpty({ message: "Nama Pemilik Rekening wajib diisi" })
  bankName: string;
  @IsString()
  @IsNotEmpty({ message: "Nomber rekening wajib diisi" })
  accountNumber: string;
  @IsString()
  @IsNotEmpty({ message: "Provider bank wajib diisi" })
  accountHolder: string;

  @IsNumber()
  @IsNotEmpty({ message: "id bank wajib diisi" })
  id: number;
}
export class PaymentMethod {
  @IsOptional()
  @ValidateNested() // <--- Tambahkan ini
  @Type(() => QrisMethod)
  qris: QrisMethod;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BankTranfer)
  bankItems: BankTranfer[];
}

export enum DeliveryMode {
  RAJAONGKIR = 'RAJAONGKIR',
  MANUAL_FLAT = 'MANUAL_FLAT',
  MANUAL_CALCULATE_LATER = 'MANUAL_CALCULATE_LATER',
}

// DTO Konfigurasi Khusus RajaOngkir
export class RajaOngkirConfigDto {
  @IsString()
  @IsNotEmpty()
  apiKey: string;

  @IsString()
  @IsNotEmpty()
  originAreaId: string; // ID Kota/Kecamatan asal pengiriman

  @IsOptional()
  @IsString()
  originCityName?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  enabledCouriers?: string[]; // Contoh: ["jne", "jnt", "sicepat"]
}

// DTO Konfigurasi Khusus Tarif Manual / Flat Rate
export class ManualDeliveryConfigDto {
  @IsNumber()
  @Min(0)
  flatRateAmount: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

// DTO Utama Metode Delivery
export class MetodeDelivery {
  @IsEnum(DeliveryMode)
  @IsNotEmpty()
  mode: DeliveryMode;

  // Diisi jika mode === DeliveryMode.RAJAONGKIR
  @IsOptional()
  @ValidateNested()
  @Type(() => RajaOngkirConfigDto)
  rajaOngkirConfig?: RajaOngkirConfigDto;

  // Diisi jika mode === DeliveryMode.MANUAL_FLAT
  @IsOptional()
  @ValidateNested()
  @Type(() => ManualDeliveryConfigDto)
  manualConfig?: ManualDeliveryConfigDto;
}
export class ProductSettings {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true }) // <--- Wajib untuk array
  @Type(() => Field)
  fields: Field[];

  @IsOptional()
  @ValidateNested() // <--- Wajib untuk nested object
  @Type(() => PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @ValidateNested() // <--- Wajib untuk nested object
  @Type(() => MetodeDelivery)
  deliveryMethod: MetodeDelivery;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  benefits?: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsUrl()
  @IsOptional()
  thumbnail?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @IsBoolean()
  @IsOptional()
  isBestSeller?: boolean;

  // @IsString()
  // @IsOptional()
  // sku?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateProductDto extends PartialType(CreateProductDto) { }