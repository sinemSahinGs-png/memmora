import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/admin-session-cookie";
import { isTelegramConfigured } from "@/lib/telegram/config";

export const runtime = "nodejs";

/** Returns Telegram wiring status only — never tokens or chat IDs. */
export async function GET() {
  const auth = await requireSuperAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  return NextResponse.json({
    configured: isTelegramConfigured(),
  });
}
