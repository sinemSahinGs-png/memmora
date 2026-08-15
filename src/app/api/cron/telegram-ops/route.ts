import { NextResponse } from "next/server";
import {
  getCronSecretOrThrowInProduction,
  isProductionRuntime,
} from "@/lib/aftermovie/env";
import { timingSafeBearerMatch } from "@/lib/auth/admin-session-cookie";
import { istanbulHour } from "@/lib/telegram/format";
import {
  runTelegramDailySummaryJob,
  runTelegramRemindersJob,
} from "@/lib/telegram/jobs";
import { sendTelegramError } from "@/lib/telegram/notifications";
import { isTelegramConfigured } from "@/lib/telegram/config";

export const runtime = "nodejs";

/**
 * Telegram ops cron:
 * - Reminders: ~06:00 Europe/Istanbul (UTC 03:00)
 * - Daily summary: ~21:00 Europe/Istanbul (UTC 18:00)
 *
 * Auth: Authorization: Bearer $CRON_SECRET (same as aftermovie cron)
 */
export async function GET(req: Request) {
  const secret = getCronSecretOrThrowInProduction();
  if (isProductionRuntime() && !secret) {
    return NextResponse.json({ error: "Cron misconfigured" }, { status: 503 });
  }
  if (
    secret &&
    !timingSafeBearerMatch(req.headers.get("authorization"), secret)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isTelegramConfigured()) {
    return NextResponse.json({ ok: true, skipped: true, reason: "telegram_not_configured" });
  }

  const url = new URL(req.url);
  const jobParam = url.searchParams.get("job");
  const hour = istanbulHour();

  const runReminders =
    jobParam === "reminders" ||
    (!jobParam && (hour === 6 || hour === 5 || hour === 7));
  const runSummary =
    jobParam === "summary" ||
    (!jobParam && (hour === 21 || hour === 20 || hour === 22));

  // If Vercel hits with explicit schedule paths, always run the matching job via ?job=
  // When job=all, run both.
  const forceAll = jobParam === "all";

  try {
    const result: Record<string, unknown> = { ok: true, hour };

    if (forceAll || runReminders || jobParam === "reminders") {
      result.reminders = await runTelegramRemindersJob();
    }
    if (forceAll || runSummary || jobParam === "summary") {
      result.summary = await runTelegramDailySummaryJob();
    }

    if (!forceAll && !runReminders && !runSummary && !jobParam) {
      result.note = "No job matched current Istanbul hour; pass ?job=reminders|summary|all";
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[telegram ops cron]", error instanceof Error ? error.message : error);
    void sendTelegramError({
      source: "Telegram Ops Cron",
      error,
    }).catch(() => undefined);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
