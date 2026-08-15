import {
  createServiceRoleClient,
  isServiceRoleConfigured,
} from "@/lib/supabase/server";
import {
  fetchMemooraOrderById,
  fetchAllMemooraOrders,
  updateMemooraOrderStatus,
} from "@/lib/memoora-purchase/orders";
import type {
  MemooraOrderRecord,
  MemooraOrderStatus,
} from "@/lib/memoora-purchase/types";
import { sendOrderStatusNotification } from "./notifications";
import {
  coupleLabel,
  escapeHtml,
  formatTrDate,
  formatTry,
  istanbulDateIso,
  itemsSummary,
  ORDER_STATUS_LABELS,
  orderDisplayCode,
  parseOrderLookup,
  PAYMENT_STATUS_LABELS,
} from "./format";
import { sendTelegramMessage } from "./api";

const TELEGRAM_STATUS_ACTIONS: MemooraOrderStatus[] = [
  "confirmed",
  "fulfilled",
  "cancelled",
];

/** Shared status update used by admin API and Telegram callbacks. */
export async function applyMemooraOrderStatusChange(
  orderId: string,
  orderStatus: MemooraOrderStatus,
): Promise<{
  order: MemooraOrderRecord;
  changed: boolean;
  previousStatus: MemooraOrderStatus;
} | null> {
  const current = await fetchMemooraOrderById(orderId);
  if (!current) return null;

  if (current.orderStatus === orderStatus) {
    return {
      order: current,
      changed: false,
      previousStatus: current.orderStatus,
    };
  }

  const updated = await updateMemooraOrderStatus(orderId, orderStatus);
  if (!updated) return null;

  void sendOrderStatusNotification(updated, current.orderStatus).catch(() => undefined);

  return {
    order: updated,
    changed: true,
    previousStatus: current.orderStatus,
  };
}

export function isTelegramStatusAction(
  status: string,
): status is MemooraOrderStatus {
  return (TELEGRAM_STATUS_ACTIONS as string[]).includes(status);
}

export async function findOrderByLookup(
  raw: string,
): Promise<MemooraOrderRecord | null> {
  const trimmed = raw.trim().replace(/^#/, "");
  if (!trimmed) return null;

  // Full UUID
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      trimmed,
    )
  ) {
    return fetchMemooraOrderById(trimmed);
  }

  const hex = parseOrderLookup(trimmed);
  const orders = await fetchAllMemooraOrders();

  const byCode = orders.find(
    (o) => o.id.replace(/-/g, "").toLowerCase().startsWith(hex),
  );
  if (byCode) return byCode;

  const byMerchant = orders.find(
    (o) =>
      o.merchantOid?.toLowerCase() === trimmed.toLowerCase() ||
      o.merchantOid?.toLowerCase() === hex,
  );
  return byMerchant ?? null;
}

function istanbulDayBounds(dayIso: string): { start: string; end: string } {
  const start = new Date(`${dayIso}T00:00:00+03:00`);
  const end = new Date(`${dayIso}T23:59:59.999+03:00`);
  return { start: start.toISOString(), end: end.toISOString() };
}

