import {
  createServiceRoleClient,
  isServiceRoleConfigured,
} from "@/lib/supabase/server";
import { fetchAllMemooraOrders } from "@/lib/memoora-purchase/orders";
import {
  addCalendarDays,
  computeDailyOpsSummary,
  formatDailySummaryLines,
} from "./ops";
import {
  sendAfterPrepareReminder,
  sendDailySummaryMessage,
  sendTelegramError,
  sendWeddingReminder,
} from "./notifications";
import { istanbulDateIso } from "./format";
import { isTelegramConfigured } from "./config";

async function runWeddingReminders(): Promise<number> {
  const today = istanbulDateIso();
  const targets: Array<{ days: 7 | 3 | 1; date: string }> = [
    { days: 7, date: addCalendarDays(today, 7) },
    { days: 3, date: addCalendarDays(today, 3) },
    { days: 1, date: addCalendarDays(today, 1) },
  ];

  const orders = await fetchAllMemooraOrders();
  let sent = 0;

  for (const target of targets) {
    const matches = orders.filter(
      (o) =>
        o.paymentStatus === "paid" &&
        o.orderStatus !== "cancelled" &&
        o.weddingDate === target.date,
    );
    for (const order of matches) {
      const ok = await sendWeddingReminder({
        order,
        daysLeft: target.days,
      });
      if (ok) sent += 1;
    }
  }

  return sent;
}

async function runAfterPrepareReminders(): Promise<number> {
  if (!isServiceRoleConfigured()) return 0;

  const today = istanbulDateIso();
  // Wedding was 7 days ago → after prepare day (matches recommendedPublishAt = wedding + 7).
  const weddingDay = addCalendarDays(today, -7);
  const supabase = createServiceRoleClient();

  const { data: couples, error } = await supabase
    .from("couples")
    .select("id, slug, bride_name, groom_name, wedding_date, status, deleted_at")
    .eq("wedding_date", weddingDay)
    .is("deleted_at", null);

  if (error || !couples?.length) return 0;

  let sent = 0;
  for (const couple of couples) {
    if (couple.status === "archived") continue;

    let mediaCount = 0;
    try {
      const { data: contribs } = await supabase
        .from("contributions")
        .select("id")
        .eq("couple_id", couple.id);
      const contribIds = (contribs ?? []).map((c) => c.id);
      if (contribIds.length) {
        const { count } = await supabase
          .from("contribution_media")
          .select("id", { count: "exact", head: true })
          .in("contribution_id", contribIds)
          .is("deleted_at", null);
        mediaCount = count ?? 0;
      }
    } catch {
      mediaCount = 0;
    }

    const ok = await sendAfterPrepareReminder({
      coupleId: couple.id,
      slug: couple.slug,
      brideName: couple.bride_name ?? "",
      groomName: couple.groom_name ?? "",
      weddingDate: couple.wedding_date ?? weddingDay,
      afterDate: today,
      mediaCount,
    });
    if (ok) sent += 1;
  }

  return sent;
}

export async function runTelegramRemindersJob(): Promise<{
  weddingReminders: number;
  afterReminders: number;
}> {
  if (!isTelegramConfigured()) {
    return { weddingReminders: 0, afterReminders: 0 };
  }

  try {
    const weddingReminders = await runWeddingReminders();
    const afterReminders = await runAfterPrepareReminders();
    return { weddingReminders, afterReminders };
  } catch (error) {
    void sendTelegramError({
      source: "Telegram Reminders Cron",
      error,
    }).catch(() => undefined);
    throw error;
  }
}

export async function runTelegramDailySummaryJob(): Promise<boolean> {
  if (!isTelegramConfigured()) return false;

  try {
    const summary = await computeDailyOpsSummary();
    return await sendDailySummaryMessage(
      formatDailySummaryLines(summary).map((line) => line),
    );
  } catch (error) {
    void sendTelegramError({
      source: "Telegram Daily Summary Cron",
      error,
    }).catch(() => undefined);
    throw error;
  }
}
