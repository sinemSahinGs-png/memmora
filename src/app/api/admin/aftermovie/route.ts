import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/admin-session-cookie";
import {
  fetchCoupleAftermovie,
  listProductionAftermovies,
  updateAftermovieFields,
} from "@/lib/supabase/aftermovie";
import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  getAftermoviePlaybackPath,
  getAftermoviePosterPath,
  isForbiddenMockVideoUrl,
} from "@/lib/aftermovie/lifecycle";
import { getGlobalAftermovieMusic } from "@/lib/aftermovie/global-music";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(req: Request) {
  const auth = await requireSuperAdmin();
  if (!auth.ok) return jsonError(auth.error, auth.status);

  const url = new URL(req.url);
  const coupleId = url.searchParams.get("coupleId");
  const globalMusic = await getGlobalAftermovieMusic();
  const globalMusicPublic = globalMusic
    ? { title: globalMusic.title, artist: globalMusic.artist }
    : null;

  if (coupleId) {
    const aftermovie = await fetchCoupleAftermovie(coupleId, {
      includePrivate: true,
    });
    if (!aftermovie) return jsonError("Aftermovie bulunamadı", 404);
    const client = createServiceRoleClient();
    const { data: couple } = await client
      .from("couples")
      .select("id, slug, display_title, names, wedding_date")
      .eq("id", coupleId)
      .maybeSingle();
    return NextResponse.json({
      aftermovie,
      couple,
      globalMusic: globalMusicPublic,
      playbackUrl: couple?.slug
        ? getAftermoviePlaybackPath(couple.slug)
        : null,
      posterUrl: couple?.slug ? getAftermoviePosterPath(couple.slug) : null,
    });
  }

  const items = await listProductionAftermovies();
  return NextResponse.json({ items, globalMusic: globalMusicPublic });
}

