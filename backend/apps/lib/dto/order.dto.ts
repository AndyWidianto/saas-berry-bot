import { OrderStatus } from "@prisma/client";
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { DeliveryMode } from "./product.dto";

export interface Order {
    id: string;
    product_name: string;
    price: number;
    quantity: number;
}

export class OrderData {
    @IsOptional()
    detail: Record<string, any>;
    @IsOptional()
    total: number;
    @IsOptional()
    shippingCost: number;
    @IsNotEmpty()
    order: Order[];
    @IsNotEmpty()
    delivery: "SELF_PICKUP" | "LOCAL_DELIVERY" | "MANUAL_FLAT";
    @IsNotEmpty()
    payment_method: "QRIS" | "BANK_TRANSFER";
}

export interface OrderCache {
    status: "WAITING_FOR_PAYMENT",
    total: number,
    orderId: string,
    detail: Record<string, string>
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus, { message: 'Status pesanan tidak valid' })
  status: OrderStatus;

  // Opsional: jika ingin sekaligus mencatat kapan lunas saat status COMPLETED/PAID
  @IsOptional()
  @IsDateString({}, { message: 'Format paidAt harus ISO Date' })
  paidAt?: string | Date | null;

  // Opsional: jika ada pengunggahan/perubahan foto bukti transfer saat update status
  @IsOptional()
  @IsString()
  paymentProofUrl?: string | null;
}