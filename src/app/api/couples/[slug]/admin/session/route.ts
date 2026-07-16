import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  attachCoupleAdminCookie,
  clearAuthCookie,
  COUPLE_ADMIN_COOKIE,
  createCoupleAdminToken,
  requireCoupleAdminForSlug,
  safeEqualString,
} from "@/lib/auth/admin-session-cookie";
import { isProductionRuntime } from "@/lib/aftermovie/env";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

/** Validates signed HttpOnly couple-admin cookie (sessionStorage alone is not enough). */
export async function GET(_req: Request, context: RouteContext) {
  const { slug: rawSlug } = await context.params;
  const slug = rawSlug.trim().toLowerCase();
  const auth = await requireCoupleAdminForSlug(slug);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }
  return NextResponse.json({
    ok: true,
    slug: auth.session.slug,
    coupleId: auth.session.coupleId,
  });
}

export async function POST(req: Request, context: RouteContext) {
  try {
    const { slug: rawSlug } = await context.params;
    const slug = rawSlug.trim().toLowerCase();
    const body = (await req.json()) as { pin?: string };
    const pin = (body.pin ?? "").trim();
    if (!pin) {
      return NextResponse.json({ error: "PIN gerekli." }, { status: 400 });
    }

    const client = createServiceRoleClient();
    const { data: couple, error } = await client
      .from("couples")
      .select("id, slug, admin_pin")
      .eq("slug", slug)
      .is("deleted_at", null)
      .maybeSingle();

    if (error || !couple) {
      return NextResponse.json({ error: "Çift bulunamadı." }, { status: 404 });
    }

    const dbPin = (couple.admin_pin ?? "").trim();
    const fallback =
      !isProductionRuntime()
        ? (process.env.NEXT_PUBLIC_ADMIN_PIN ?? "0606").trim()
        : "";
    const expected = dbPin || fallback;
    if (!expected || !safeEqualString(pin, expected)) {
      return NextResponse.json({ error: "PIN hatalı." }, { status: 401 });
    }

    const token = createCoupleAdminToken({
      slug: couple.slug,
      coupleId: couple.id,
    });
    const res = NextResponse.json({ ok: true });
    return attachCoupleAdminCookie(res, token);
  } catch (error) {
    console.error("[couple admin session]", error);
    return NextResponse.json({ error: "Oturum açılamadı." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  await context.params;
  const res = NextResponse.json({ ok: true });
  return clearAuthCookie(res, COUPLE_ADMIN_COOKIE);
}
