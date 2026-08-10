/**
 * Integration checklist — required from the client before a real POS provider
 * can be wired. Keep this list in sync with the purchase payment UI.
 */
export const PAYMENT_INTEGRATION_CHECKLIST = [
  "POS / ödeme sağlayıcı adı (ör. iyzico, PayTR, Param, Craftgate)",
  "API dokümantasyonu (ödeme başlatma, 3D Secure, webhook)",
  "Test API key / secret",
  "Canlı API key / secret (ayrı, production için)",
  "Merchant / terminal / store ID’leri (varsa)",
  "3D Secure zorunluluğu (zorunlu / opsiyonel)",
  "Başarılı ödeme callback URL",
  "Başarısız ödeme callback URL",
  "Webhook / bildirim gereksinimleri ve imza doğrulama",
  "Desteklenen kart / ödeme yöntemleri",
  "Taksit desteği gerekli mi?",
  "Fatura / şirket faturalandırma gereksinimleri",
] as const;

export const PAYMENT_ENV_KEYS = [
  "MEMOORA_PAYMENT_PROVIDER",
  "MEMOORA_PAYMENT_API_KEY",
  "MEMOORA_PAYMENT_API_SECRET",
  "MEMOORA_PAYMENT_MERCHANT_ID",
  "MEMOORA_PAYMENT_SUCCESS_URL",
  "MEMOORA_PAYMENT_FAIL_URL",
  "MEMOORA_PAYMENT_WEBHOOK_SECRET",
] as const;

export function getMissingPaymentEnvKeys(): string[] {
  return PAYMENT_ENV_KEYS.filter((key) => {
    if (key === "MEMOORA_PAYMENT_PROVIDER") {
      const value = process.env.MEMOORA_PAYMENT_PROVIDER?.trim();
      return !value || value === "placeholder";
    }
    return !process.env[key]?.trim();
  });
}
