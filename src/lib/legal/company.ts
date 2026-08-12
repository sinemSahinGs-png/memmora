/**
 * PayTR / e-ticaret yasal metinleri için satıcı bilgileri.
 * Env ile override edilebilir; aksi halde aşağıdaki sabitler kullanılır.
 */
export const LEGAL_COMPANY = {
  brandName: "Memoora",
  legalName:
    process.env.NEXT_PUBLIC_LEGAL_COMPANY_NAME?.trim() ||
    "Fatma Erden Şahıs Şirketi",
  address:
    process.env.NEXT_PUBLIC_LEGAL_ADDRESS?.trim() ||
    "Akpınar Mahallesi 830. Sokak No: 9/13 Çankaya / Ankara",
  email:
    process.env.NEXT_PUBLIC_LEGAL_EMAIL?.trim() || "ata.duman@hotmail.com",
  phone: process.env.NEXT_PUBLIC_LEGAL_PHONE?.trim() || "0554 750 29 28",
  taxOffice: process.env.NEXT_PUBLIC_LEGAL_TAX_OFFICE?.trim() || "",
  taxNumber:
    process.env.NEXT_PUBLIC_LEGAL_TAX_NUMBER?.trim() || "3130415556",
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://memoora.com.tr",
  shippingBusinessDays: "7–21 iş günü",
  lastUpdated: "12 Ağustos 2026",
} as const;
