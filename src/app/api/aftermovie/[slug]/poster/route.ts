import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { fetchCoupleAftermovie } from "@/lib/supabase/aftermovie";
import { isAftermoviePubliclyAvailable } from "@/lib/aftermovie/lifecycle";
import {
  readCoupleAdminSession,
  readSuperAdminSession,
} from "@/lib/auth/admin-session-cookie";
import { fetchDriveMediaBuffer } from "@/lib/media-access";
import { getMediaViewUrl } from "@/lib/admin-media-urls";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(req: Request, context: RouteContext) {
  try {
    const { slug: raw } = await context.params;
    const slug = raw.trim().toLowerCase();
    const client = createServiceRoleClient();
    const { data: couple } = await client
      .from("couples")
      .select("id, slug")
      .eq("slug", slug)
      .is("deleted_at", null)
      .maybeSingle();
    if (!couple) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const aftermovie = await fetchCoupleAftermovie(couple.id, {
      includePrivate: true,
    });
    if (!aftermovie) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const publicOk = isAftermoviePubliclyAvailable(aftermovie);
    const superOk = (await readSuperAdminSession()) != null;
    const coupleOk = (await readCoupleAdminSession())?.slug === slug;
    if (!publicOk && !superOk && !coupleOk) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (aftermovie.finalPosterStorageKey) {
      const { buffer, mimeType } = await fetchDriveMediaBuffer(
        aftermovie.finalPosterStorageKey,
      );
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": mimeType.startsWith("image/")
            ? mimeType
            : "image/jpeg",
          "Cache-Control": publicOk
            ? "public, max-age=3600"
            : "private, no-store",
        },
      });
    }

    if (aftermovie.finalPosterUrl?.startsWith("https://")) {
      return NextResponse.redirect(aftermovie.finalPosterUrl, 302);
    }

    if (aftermovie.posterMediaId) {
      return NextResponse.redirect(
        new URL(getMediaViewUrl(aftermovie.posterMediaId, slug), req.url),
      );
    }

    return NextResponse.json({ error: "Poster unavailable" }, { status: 404 });
  } catch (error) {
    console.error("[aftermovie poster]", error);
    return NextResponse.json({ error: "Poster failed" }, { status: 500 });
  }
}
