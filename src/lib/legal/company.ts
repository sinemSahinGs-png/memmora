/**
 * PayTR / e-ticaret yasal metinleri icin satici bilgileri.
 * Env ile override edilebilir.
 * Turkce karakterler unicode escape ile tutulur.
 */
export const LEGAL_COMPANY = {
  brandName: "Memoora",
  legalName:
    process.env.NEXT_PUBLIC_LEGAL_COMPANY_NAME?.trim() ||
    "Fatma Erden \u015eah\u0131s \u015eirketi",
  address:
    process.env.NEXT_PUBLIC_LEGAL_ADDRESS?.trim() ||
    "Akp\u0131nar Mahallesi 830. Sokak No: 9/13 \u00c7ankaya / Ankara",
  email:
    process.env.NEXT_PUBLIC_LEGAL_EMAIL?.trim() || "ata.duman@hotmail.com",
  phone: process.env.NEXT_PUBLIC_LEGAL_PHONE?.trim() || "0554 750 29 28",
  taxOffice: process.env.NEXT_PUBLIC_LEGAL_TAX_OFFICE?.trim() || "",
  taxNumber:
    process.env.NEXT_PUBLIC_LEGAL_TAX_NUMBER?.trim() || "3130415556",
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://memoora.com.tr",
  shippingBusinessDays: "7\u201321 i\u015f g\u00fcn\u00fc",
  lastUpdated: "12 A\u011fustos 2026",
} as const;
