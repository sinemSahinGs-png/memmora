export type PaymentIntentStatus =
  | "requires_configuration"
  | "requires_action"
  | "processing"
  | "succeeded"
  | "failed";

export interface PaymentLineItem {
  productType: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface CreatePaymentIntentInput {
  orderId: string;
  amount: number;
  currency: "TRY";
  description: string;
  customerEmail?: string | null;
  customerName?: string | null;
  metadata?: Record<string, string>;
  lineItems: PaymentLineItem[];
  successUrl: string;
  failUrl: string;
}

export interface PaymentIntentResult {
  status: PaymentIntentStatus;
  provider: string;
  paymentUrl?: string | null;
  reference?: string | null;
  message: string;
  missingCredentials?: string[];
  checklist?: string[];
}

export interface PaymentProvider {
  readonly id: string;
  readonly displayName: string;
  isConfigured(): boolean;
  getMissingCredentials(): string[];
  createPaymentIntent(
    input: CreatePaymentIntentInput,
  ): Promise<PaymentIntentResult>;
}
