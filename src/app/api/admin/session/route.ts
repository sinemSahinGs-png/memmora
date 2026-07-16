import { NextResponse } from "next/server";
import {
  attachSuperAdminCookie,
  clearAuthCookie,
  createSuperAdminToken,
  safeEqualString,
  SUPER_ADMIN_COOKIE,
} from "@/lib/auth/admin-session-cookie";
import { isProductionRuntime } from "@/lib/aftermovie/env";

function resolveSuperAdminPin(): string {
  const serverPin = process.env.SUPER_ADMIN_PIN?.trim();
  if (serverPin) return serverPin;
  if (!isProductionRuntime()) {
    return (process.env.NEXT_PUBLIC_SUPER_ADMIN_PIN ?? "9999").trim();
  }
  // Production may still use NEXT_PUBLIC during transition — prefer SUPER_ADMIN_PIN
  return (process.env.NEXT_PUBLIC_SUPER_ADMIN_PIN ?? "").trim();
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { pin?: string };
    const pin = (body.pin ?? "").trim();
    const expected = resolveSuperAdminPin();
    if (!expected) {
      return NextResponse.json(
        { error: "Süper admin PIN yapılandırılmamış." },
        { status: 500 },
      );
    }
    if (!pin || !safeEqualString(pin, expected)) {
      return NextResponse.json({ error: "PIN hatalı." }, { status: 401 });
    }
    const res = NextResponse.json({ ok: true });
    return attachSuperAdminCookie(res, createSuperAdminToken());
  } catch (error) {
    console.error("[super admin session]", error);
    return NextResponse.json({ error: "Oturum açılamadı." }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  return clearAuthCookie(res, SUPER_ADMIN_COOKIE);
}
