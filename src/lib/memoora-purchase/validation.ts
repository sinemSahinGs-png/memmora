import {
  WEDDING_DATE_TOO_SOON_MESSAGE,
  calculatePurchaseTotals,
  getUnitPrice,
  isWeddingDateValid,
  type PurchaseProductType,
} from "./pricing";
import type { CreateMemooraOrderInput } from "./types";

export class PurchaseValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PurchaseValidationError";
  }
}

const PRODUCT_TYPES: PurchaseProductType[] = ["magnet", "keychain"];

export function validateCreateOrderInput(raw: unknown): CreateMemooraOrderInput {
  if (!raw || typeof raw !== "object") {
    throw new PurchaseValidationError("Geçersiz sipariş verisi.");
  }

  const body = raw as Record<string, unknown>;
  const brideName = String(body.brideName ?? "").trim();
  const groomName = String(body.groomName ?? "").trim();
  const weddingDate = String(body.weddingDate ?? "").trim();

  if (!brideName) {
    throw new PurchaseValidationError("Gelin adı gerekli.");
  }
  if (!groomName) {
    throw new PurchaseValidationError("Damat adı gerekli.");
  }
  if (!weddingDate) {
    throw new PurchaseValidationError("Düğün tarihi gerekli.");
  }
  if (!isWeddingDateValid(weddingDate)) {
    throw new PurchaseValidationError(WEDDING_DATE_TOO_SOON_MESSAGE);
  }

  const rawItems = Array.isArray(body.items) ? body.items : [];
  const items: CreateMemooraOrderInput["items"] = [];

  for (const entry of rawItems) {
    if (!entry || typeof entry !== "object") continue;
    const item = entry as Record<string, unknown>;
    const productType = String(item.productType ?? "") as PurchaseProductType;
    const quantity = Number(item.quantity);

    if (!PRODUCT_TYPES.includes(productType)) {
      throw new PurchaseValidationError("Geçersiz ürün tipi.");
    }
    if (!Number.isFinite(quantity) || quantity < 0 || !Number.isInteger(quantity)) {
      throw new PurchaseValidationError("Adet tam sayı olmalıdır.");
    }
    if (quantity > 500) {
      throw new PurchaseValidationError("Adet üst sınırı 500’dür.");
    }
    if (quantity > 0) {
      // Server re-prices from config — ignore any client unit prices
      void getUnitPrice(productType);
      items.push({ productType, quantity });
    }
  }

  if (items.length === 0) {
    throw new PurchaseValidationError("En az bir ürün seçmelisiniz.");
  }

  // Verify totals are consistent with server pricing
  const totals = calculatePurchaseTotals(items);
  if (totals.total <= 0) {
    throw new PurchaseValidationError("Sipariş tutarı geçersiz.");
  }

  return {
    brideName,
    groomName,
    weddingDate,
    items,
    customerEmail: body.customerEmail
      ? String(body.customerEmail).trim()
      : undefined,
    customerPhone: body.customerPhone
      ? String(body.customerPhone).trim()
      : undefined,
    customerName: body.customerName
      ? String(body.customerName).trim()
      : undefined,
  };
}
