import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { fetchCoupleAftermovie } from "@/lib/supabase/aftermovie";
import {
  isAftermoviePubliclyAvailable,
  isForbiddenMockVideoUrl,
} from "@/lib/aftermovie/lifecycle";
import {
  readCoupleAdminSession,
  readSuperAdminSession,
} from "@/lib/auth/admin-session-cookie";
import { fetchDriveMediaBuffer } from "@/lib/media-access";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

async function authorizePlayback(slug: string, coupleId: string) {
  if ((await readSuperAdminSession()) != null) return true;
  const coupleSession = await readCoupleAdminSession();
  if (coupleSession?.slug === slug && coupleSession.coupleId === coupleId) {
    return true;
  }
  return false;
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
    const adminOk = await authorizePlayback(slug, couple.id);
    if (!publicOk && !adminOk) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (
      !aftermovie.finalVideoUrl ||
      aftermovie.finalVideoUrl === "slideshow://memoora" ||
      aftermovie.renderProvider === "slideshow" ||
      isForbiddenMockVideoUrl(aftermovie.finalVideoUrl)
    ) {
      return NextResponse.json(
        { error: "Slideshow film — use media slides", mode: "slideshow" },
        { status: 404 },
      );
    }

    const key = aftermovie.finalVideoStorageKey?.trim() ?? "";
    const download = new URL(req.url).searchParams.get("download") === "1";

    if (key.startsWith("external:")) {
      const external = key.slice("external:".length);
      if (isForbiddenMockVideoUrl(external)) {
        return NextResponse.json({ error: "Video unavailable" }, { status: 404 });
      }
      return NextResponse.redirect(external, 302);
    }

    if (key) {
      const { buffer, mimeType } = await fetchDriveMediaBuffer(key);
      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          "Content-Type": mimeType.includes("video") ? mimeType : "video/mp4",
          "Cache-Control": publicOk
            ? "public, max-age=3600"
            : "private, no-store",
          ...(download
            ? {
                "Content-Disposition": `attachment; filename="memoora-after-${slug}.mp4"`,
              }
            : {}),
        },
      });
    }

    // Absolute HTTPS URL stored (legacy/external without storage key prefix)
    if (aftermovie.finalVideoUrl.startsWith("https://")) {
      if (isForbiddenMockVideoUrl(aftermovie.finalVideoUrl)) {
        return NextResponse.json({ error: "Video unavailable" }, { status: 404 });
      }
      return NextResponse.redirect(aftermovie.finalVideoUrl, 302);
    }

    // Relative app path that points to itself — avoid loops
    if (aftermovie.finalVideoUrl.startsWith("/api/aftermovie/")) {
      return NextResponse.json({ error: "Video storage missing" }, { status: 404 });
    }

    // Dev-only relative path (mock) — allow only outside production for authenticated admin
    if (!publicOk && adminOk && aftermovie.finalVideoUrl.startsWith("/")) {
      return NextResponse.redirect(new URL(aftermovie.finalVideoUrl, req.url));
    }

    return NextResponse.json({ error: "Video unavailable" }, { status: 404 });
  } catch (error) {
    console.error("[aftermovie playback]", error);
    return NextResponse.json({ error: "Playback failed" }, { status: 500 });
  }
}
