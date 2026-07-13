import { NextResponse } from "next/server";
import { isValidRsvpStatus } from "@/lib/supabase/rsvp";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

interface RsvpBody {
  coupleSlug?: string;
  guest_name?: string;
  phone?: string;
  status?: string;
  guest_count?: number;
  note?: string;
}

export async function POST(request: Request) {
  let body: RsvpBody;
  try {
    body = (await request.json()) as RsvpBody;
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const coupleSlug = String(body.coupleSlug ?? "").trim();
  const guestName = String(body.guest_name ?? "").trim();
  const phone = String(body.phone ?? "").trim() || null;
  const status = String(body.status ?? "").trim();
  const note = String(body.note ?? "").trim() || null;
  const guestCountRaw = body.guest_count;

  if (!coupleSlug) {
    return NextResponse.json({ error: "Davetiye bulunamadı." }, { status: 400 });
  }

  if (!guestName) {
    return NextResponse.json({ error: "Ad soyad gerekli." }, { status: 400 });
  }

  if (!isValidRsvpStatus(status)) {
    return NextResponse.json({ error: "Geçersiz katılım durumu." }, { status: 400 });
  }

  let guestCount = typeof guestCountRaw === "number" ? guestCountRaw : 1;

  if (status === "attending") {
    if (!Number.isFinite(guestCount) || guestCount < 1) {
      return NextResponse.json(
        { error: "Katılıyorsanız kişi sayısı en az 1 olmalı." },
        { status: 400 }
      );
    }
  } else if (status === "not_attending") {
    guestCount = 0;
  } else if (status === "maybe") {
    if (!Number.isFinite(guestCount) || guestCount < 0) {
      guestCount = 0;
    }
  }

  try {
    const supabase = createServiceRoleClient();
    const { data: couple, error: coupleError } = await supabase
      .from("couples")
      .select(
        "id, status, invitation_enabled, rsvp_enabled, max_guest_count, rsvp_deadline, deleted_at"
      )
      .eq("slug", coupleSlug)
      .is("deleted_at", null)
      .maybeSingle();

    if (coupleError || !couple) {
      return NextResponse.json({ error: "Davetiye bulunamadı." }, { status: 404 });
    }

    if (couple.status !== "active") {
      return NextResponse.json(
        { error: "Katılım bildirimi şu an kapalı." },
        { status: 403 }
      );
    }

    if (couple.invitation_enabled === false || couple.rsvp_enabled === false) {
      return NextResponse.json(
        { error: "Katılım bildirimi şu an kapalı." },
        { status: 403 }
      );
    }

    if (couple.rsvp_deadline) {
      const deadline = new Date(`${couple.rsvp_deadline}T23:59:59`);
      if (Date.now() > deadline.getTime()) {
        return NextResponse.json(
          { error: "Katılım bildirimi süresi doldu." },
          { status: 403 }
        );
      }
    }

    const maxGuest = couple.max_guest_count ?? 5;
    if (status === "attending" && guestCount > maxGuest) {
      return NextResponse.json(
        { error: `En fazla ${maxGuest} kişi seçebilirsiniz.` },
        { status: 400 }
      );
    }

    const { error: insertError } = await supabase.from("rsvp_responses").insert({
      couple_id: couple.id,
      guest_name: guestName,
      phone,
      status,
      guest_count: guestCount,
      note,
      source: "invite",
      updated_at: new Date().toISOString(),
    });

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message || "Yanıt kaydedilemedi." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      status,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Yanıt kaydedilemedi.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
