import { NextResponse } from "next/server";
import {
  authorizeContributionMedia,
  fetchDriveMediaBuffer,
} from "@/lib/media-access";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ mediaId: string }> }
) {
  const { mediaId } = await context.params;
  const { searchParams } = new URL(request.url);
  const coupleSlug = searchParams.get("coupleSlug");
  const superAdmin = searchParams.get("superAdmin") === "1";

  const auth = await authorizeContributionMedia(mediaId, coupleSlug, {
    superAdmin,
  });

  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const fileId = auth.media.drive_file_id?.trim();
  if (!fileId) {
    return NextResponse.json({ error: "Medya dosyası bulunamadı." }, { status: 404 });
  }

  try {
    const { buffer, mimeType } = await fetchDriveMediaBuffer(fileId);
    const contentType = auth.media.mime_type?.trim() || mimeType;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600, stale-while-revalidate=86400",
        "Content-Disposition": "inline",
      },
    });
  } catch (err) {
    console.error("[media/view]", err);
    return NextResponse.json({ error: "Medya yüklenemedi." }, { status: 500 });
  }
}
