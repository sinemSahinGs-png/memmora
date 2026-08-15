import type {
  MemooraOrderRecord,
  MemooraOrderStatus,
  MemooraOrderPaymentStatus,
} from "@/lib/memoora-purchase/types";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function formatTry(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Europe/Istanbul calendar date YYYY-MM-DD */
export function istanbulDateIso(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function istanbulHour(date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(date);
  return Number(parts.find((p) => p.type === "hour")?.value ?? "0");
}

export function formatTrDate(isoDate: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    const [y, m, d] = isoDate.split("-");
    return `${d}.${m}.${y}`;
  }
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function formatTrDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/** Display code MEM-XXXXXXXX from UUID (first 8 hex of uuid without dashes). */
export function orderDisplayCode(orderId: string): string {
  const hex = orderId.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `MEM-${hex}`;
}

export function parseOrderLookup(raw: string): string {
  return raw.trim().replace(/^#/, "").replace(/^MEM-/i, "").toLowerCase();
}

export const ORDER_STATUS_LABELS: Record<MemooraOrderStatus, string> = {
  draft: "Taslak",
  pending_payment: "Ödeme bekliyor",
  confirmed: "Onaylandı",
  cancelled: "İptal edildi",
  fulfilled: "Teslim edildi",
};

export const PAYMENT_STATUS_LABELS: Record<MemooraOrderPaymentStatus, string> = {
  awaiting_payment: "Ödeme bekliyor",
  pending: "Beklemede",
  paid: "Ödendi",
  failed: "Başarısız",
  refunded: "İade",
  provider_not_configured: "Sağlayıcı yok",
};

export function coupleLabel(order: MemooraOrderRecord): string {
  return `${order.brideName} & ${order.groomName}`;
}

export function itemsSummary(order: MemooraOrderRecord): string {
  if (!order.items.length) return "(kalem yok)";
  return order.items
    .map((item) => `${item.productName} ×${item.quantity}`)
    .join(", ");
}

const SECRET_PATTERNS = [
  /Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi,
  /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
  /sk_[A-Za-z0-9]+/gi,
  /sb_secret_[A-Za-z0-9]+/gi,
  /TELEGRAM_BOT_TOKEN[^\s]*/gi,
  /PAYTR_[A-Z_]+[=:]\s*\S+/gi,
  /postgres(?:ql)?:\/\/[^\s]+/gi,
];

export function sanitizeErrorMessage(input: unknown): string {
  let text =
    input instanceof Error
      ? input.message
      : typeof input === "string"
        ? input
        : "Bilinmeyen hata";
  text = text.slice(0, 400);
  for (const pattern of SECRET_PATTERNS) {
    text = text.replace(pattern, "[redacted]");
  }
  return text;
}
