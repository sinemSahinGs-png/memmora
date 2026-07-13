import { NextResponse } from "next/server";
import { deleteDriveFile, getMissingDriveEnvVars } from "@/lib/google/drive";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const missingEnv = getMissingDriveEnvVars();
  if (missingEnv.length > 0) {
    return NextResponse.json(
      { error: "Google Drive yapılandırması eksik." },
      { status: 500 }
    );
  }

  try {
    const body = (await request.json()) as {
      photoId?: string;
      coupleSlug?: string;
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
      .select("id, slug")
      .eq("slug", coupleSlug)
      .maybeSingle();

    if (coupleError || !couple) {
      return NextResponse.json({ error: "Çift bulunamadı." }, { status: 404 });
    }

    const { data: photo, error: photoError } = await supabase
      .from("couple_photos")
      .select("id, couple_id, drive_file_id")
      .eq("id", photoId)
      .maybeSingle();

    if (photoError || !photo) {
      return NextResponse.json({ error: "Fotoğraf bulunamadı." }, { status: 404 });
    }

    if (photo.couple_id !== couple.id) {
      return NextResponse.json(
        { error: "Fotoğraf bu çifle eşleşmiyor." },
        { status: 403 }
      );
    }

    if (photo.drive_file_id) {
      try {
        await deleteDriveFile(photo.drive_file_id);
      } catch (driveError) {
        console.error("[delete-couple-photo] drive delete failed:", driveError);
      }
    }

    const { error: deleteError } = await supabase
      .from("couple_photos")
      .delete()
      .eq("id", photoId);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message ?? "Fotoğraf silinemedi." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[delete-couple-photo]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Fotoğraf silinirken hata oluştu.",
      },
      { status: 500 }
    );
  }
}
