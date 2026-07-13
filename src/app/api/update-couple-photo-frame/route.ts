import { NextResponse } from "next/server";
import { clampFrameCrop } from "@/lib/memories-frame-crop";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { isPlaceholderCoupleId } from "@/lib/supabase/couples";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      photoId?: string;
      coupleSlug?: string;
      frameZoom?: number;
      framePanX?: number;
      framePanY?: number;
      isVisible?: boolean;
      promoteToFront?: boolean;
    };

    const photoId = body.photoId?.trim();
    const coupleSlug = body.coupleSlug?.trim();

    if (!photoId || !coupleSlug) {
      return NextResponse.json(
        { error: "photoId ve coupleSlug gerekli." },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    const { data: couple, error: coupleError } = await supabase
      .from("couples")
      .select("id")
      .eq("slug", coupleSlug)
      .maybeSingle();

    if (coupleError || !couple || isPlaceholderCoupleId(couple.id)) {
      return NextResponse.json({ error: "Çift bulunamadı." }, { status: 404 });
    }

    const update: {
      frame_zoom?: number;
      frame_pan_x?: number;
      frame_pan_y?: number;
      is_visible?: boolean;
      sort_order?: number;
    } = {};

    if (
      body.frameZoom !== undefined ||
      body.framePanX !== undefined ||
      body.framePanY !== undefined
    ) {
      const crop = clampFrameCrop({
        zoom: body.frameZoom,
        panX: body.framePanX,
        panY: body.framePanY,
      });
      update.frame_zoom = crop.zoom;
      update.frame_pan_x = crop.panX;
      update.frame_pan_y = crop.panY;
    }

    if (typeof body.isVisible === "boolean") {
      update.is_visible = body.isVisible;
    }

    if (body.promoteToFront) {
      const { data: firstPhoto } = await supabase
        .from("couple_photos")
        .select("sort_order")
        .eq("couple_id", couple.id)
        .order("sort_order", { ascending: true })
        .limit(1)
        .maybeSingle();

      update.sort_order = (firstPhoto?.sort_order ?? 0) - 1;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Güncellenecek alan yok." }, { status: 400 });
    }

    const { data: photo, error: photoError } = await supabase
      .from("couple_photos")
      .update(update)
      .eq("id", photoId)
      .eq("couple_id", couple.id)
      .select("*")
      .single();

    if (photoError || !photo) {
      return NextResponse.json(
        { error: photoError?.message ?? "Fotoğraf güncellenemedi." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, photo });
  } catch (error) {
    console.error("[update-couple-photo-frame]", error);
    return NextResponse.json(
      { error: "Fotoğraf güncellenemedi." },
      { status: 500 }
    );
  }
}
