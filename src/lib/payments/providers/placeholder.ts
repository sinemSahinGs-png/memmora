import {
  getMissingPaymentEnvKeys,
  PAYMENT_INTEGRATION_CHECKLIST,
} from "../checklist";
import type {
  CreatePaymentIntentInput,
  PaymentIntentResult,
  PaymentProvider,
} from "../types";

/**
 * Safe development placeholder — never fabricates a successful payment.
 * Surfaces exactly what credentials / POS details are still required.
 */
export const placeholderPaymentProvider: PaymentProvider = {
  id: "placeholder",
  displayName: "POS entegrasyonu bekleniyor",

  isConfigured() {
    return false;
  },

  getMissingCredentials() {
    return getMissingPaymentEnvKeys();
  },

  async createPaymentIntent(
    _input: CreatePaymentIntentInput,
  ): Promise<PaymentIntentResult> {
    return {
      status: "requires_configuration",
      provider: this.id,
      paymentUrl: null,
      reference: null,
      message:
        "Ödeme altyapısı henüz yapılandırılmadı. Gerçek POS bilgileri bekleniyor — sahte başarılı ödeme oluşturulmaz.",
      missingCredentials: this.getMissingCredentials(),
      checklist: [...PAYMENT_INTEGRATION_CHECKLIST],
    };
  },
};