export async function POST(req: Request) {
  const auth = await requireSuperAdmin();
  if (!auth.ok) return jsonError(auth.error, auth.status);

  try {
    const contentType = req.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const action = String(form.get("action") ?? "");
      const aftermovieId = String(form.get("aftermovieId") ?? "");
      const coupleSlug = String(form.get("coupleSlug") ?? "");
      if (!aftermovieId || !coupleSlug) {
        return jsonError("aftermovieId ve coupleSlug gerekli.");
      }

      const { getAftermovieOutputStorage } = await import(
        "@/lib/aftermovie/output-storage"
      );
      const storage = getAftermovieOutputStorage();

      if (action === "upload-final-video") {
        const file = form.get("file");
        if (!(file instanceof File)) return jsonError("MP4 dosyası gerekli.");
        if (!file.type.includes("mp4") && !file.name.toLowerCase().endsWith(".mp4")) {
          return jsonError("Yalnızca video/mp4 desteklenir.");
        }
        const buffer = Buffer.from(await file.arrayBuffer());
        if (buffer.length > 400 * 1024 * 1024) {
          return jsonError("Dosya çok büyük (max 400MB).");
        }
        const uploaded = await storage.uploadVideo({
          coupleSlug,
          buffer,
          filename: file.name || "aftermovie.mp4",
          mimeType: "video/mp4",
        });
        const playback = storage.getPlaybackUrl(coupleSlug);
        const durationRaw = form.get("durationSeconds");
        const duration =
          durationRaw != null && String(durationRaw).trim() !== ""
            ? Number(durationRaw)
            : null;
        const notes = String(form.get("productionNotes") ?? "").trim() || null;

        const updated = await updateAftermovieFields(aftermovieId, {
          final_video_storage_key: uploaded.storageKey,
          final_video_url: playback,
          final_video_duration_seconds: duration,
          production_notes: notes,
          render_provider: "manual",
          render_completed_at: new Date().toISOString(),
          render_error: null,
          status: "ready",
          approved_at: null,
        });
        return NextResponse.json({ aftermovie: updated });
      }

      if (action === "upload-poster") {
        const file = form.get("file");
        if (!(file instanceof File)) return jsonError("Poster dosyası gerekli.");
        const buffer = Buffer.from(await file.arrayBuffer());
        const uploaded = await storage.uploadPoster({
          coupleSlug,
          buffer,
          filename: file.name || "poster.jpg",
          mimeType: file.type || "image/jpeg",
        });
        const posterUrl = getAftermoviePosterPath(coupleSlug);
        const updated = await updateAftermovieFields(aftermovieId, {
          final_poster_storage_key: uploaded.storageKey,
          final_poster_url: posterUrl,
        });
        return NextResponse.json({ aftermovie: updated });
      }

      return jsonError("Unknown multipart action");
    }

    const body = (await req.json()) as {
      action?: string;
      aftermovieId?: string;
      coupleSlug?: string;
      externalVideoUrl?: string;
      productionNotes?: string;
      durationSeconds?: number | null;
      renderError?: string;
    };

    const action = body.action ?? "";
    if (!body.aftermovieId) return jsonError("aftermovieId gerekli.");

    if (action === "register-external-url") {
      const url = (body.externalVideoUrl ?? "").trim();
      if (!url.startsWith("https://")) {
        return jsonError("Harici video için HTTPS URL gerekli.");
      }
      if (isForbiddenMockVideoUrl(url)) {
        return jsonError("Mock video URL'si kullanılamaz.");
      }
      if (!body.coupleSlug) return jsonError("coupleSlug gerekli.");
      const playback = getAftermoviePlaybackPath(body.coupleSlug);
      const updated = await updateAftermovieFields(body.aftermovieId, {
        final_video_url: playback,
        // Store external original under storage key prefix for proxy redirect
        final_video_storage_key: `external:${url}`,
        final_video_duration_seconds: body.durationSeconds ?? null,
        production_notes: body.productionNotes ?? null,
        render_provider: "manual",
        render_completed_at: new Date().toISOString(),
        render_error: null,
        status: "ready",
        approved_at: null,
      });
      return NextResponse.json({ aftermovie: updated });
    }

    if (action === "mark-ready") {
      const client = createServiceRoleClient();
      const { data } = await client
        .from("couple_aftermovies")
        .select("final_video_url, final_video_storage_key")
        .eq("id", body.aftermovieId)
        .maybeSingle();
      if (!data?.final_video_url && !data?.final_video_storage_key) {
        return jsonError("Önce final video yükleyin veya kaydedin.");
      }
      if (isForbiddenMockVideoUrl(data.final_video_url)) {
        return jsonError("Mock video ile hazırlanamaz.");
      }
      const updated = await updateAftermovieFields(body.aftermovieId, {
        status: "ready",
        render_completed_at: new Date().toISOString(),
        approved_at: null,
        render_error: null,
      });
      return NextResponse.json({ aftermovie: updated });
    }

    if (action === "return-to-selection") {
      const updated = await updateAftermovieFields(body.aftermovieId, {
        status: "selecting",
        approved_at: null,
        render_error: null,
      });
      return NextResponse.json({ aftermovie: updated });
    }

    if (action === "report-error") {
      const updated = await updateAftermovieFields(body.aftermovieId, {
        status: "failed",
        render_error: body.renderError ?? "Prodüksiyon hatası",
        approved_at: null,
      });
      return NextResponse.json({ aftermovie: updated });
    }

    if (action === "unpublish") {
      const updated = await updateAftermovieFields(body.aftermovieId, {
        status: "unpublished",
        approved_at: null,
        published_at: null,
      });
      return NextResponse.json({ aftermovie: updated });
    }

    if (action === "force-publish") {
      const client = createServiceRoleClient();
      const { data } = await client
        .from("couple_aftermovies")
        .select("final_video_url, final_video_storage_key")
        .eq("id", body.aftermovieId)
        .maybeSingle();
      if (!data?.final_video_url && !data?.final_video_storage_key) {
        return jsonError("Final video yok.");
      }
      if (isForbiddenMockVideoUrl(data.final_video_url)) {
        return jsonError("Mock video yayınlanamaz.");
      }
      const updated = await updateAftermovieFields(body.aftermovieId, {
        status: "published",
        approved_at: new Date().toISOString(),
        published_at: new Date().toISOString(),
        publish_at: new Date().toISOString(),
      });
      return NextResponse.json({ aftermovie: updated });
    }

    if (action === "save-notes") {
      const updated = await updateAftermovieFields(body.aftermovieId, {
        production_notes: body.productionNotes ?? null,
      });
      return NextResponse.json({ aftermovie: updated });
    }

    if (action === "resolve-revision") {
      const updated = await updateAftermovieFields(body.aftermovieId, {
        status: "waiting_for_production",
        revision_resolved_at: new Date().toISOString(),
        approved_at: null,
      });
      return NextResponse.json({ aftermovie: updated });
    }

    return jsonError("Unknown action");
  } catch (error) {
    console.error("[admin aftermovie]", error);
    return jsonError(
      error instanceof Error ? error.message : "İşlem başarısız",
      500,
    );
  }
}
