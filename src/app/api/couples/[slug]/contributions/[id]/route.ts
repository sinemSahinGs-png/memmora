import { NextResponse } from "next/server";
import { requireCoupleAdminOrSuperAdmin } from "@/lib/auth/admin-session-cookie";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ slug: string; id: string }>;
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { slug: rawSlug, id } = await context.params;
    const slug = rawSlug.trim().toLowerCase();
    const auth = await requireCoupleAdminOrSuperAdmin(slug);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = (await req.json()) as { action?: string };
    if (body.action !== "hide") {
      return NextResponse.json({ error: "Geçersiz işlem." }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    const { data: couple } = await supabase
      .from("couples")
      .select("id")
      .eq("slug", slug)
      .is("deleted_at", null)
      .maybeSingle();
    if (!couple) {
      return NextResponse.json({ error: "Çift bulunamadı." }, { status: 404 });
    }

    const { data: contribution } = await supabase
      .from("contributions")
      .select("id")
      .eq("id", id)
      .eq("couple_id", couple.id)
      .maybeSingle();
    if (!contribution) {
      return NextResponse.json({ error: "Anı bulunamadı." }, { status: 404 });
    }

    await supabase
      .from("contribution_media")
      .update({ hidden: true })
      .eq("contribution_id", id);

    const { error } = await supabase
      .from("contributions")
      .update({ hidden: true, is_visible: false })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[contribution patch]", error);
    return NextResponse.json({ error: "İşlem başarısız." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const { slug: rawSlug, id } = await context.params;
    const slug = rawSlug.trim().toLowerCase();
    const auth = await requireCoupleAdminOrSuperAdmin(slug);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = createServiceRoleClient();
    const { data: couple } = await supabase
      .from("couples")
      .select("id")
      .eq("slug", slug)
      .is("deleted_at", null)
      .maybeSingle();
    if (!couple) {
      return NextResponse.json({ error: "Çift bulunamadı." }, { status: 404 });
    }

    const { data: contribution } = await supabase
      .from("contributions")
      .select("id")
      .eq("id", id)
      .eq("couple_id", couple.id)
      .maybeSingle();
    if (!contribution) {
      return NextResponse.json({ error: "Anı bulunamadı." }, { status: 404 });
    }

    await supabase
      .from("contribution_media")
      .delete()
      .eq("contribution_id", id);

    const { error } = await supabase.from("contributions").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[contribution delete]", error);
    return NextResponse.json({ error: "Silme başarısız." }, { status: 500 });
  }
}
