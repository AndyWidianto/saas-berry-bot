

export interface CreateProductFormData {
  name: string;
  category?: string;
  description: string;
  benefits?: string;
  price: number;
  isBestSeller?: boolean;
  stock?: number;
  isActive?: boolean;
  file?: File | null; // File gambar yang diunggah
}

export interface Product {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  workspaceId: string;
  category: string | null;
  description: string;
  benefits: string | null;
  imageUrl: string | null;
  thumbnail: string | null;
  price: string;
  isBestSeller: boolean;
  sku: string | null;
  stock: number;
}


export interface SettingItem {
  id: number;
  key: string;
  value: string;
  isSecret: boolean;
}

export type DeliveryMode = "RAJAONGKIR" | "MANUAL_FLAT" | "MANUAL_CALCULATE_LATER";

export interface CustomerFieldItem {
  id: number;
  label: string;
  name: string;
  required: boolean;
}

export interface BankItem {
  id: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export interface RajaOngkirConfigDto {
  apiKey: string;
  originAreaId: string; // ID Kota/Kecamatan asal pengiriman
  originCityName?: string;
  enabledCouriers?: string[]; // Contoh: ["jne", "jnt", "sicepat"]
}

// DTO Konfigurasi Khusus Tarif Manual / Flat Rate
export interface ManualDeliveryConfigDto {
  flatRateAmount: number;
  notes?: string;
}

// DTO Utama Metode Delivery
export interface MetodeDelivery {
  mode: DeliveryMode;
  rajaOngkirConfig?: RajaOngkirConfigDto;
  manualConfig?: ManualDeliveryConfigDto;
}

export type OrderStatus = "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "COMPLETED" | "CANCELLED";

export type PaymentMethod = "QRIS" | "BANK_TRANSFER" | "COD";

export interface OrderItem {
  id: string;
  subtotal: string;
  createdAt: string;
  imageUrl: string | null;
  price: string;
  orderId: string;
  productId: string | null;
  productName: string;
  quantity: number;
  thumbnailUrl: string | null;
}

export interface Order {
  workspaceId: string;
  id: string;
  orderNumber: string;
  shortCode: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentProofUrl: string | null;
  paidAt: string | null;
  subtotal: string;
  shippingCost: string;
  discountTotal: string;
  grandTotal: string;
  notes: string | null;
  items: OrderItem[];
  details: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}