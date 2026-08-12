import type { PurchaseProductType } from "./pricing";

export type MemooraOrderPaymentStatus =
  | "awaiting_payment"
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "provider_not_configured";

export type MemooraOrderStatus =
  | "draft"
  | "pending_payment"
  | "confirmed"
  | "cancelled"
  | "fulfilled";

export interface MemooraOrderItemInput {
  productType: PurchaseProductType;
  quantity: number;
}

export interface CreateMemooraOrderInput {
  brideName: string;
  groomName: string;
  weddingDate: string;
  items: MemooraOrderItemInput[];
  customerEmail?: string;
  customerPhone?: string;
  customerName?: string;
}

export interface MemooraOrderRecord {
  id: string;
  brideName: string;
  groomName: string;
  weddingDate: string;
  subtotal: number;
  vat: number;
  total: number;
  vatRate: number;
  paymentStatus: MemooraOrderPaymentStatus;
  orderStatus: MemooraOrderStatus;
  paymentProvider: string | null;
  paymentReference: string | null;
  merchantOid?: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  customerName: string | null;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    productType: PurchaseProductType;
    productName: string;
    quantity: number;
    unitPrice: number;
    lineSubtotal: number;
    lineVat: number;
    lineTotal: number;
  }>;
}