export function addCalendarDays(dayIso: string, days: number): string {
  const [y, m, d] = dayIso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

export type DailyOpsSummary = {
  ordersToday: number;
  paidToday: number;
  revenueToday: number;
  upcomingWeddings: number;
  mediaToday: number | null;
  awaitingFulfillment: number;
};

export async function computeDailyOpsSummary(
  dayIso = istanbulDateIso(),
): Promise<DailyOpsSummary> {
  const empty: DailyOpsSummary = {
    ordersToday: 0,
    paidToday: 0,
    revenueToday: 0,
    upcomingWeddings: 0,
    mediaToday: null,
    awaitingFulfillment: 0,
  };

  if (!isServiceRoleConfigured()) return empty;

  const supabase = createServiceRoleClient();
  const { start, end } = istanbulDayBounds(dayIso);
  const today = dayIso;
  const in7 = addCalendarDays(today, 7);

  const { data: orders, error } = await supabase
    .from("memoora_orders")
    .select("id, total, payment_status, order_status, wedding_date, created_at, updated_at");

  if (error || !orders) {
    console.warn("[telegram] daily summary orders query failed");
    return empty;
  }

  let ordersToday = 0;
  let paidToday = 0;
  let revenueToday = 0;
  let upcomingWeddings = 0;
  let awaitingFulfillment = 0;

  for (const row of orders) {
    const created = row.created_at as string;
    const updated = row.updated_at as string;
    const payment = row.payment_status as string;
    const status = row.order_status as string;
    const wedding = (row.wedding_date as string) ?? "";

    if (created >= start && created <= end) ordersToday += 1;

    if (
      payment === "paid" &&
      updated >= start &&
      updated <= end
    ) {
      paidToday += 1;
      revenueToday += Number(row.total) || 0;
    }

    if (
      payment === "paid" &&
      status !== "cancelled" &&
      wedding >= today &&
      wedding <= in7
    ) {
      upcomingWeddings += 1;
    }

    if (payment === "paid" && status === "confirmed") {
      awaitingFulfillment += 1;
    }
  }

  let mediaToday: number | null = null;
  try {
    const { count, error: mediaError } = await supabase
      .from("contribution_media")
      .select("id", { count: "exact", head: true })
      .gte("created_at", start)
      .lte("created_at", end);
    if (!mediaError) mediaToday = count ?? 0;
  } catch {
    mediaToday = null;
  }

  return {
    ordersToday,
    paidToday,
    revenueToday,
    upcomingWeddings,
    mediaToday,
    awaitingFulfillment,
  };
}

export function formatDailySummaryLines(summary: DailyOpsSummary): string[] {
  const lines = [
    `Bugünkü sipariş: ${summary.ordersToday}`,
    `Başarılı ödeme: ${summary.paidToday}`,
    `Bugünkü ciro: ${formatTry(summary.revenueToday)}`,
    `Yaklaşan düğün: ${summary.upcomingWeddings}`,
  ];
  if (summary.mediaToday !== null) {
    lines.push(`Bugün yüklenen medya: ${summary.mediaToday}`);
  }
  lines.push(`Teslim bekleyen sipariş: ${summary.awaitingFulfillment}`);
  return lines;
}

export async function handleTelegramCommand(
  chatId: string | number,
  text: string,
): Promise<void> {
  const body = text.trim();
  const [cmdRaw, ...rest] = body.split(/\s+/);
  const cmd = (cmdRaw ?? "").split("@")[0].toLowerCase();
  const arg = rest.join(" ").trim();

  const reply = async (html: string) => {
    await sendTelegramMessage({
      chatId: String(chatId),
      text: html,
      parseMode: "HTML",
    });
  };

  if (cmd === "/start" || cmd === "/yardim" || cmd === "/help") {
    await reply(
      [
        "<b>Memoora Operasyon Botu</b>",
        "",
        "Komutlar:",
        "/ozet — Bugünkü özet",
        "/siparisler — Son 10 sipariş",
        "/siparis MEM-XXXXXXXX — Sipariş detayı",
        "/yaklasan — 7 gün içindeki düğünler",
        "/yardim — Bu liste",
      ].join("\n"),
    );
    return;
  }

  if (cmd === "/ozet") {
    const summary = await computeDailyOpsSummary();
    await reply(
      [
        "<b>📊 Memoora — Günlük Özet</b>",
        "",
        ...formatDailySummaryLines(summary).map((l) => escapeHtml(l)),
      ].join("\n"),
    );
    return;
  }

  if (cmd === "/siparisler") {
    const orders = (await fetchAllMemooraOrders()).slice(0, 10);
    if (!orders.length) {
      await reply("Henüz sipariş yok.");
      return;
    }
    const lines = orders.map((o) => {
      const code = orderDisplayCode(o.id);
      const status = ORDER_STATUS_LABELS[o.orderStatus] ?? o.orderStatus;
      return `#${escapeHtml(code)} — ${escapeHtml(coupleLabel(o))} — ${escapeHtml(formatTry(o.total))} — ${escapeHtml(status)}`;
    });
    await reply(["<b>Son siparişler</b>", "", ...lines].join("\n"));
    return;
  }

  if (cmd === "/siparis") {
    if (!arg) {
      await reply("Kullanım: <code>/siparis MEM-XXXXXXXX</code>");
      return;
    }
    const order = await findOrderByLookup(arg);
    if (!order) {
      await reply("Sipariş bulunamadı.");
      return;
    }
    const code = orderDisplayCode(order.id);
    await reply(
      [
        `<b>📦 #${escapeHtml(code)}</b>`,
        "",
        escapeHtml(coupleLabel(order)),
        `Ürün: ${escapeHtml(itemsSummary(order))}`,
        `Adet: ${order.items.reduce((n, i) => n + i.quantity, 0)}`,
        `Tutar: ${escapeHtml(formatTry(order.total))}`,
        `Düğün: ${escapeHtml(formatTrDate(order.weddingDate))}`,
        `Durum: ${escapeHtml(ORDER_STATUS_LABELS[order.orderStatus] ?? order.orderStatus)}`,
        `Ödeme: ${escapeHtml(PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus)}`,
      ].join("\n"),
    );
    return;
  }

  if (cmd === "/yaklasan") {
    const today = istanbulDateIso();
    const end = addCalendarDays(today, 7);
    const orders = (await fetchAllMemooraOrders())
      .filter(
        (o) =>
          o.paymentStatus === "paid" &&
          o.orderStatus !== "cancelled" &&
          o.weddingDate >= today &&
          o.weddingDate <= end,
      )
      .sort((a, b) => a.weddingDate.localeCompare(b.weddingDate));

    if (!orders.length) {
      await reply("Önümüzdeki 7 günde düğün yok.");
      return;
    }

    const lines = orders.map((o) => {
      const code = orderDisplayCode(o.id);
      return `${escapeHtml(formatTrDate(o.weddingDate))} — ${escapeHtml(coupleLabel(o))} — #${escapeHtml(code)}`;
    });
    await reply(["<b>💍 Yaklaşan düğünler</b>", "", ...lines].join("\n"));
    return;
  }

  await reply("Bilinmeyen komut. /yardim yazabilirsiniz.");
}
