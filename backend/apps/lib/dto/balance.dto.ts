import { ApiProperty } from '@nestjs/swagger';
import { 
  IsNotEmpty, 
  IsOptional, 
  IsString, 
  ValidateNested, 
  IsEmail, 
  MaxLength 
} from 'class-validator';

export class TopupDto {
  @ApiProperty()
  @IsNotEmpty({ message: "nominal is required " })
  nominal: number;
}

export class MidtransCallbackDto {
  transaction_time: string;
  transaction_status: string;
  transaction_id: string;
  status_message: string;
  status_code: string;
  signature_key: string;
  payment_type: string;
  order_id: string;
  merchant_id: string;
  gross_amount: string;
  currency: string;
  fraud_status?: string;
  va_numbers?: Array<{
    va_number: string;
    bank: string;
  }>;
}