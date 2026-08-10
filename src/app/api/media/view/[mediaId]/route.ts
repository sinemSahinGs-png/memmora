import { NextResponse } from "next/server";
import {
  authorizeContributionMedia,
  buildMediaStreamHeaders,
  fetchDriveMediaRange,
} from "@/lib/media-access";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(
  request: Request,
  context: { params: Promise<{ mediaId: string }> },
) {
  const { mediaId } = await context.params;
  const { searchParams } = new URL(request.url);
  const coupleSlug = searchParams.get("coupleSlug");

  const auth = await authorizeContributionMedia(mediaId, coupleSlug);

  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const fileId = auth.media.drive_file_id?.trim();
  if (!fileId) {
    return NextResponse.json({ error: "Medya dosyası bulunamadı." }, { status: 404 });
  }

  try {
    const rangeHeader = request.headers.get("range");
    const result = await fetchDriveMediaRange(fileId, rangeHeader);
    const contentType = auth.media.mime_type?.trim() || result.mimeType;

    return new NextResponse(new Uint8Array(result.body), {
      status: result.status,
      headers: buildMediaStreamHeaders({
        mimeType: contentType,
        size: result.size,
        status: result.status,
        contentRange: result.contentRange,
        cacheControl: "private, max-age=3600, stale-while-revalidate=86400",
        bodyLength: result.body.length,
      }),
    });
  } catch (err) {
    console.error("[media/view]", err);
    return NextResponse.json({ error: "Medya yüklenemedi." }, { status: 500 });
  }
}
