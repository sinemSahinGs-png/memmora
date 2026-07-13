import { NextResponse } from "next/server";
import {
  authorizeCoupleGalleryAccess,
  buildCoupleGalleryZip,
  fetchCoupleGalleryMedia,
  MAX_BULK_DOWNLOAD_MEDIA,
} from "@/lib/media-archive";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(
  request: Request,
  context: { params: Promise<{ coupleSlug: string }> }
) {
  const { coupleSlug } = await context.params;
  const { searchParams } = new URL(request.url);
  const superAdmin = searchParams.get("superAdmin") === "1";

  const auth = await authorizeCoupleGalleryAccess(coupleSlug, { superAdmin });
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const mediaItems = await fetchCoupleGalleryMedia(auth.couple.id);

    if (mediaItems.length === 0) {
      return NextResponse.json(
        { error: "İndirilecek medya bulunamadı." },
        { status: 404 }
      );
    }

    if (mediaItems.length > MAX_BULK_DOWNLOAD_MEDIA) {
      return NextResponse.json(
        {
          error:
            "Toplu indirme hazırlanamadı. Lütfen daha küçük gruplar halinde deneyin.",
        },
        { status: 400 }
      );
    }

    const zipBuffer = await buildCoupleGalleryZip(auth.couple.slug, mediaItems);
    const filename = `memoora-${auth.couple.slug}-galeri.zip`;

    return new NextResponse(new Uint8Array(zipBuffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("[media/download-all]", err);
    return NextResponse.json(
      { error: "Arşiv hazırlanamadı. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
