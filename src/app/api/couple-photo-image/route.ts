import { NextResponse } from "next/server";
import { getDriveClient, getMissingDriveEnvVars } from "@/lib/google/drive";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const photoId = searchParams.get("id")?.trim();

  if (!photoId) {
    return NextResponse.json({ error: "id gerekli." }, { status: 400 });
  }

  const missingEnv = getMissingDriveEnvVars();
  if (missingEnv.length > 0) {
    return NextResponse.json(
      { error: "Google Drive yapılandırması eksik." },
      { status: 500 }
    );
  }

  try {
    const supabase = createServiceRoleClient();

    const { data: photo, error } = await supabase
      .from("couple_photos")
      .select("id, drive_file_id, mime_type, is_visible")
      .eq("id", photoId)
      .maybeSingle();

    if (error || !photo?.drive_file_id) {
      return NextResponse.json({ error: "Fotoğraf bulunamadı." }, { status: 404 });
    }

    if (!photo.is_visible) {
      return NextResponse.json({ error: "Fotoğraf bulunamadı." }, { status: 404 });
    }

    const drive = getDriveClient();
    const response = await drive.files.get(
      {
        fileId: photo.drive_file_id,
        alt: "media",
      },
      { responseType: "arraybuffer" }
    );

    const buffer = Buffer.from(response.data as ArrayBuffer);
    const contentType = photo.mime_type || "image/jpeg";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    console.error("[couple-photo-image]", err);
    return NextResponse.json(
      { error: "Görsel yüklenemedi." },
      { status: 500 }
    );
  }
}
