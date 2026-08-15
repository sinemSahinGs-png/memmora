import type { MemooraOrderRecord } from "@/lib/memoora-purchase/types";
import { getSiteBaseUrl } from "@/lib/site-url";
import {
  adminOrdersUrl,
  sendTelegramMessage,
  type TelegramInlineButton,
} from "./api";
import { isTelegramConfigured } from "./config";
import {
  coupleLabel,
  escapeHtml,
  formatTrDate,
  formatTrDateTime,
  formatTry,
  itemsSummary,
  ORDER_STATUS_LABELS,
  orderDisplayCode,
  sanitizeErrorMessage,
} from "./format";
import { claimNotificationSlot } from "./log";

export function formatPaidOrderTelegramHtml(order: MemooraOrderRecord): string {
  const code = orderDisplayCode(order.id);
  const items =
    order.items
      .map(
        (item) =>
          `• ${escapeHtml(item.productName)} ×${item.quantity}`,
      )
      .join("\n") || "• (kalem yok)";

  return [
    "<b>💳 Memoora — Yeni Ödeme</b>",
    "",
    `Sipariş No: <b>#${escapeHtml(code)}</b>`,
    `Gelin &amp; Damat: <b>${escapeHtml(coupleLabel(order))}</b>`,
    `Ürün: ${escapeHtml(itemsSummary(order))}`,
    `Adet: ${order.items.reduce((n, i) => n + i.quantity, 0)}`,
    `Toplam Tutar: <b>${escapeHtml(formatTry(order.total))}</b>`,
    `Düğün Tarihi: ${escapeHtml(formatTrDate(order.weddingDate))}`,
    `Müşteri: ${escapeHtml(order.customerName || "—")}`,
    `Telefon: ${escapeHtml(order.customerPhone || "—")}`,
    `Sipariş zamanı: ${escapeHtml(formatTrDateTime(order.createdAt))}`,
    "",
    items,
  ].join("\n");
}

function paidOrderKeyboard(order: MemooraOrderRecord): {
  inline_keyboard: TelegramInlineButton[][];
} {
  const viewUrl = adminOrdersUrl(order.id) || `${getSiteBaseUrl()}/admin`;
  const rows: TelegramInlineButton[][] = [
    [{ text: "📦 Siparişi Gör", url: viewUrl }],
  ];

  // Operational status buttons (real statuses only).
  const actions: TelegramInlineButton[] = [];
  if (order.orderStatus !== "confirmed") {
    actions.push({
      text: "✅ Onayla",
      callback_data: `ord:confirmed:${order.id}`,
    });
  }
  if (order.orderStatus !== "fulfilled") {
    actions.push({
      text: "📦 Teslim Edildi",
      callback_data: `ord:fulfilled:${order.id}`,
    });
  }
  if (actions.length) rows.push(actions);
  return { inline_keyboard: rows };
}

/**
 * First-time paid notification. Idempotent via notification log + PayTR gate.
 */
export async function notifyTelegramPaidOrder(
  order: MemooraOrderRecord,
): Promise<void> {
  if (!isTelegramConfigured()) return;

  const claimed = await claimNotificationSlot({
    eventKey: `telegram:new_payment:${order.id}`,
    eventType: "new_payment",
    orderId: order.id,
  });
  if (!claimed) {
    console.log(
      `[telegram] new_order notification skipped (duplicate) for ${orderDisplayCode(order.id)}`,
    );
    return;
  }

  const result = await sendTelegramMessage({
    text: formatPaidOrderTelegramHtml(order),
    parseMode: "HTML",
    replyMarkup: paidOrderKeyboard(order),
  });

  if (result.ok) {
    console.log(
      `[telegram] new_order notification sent for order ${orderDisplayCode(order.id)}`,
    );
  }

  void notifyMissingOrderFields(order).catch(() => undefined);
}

export async function sendOrderStatusNotification(
  order: MemooraOrderRecord,
  previousStatus: string,
): Promise<void> {
  if (!isTelegramConfigured()) return;
  if (previousStatus === order.orderStatus) return;

  const code = orderDisplayCode(order.id);
  const label =
    ORDER_STATUS_LABELS[order.orderStatus] ?? order.orderStatus;

  const text = [
    "<b>📦 Sipariş Güncellendi</b>",
    "",
    `Sipariş: <b>#${escapeHtml(code)}</b>`,
    escapeHtml(coupleLabel(order)),
    `Durum: <b>${escapeHtml(label)}</b>`,
  ].join("\n");

  await sendTelegramMessage({
    text,
    parseMode: "HTML",
    replyMarkup: {
      inline_keyboard: [
        [{ text: "📦 Siparişi Gör", url: adminOrdersUrl(order.id) }],
      ],
    },
  });
}

