import { NextResponse } from "next/server";
import { requireCoupleAdminOrSuperAdmin } from "@/lib/auth/admin-session-cookie";
import { updateCoupleSettings } from "@/lib/supabase/couples-admin";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { CoupleSettingsInput } from "@/lib/types";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { slug: rawSlug } = await context.params;
    const slug = rawSlug.trim().toLowerCase();
    const auth = await requireCoupleAdminOrSuperAdmin(slug);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const input = (await req.json()) as CoupleSettingsInput;
    const supabase = createServiceRoleClient();
    const { data: existing, error: existingError } = await supabase
      .from("couples")
      .select("id")
      .eq("slug", slug)
      .is("deleted_at", null)
      .maybeSingle();

    if (existingError || !existing) {
      return NextResponse.json({ error: "Çift bulunamadı." }, { status: 404 });
    }

    const result = await updateCoupleSettings(existing.id, input, {
      preservePinIfEmpty: true,
    });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ couple: result.couple });
  } catch (error) {
    console.error("[couple settings]", error);
    return NextResponse.json(
      { error: "Ayarlar kaydedilemedi." },
      { status: 500 },
    );
  }
}
