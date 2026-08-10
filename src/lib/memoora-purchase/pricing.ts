/**
 * Memoora purchase pricing — single source of truth.
 * Amounts are in TRY (TL), VAT exclusive unit prices.
 */

export const MAGNET_UNIT_PRICE = 55;
export const KEYCHAIN_UNIT_PRICE = 35;

/** Turkey standard KDV rate */
export const VAT_RATE = 0.2;

export const MIN_WEDDING_DATE_OFFSET_DAYS = 4;

export const WEDDING_DATE_TOO_SOON_MESSAGE =
  "Düğün tarihi bugünden en az 4 gün sonrası olmalıdır.";

export type PurchaseProductType = "magnet" | "keychain";

export const PURCHASE_PRODUCTS = {
  magnet: {
    id: "magnet" as const,
    name: "Kişiye Özel Magnet",
    description: "Baş harfler ve düğün tarihiyle özel üretim NFC magnet.",
    unitPrice: MAGNET_UNIT_PRICE,
  },
  keychain: {
    id: "keychain" as const,
    name: "Anahtarlık",
    description: "Çiftin Memoora sayfasını tek dokunuşla açan NFC anahtarlık.",
    unitPrice: KEYCHAIN_UNIT_PRICE,
  },
} as const;

export interface PurchaseLineInput {
  productType: PurchaseProductType;
  quantity: number;
}

export interface PurchaseLineBreakdown {
  productType: PurchaseProductType;
  name: string;
  quantity: number;
  unitPrice: number;
  lineSubtotal: number;
  lineVat: number;
  lineTotal: number;
}

export interface PurchaseTotals {
  lines: PurchaseLineBreakdown[];
  subtotal: number;
  vat: number;
  total: number;
  vatRate: number;
}

export function getUnitPrice(productType: PurchaseProductType): number {
  return PURCHASE_PRODUCTS[productType].unitPrice;
}

export function calculatePurchaseTotals(
  lines: PurchaseLineInput[],
): PurchaseTotals {
  const breakdown: PurchaseLineBreakdown[] = [];

  for (const line of lines) {
    const qty = Math.max(0, Math.floor(line.quantity));
    if (qty <= 0) continue;
    const unitPrice = getUnitPrice(line.productType);
    const lineSubtotal = roundMoney(unitPrice * qty);
    const lineVat = roundMoney(lineSubtotal * VAT_RATE);
    const lineTotal = roundMoney(lineSubtotal + lineVat);
    breakdown.push({
      productType: line.productType,
      name: PURCHASE_PRODUCTS[line.productType].name,
      quantity: qty,
      unitPrice,
      lineSubtotal,
      lineVat,
      lineTotal,
    });
  }

  const subtotal = roundMoney(
    breakdown.reduce((sum, l) => sum + l.lineSubtotal, 0),
  );
  const vat = roundMoney(breakdown.reduce((sum, l) => sum + l.lineVat, 0));
  const total = roundMoney(subtotal + vat);

  return {
    lines: breakdown,
    subtotal,
    vat,
    total,
    vatRate: VAT_RATE,
  };
}

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatTry(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(amount);
}

/** Local calendar date YYYY-MM-DD, minimum = today + offsetDays */
export function getMinimumWeddingDate(
  from: Date = new Date(),
  offsetDays = MIN_WEDDING_DATE_OFFSET_DAYS,
): string {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return toIsoDate(d);
}

export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isWeddingDateValid(
  isoDate: string,
  from: Date = new Date(),
): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return false;
  return isoDate >= getMinimumWeddingDate(from);
}
