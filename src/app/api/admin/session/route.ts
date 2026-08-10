import { NextResponse } from "next/server";
import {
  attachSuperAdminCookie,
  clearAuthCookie,
  createSuperAdminToken,
  readSuperAdminSession,
  safeEqualString,
  SUPER_ADMIN_COOKIE,
} from "@/lib/auth/admin-session-cookie";
import {
  checkPinRateLimit,
  clientIpFromRequest,
} from "@/lib/auth/pin-rate-limit";

function resolveSuperAdminPin(): string {
  return (process.env.SUPER_ADMIN_PIN ?? "").trim();
}

export async function POST(req: Request) {
  try {
    const ip = clientIpFromRequest(req);
    const limited = checkPinRateLimit(`super-admin:${ip}`);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Çok fazla deneme. Lütfen daha sonra tekrar deneyin." },
        {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfterSec) },
        },
      );
    }

    const body = (await req.json()) as { pin?: string };
    const pin = (body.pin ?? "").trim();
    const expected = resolveSuperAdminPin();
    if (!expected) {
      return NextResponse.json(
        { error: "Süper admin şifresi yapılandırılmamış (SUPER_ADMIN_PIN)." },
        { status: 500 },
      );
    }
    if (!pin || !safeEqualString(pin, expected)) {
      return NextResponse.json({ error: "Şifre hatalı." }, { status: 401 });
    }
    const res = NextResponse.json({ ok: true });
    return attachSuperAdminCookie(res, createSuperAdminToken());
  } catch (error) {
    console.error("[super admin session]", error);
    return NextResponse.json({ error: "Oturum açılamadı." }, { status: 500 });
  }
}

export async function GET() {
  const session = await readSuperAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  return clearAuthCookie(res, SUPER_ADMIN_COOKIE);
}
