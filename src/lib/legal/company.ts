/**
 * PayTR / e-ticaret yasal metinleri için satıcı bilgileri.
 * Canlı onay öncesi bu alanları gerçek ticaret bilgilerinizle doldurun.
 * İsterseniz aynı değerleri Vercel env ile de override edebilirsiniz.
 */
export const LEGAL_COMPANY = {
  brandName: "Memoora",
  /** Ticari unvan (örn. XYZ Ticaret Ltd. Şti.) */
  legalName:
    process.env.NEXT_PUBLIC_LEGAL_COMPANY_NAME?.trim() || "Memoora",
  address:
    process.env.NEXT_PUBLIC_LEGAL_ADDRESS?.trim() ||
    "Türkiye — açık adres PayTR onayı öncesi panoya işlenecektir.",
  email:
    process.env.NEXT_PUBLIC_LEGAL_EMAIL?.trim() || "hello@memoora.com.tr",
  phone: process.env.NEXT_PUBLIC_LEGAL_PHONE?.trim() || "",
  taxOffice: process.env.NEXT_PUBLIC_LEGAL_TAX_OFFICE?.trim() || "",
  taxNumber: process.env.NEXT_PUBLIC_LEGAL_TAX_NUMBER?.trim() || "",
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://memoora.com.tr",
  /** Kişiye özel üretim ürünlerde tahmini kargo süresi */
  shippingBusinessDays: "7–21 iş günü",
  lastUpdated: "12 Ağustos 2026",
} as const;

export function hasCompleteLegalContact(): boolean {
  return Boolean(
    LEGAL_COMPANY.legalName &&
      LEGAL_COMPANY.address &&
      !LEGAL_COMPANY.address.includes("işlenecektir") &&
      LEGAL_COMPANY.email &&
      LEGAL_COMPANY.phone,
  );
}