export async function notifyMissingOrderFields(
  order: MemooraOrderRecord,
): Promise<void> {
  if (!isTelegramConfigured()) return;
  if (order.paymentStatus !== "paid") return;

  const missing: string[] = [];
  if (!order.brideName?.trim()) missing.push("Gelin adı");
  if (!order.groomName?.trim()) missing.push("Damat adı");
  if (!order.weddingDate?.trim()) missing.push("Düğün tarihi");
  if (!order.items.length) missing.push("Ürün / kalem");
  if (!order.customerPhone?.trim()) missing.push("Telefon");

  if (!missing.length) return;

  const claimed = await claimNotificationSlot({
    eventKey: `telegram:missing_fields:${order.id}`,
    eventType: "missing_fields",
    orderId: order.id,
  });
  if (!claimed) return;

  const code = orderDisplayCode(order.id);
  const text = [
    "<b>⚠️ Eksik Sipariş Bilgisi</b>",
    "",
    `Sipariş: <b>#${escapeHtml(code)}</b>`,
    "",
    "Eksik:",
    ...missing.map((m) => `• ${escapeHtml(m)}`),
  ].join("\n");

  await sendTelegramMessage({
    text,
    parseMode: "HTML",
    replyMarkup: {
      inline_keyboard: [
        [{ text: "Siparişi Aç", url: adminOrdersUrl(order.id) }],
      ],
    },
  });
}

export async function sendTelegramError(options: {
  source: string;
  error: unknown;
  orderCode?: string | null;
}): Promise<void> {
  if (!isTelegramConfigured()) return;

  const safe = sanitizeErrorMessage(options.error);
  const text = [
    "<b>🚨 MEMOORA SİSTEM HATASI</b>",
    "",
    `Kaynak: ${escapeHtml(options.source)}`,
    options.orderCode
      ? `Sipariş: #${escapeHtml(options.orderCode)}`
      : null,
    `Hata: ${escapeHtml(safe)}`,
    `Zaman: ${escapeHtml(formatTrDateTime(new Date().toISOString()))}`,
  ]
    .filter(Boolean)
    .join("\n");

  await sendTelegramMessage({ text, parseMode: "HTML" });
}

export async function sendWeddingReminder(options: {
  order: MemooraOrderRecord;
  daysLeft: 7 | 3 | 1;
}): Promise<boolean> {
  if (!isTelegramConfigured()) return false;

  const claimed = await claimNotificationSlot({
    eventKey: `telegram:wedding_reminder:${options.order.id}:d${options.daysLeft}`,
    eventType: "wedding_reminder",
    orderId: options.order.id,
    metadata: { daysLeft: options.daysLeft },
  });
  if (!claimed) return false;

  const code = orderDisplayCode(options.order.id);
  const text = [
    `<b>💍 Düğüne ${options.daysLeft} Gün Kaldı</b>`,
    "",
    escapeHtml(coupleLabel(options.order)),
    escapeHtml(formatTrDate(options.order.weddingDate)),
    `Sipariş: #${escapeHtml(code)}`,
    escapeHtml(itemsSummary(options.order)),
  ].join("\n");

  const result = await sendTelegramMessage({ text, parseMode: "HTML" });
  return result.ok;
}

export async function sendAfterPrepareReminder(options: {
  coupleId: string;
  slug: string;
  brideName: string;
  groomName: string;
  weddingDate: string;
  afterDate: string;
  mediaCount: number;
}): Promise<boolean> {
  if (!isTelegramConfigured()) return false;

  const claimed = await claimNotificationSlot({
    eventKey: `telegram:after_prepare:${options.coupleId}:${options.afterDate}`,
    eventType: "after_prepare",
    metadata: { slug: options.slug },
  });
  if (!claimed) return false;

  const adminUrl = `${getSiteBaseUrl()}/${options.slug}/admin`;
  const text = [
    "<b>🎬 Memoora After Hazırla</b>",
    "",
    escapeHtml(`${options.brideName} & ${options.groomName}`),
    `Düğün: ${escapeHtml(formatTrDate(options.weddingDate))}`,
    `After tarihi: ${escapeHtml(formatTrDate(options.afterDate))}`,
    "",
    `Medya seçimi: ${options.mediaCount} dosya`,
  ].join("\n");

  const result = await sendTelegramMessage({
    text,
    parseMode: "HTML",
    replyMarkup: {
      inline_keyboard: [[{ text: "Admin'de Aç", url: adminUrl }]],
    },
  });
  return result.ok;
}

export async function sendDailySummaryMessage(lines: string[]): Promise<boolean> {
  if (!isTelegramConfigured()) return false;

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const claimed = await claimNotificationSlot({
    eventKey: `telegram:daily_summary:${today}`,
    eventType: "daily_summary",
  });
  if (!claimed) return false;

  const text = ["<b>📊 Memoora — Günlük Özet</b>", "", ...lines].join("\n");
  const result = await sendTelegramMessage({ text, parseMode: "HTML" });
  return result.ok;
}

/** @deprecated Prefer sendTelegramMessage({ text }) — kept for callers. */
export async function sendTelegramPlain(text: string): Promise<boolean> {
  const result = await sendTelegramMessage({ text });
  return result.ok;
}

export function formatPaidOrderTelegramMessage(
  order: MemooraOrderRecord,
): string {
  // Plain fallback (no HTML) for legacy callers.
  return formatPaidOrderTelegramHtml(order)
    .replace(/<\/?b>/g, "")
    .replace(/&amp;/g, "&");
}
