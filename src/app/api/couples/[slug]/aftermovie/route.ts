import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  ensureCoupleAftermovie,
  fetchCoupleAftermovie,
  fetchSelectableGuestMedia,
  saveAftermovieSelections,
  updateAftermovieFields,
} from "@/lib/supabase/aftermovie";
import { getAftermovieRenderProvider } from "@/lib/aftermovie/render-provider";
import {
  assertAftermovieEnvForProvider,
  getConfiguredAftermovieProviderMode,
  isProductionRuntime,
} from "@/lib/aftermovie/env";
import { getGlobalAftermovieMusic } from "@/lib/aftermovie/global-music";
import {
  AFTERMOVIE_PHOTO_MAX,
  AFTERMOVIE_PHOTO_MIN,
  AFTERMOVIE_VIDEO_MAX,
  type OrderedAftermovieMedia,
} from "@/lib/aftermovie/types";
import {
  getAftermoviePlaybackPath,
  getAftermoviePosterPath,
  hasPlayableAftermovie,
  isForbiddenMockVideoUrl,
  isSlideshowFilm,
  resolveAutoPublishPatch,
} from "@/lib/aftermovie/lifecycle";
import { getCoupleDisplayTitle } from "@/lib/couple-utils";
import { requireCoupleAdminForSlug } from "@/lib/auth/admin-session-cookie";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

async function resolveCouple(slug: string) {
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from("couples")
    .select(
      "id, slug, names, bride_name, groom_name, display_title, wedding_date, status, deleted_at",
    )
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  return data;
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(_req: Request, context: RouteContext) {
  try {
    const { slug: raw } = await context.params;
    const slug = raw.trim().toLowerCase();
    const auth = await requireCoupleAdminForSlug(slug);
    if (!auth.ok) return jsonError(auth.error, auth.status);

    const couple = await resolveCouple(slug);
    if (!couple) return jsonError("Couple not found", 404);

    const title =
      couple.display_title ||
      getCoupleDisplayTitle({
        brideName: couple.bride_name ?? "",
        groomName: couple.groom_name ?? "",
        displayTitle: couple.display_title ?? "",
        names: couple.names ?? "",
      } as never);

    const aftermovie = await ensureCoupleAftermovie({
      coupleId: couple.id,
      weddingDate: couple.wedding_date ?? new Date().toISOString().slice(0, 10),
      coupleNames: title,
      useServiceRole: true,
    });

    const full = await fetchCoupleAftermovie(couple.id, { includePrivate: true });
    const selectable = await fetchSelectableGuestMedia(couple.id, couple.slug);
    const globalMusic = await getGlobalAftermovieMusic();

    let providerMode = "manual";
    let providerMessage =
      "Seçtiğiniz anılar, Memoora’nın film müziğiyle bir düğün filmine dönüştürülür.";
    try {
      providerMode = getConfiguredAftermovieProviderMode();
      if (providerMode === "mock" && !isProductionRuntime()) {
        providerMessage =
          "Geliştirme modu. Prodüksiyonda Memoora ekibi filmi hazırlar.";
      }
    } catch {
      providerMessage =
        "Film üretim ayarları tamamlanıyor. Seçimleriniz kaydedilebilir.";
    }

    return NextResponse.json({
      aftermovie: full ?? aftermovie,
      selectable,
      selectableCount: selectable.length,
      globalMusic: globalMusic
        ? { title: globalMusic.title, artist: globalMusic.artist }
        : null,
      providerMode,
      providerMessage,
      limits: {
        photoMin: AFTERMOVIE_PHOTO_MIN,
        photoMax: AFTERMOVIE_PHOTO_MAX,
        videoMax: AFTERMOVIE_VIDEO_MAX,
      },
    });
  } catch (error) {
    console.error("[aftermovie GET]", error);
    return jsonError("Failed to load aftermovie", 500);
  }
}

export async function POST(req: Request, context: RouteContext) {
  try {
    const { slug: raw } = await context.params;
    const slug = raw.trim().toLowerCase();
    const auth = await requireCoupleAdminForSlug(slug);
    if (!auth.ok) return jsonError(auth.error, auth.status);

    const couple = await resolveCouple(slug);
    if (!couple) return jsonError("Couple not found", 404);
    if (auth.session.coupleId !== couple.id) {
      return jsonError("Bu çift için yetkiniz yok.", 403);
    }

    const body = (await req.json()) as {
      action?: string;
      items?: OrderedAftermovieMedia[];
      posterMediaId?: string | null;
      /** Ignored — global music only */
      musicId?: string | null;
      music_id?: string | null;
      music_url?: string | null;
      volume?: number;
      start_offset?: number;
      durationPreset?: "short" | "standard" | "long";
      openingText?: string | null;
      closingText?: string | null;
      title?: string | null;
      publishAt?: string | null;
      revisionNote?: string | null;
    };
    // Strip legacy couple music fields from trusted write path
    void body.musicId;
    void body.music_id;
    void body.music_url;
    void body.volume;
    void body.start_offset;

    const action = body.action ?? "save";
    const existing = await fetchCoupleAftermovie(couple.id, {
      includePrivate: true,
    });
    if (!existing) return jsonError("Aftermovie missing", 404);

    if (action === "save") {
      const items = body.items ?? [];
      const photos = items.filter((i) => i.mediaType === "photo").length;
      const videos = items.filter((i) => i.mediaType === "video").length;
      if (photos > AFTERMOVIE_PHOTO_MAX) {
        return jsonError(`En fazla ${AFTERMOVIE_PHOTO_MAX} fotoğraf seçebilirsiniz.`);
      }
      if (videos > AFTERMOVIE_VIDEO_MAX) {
        return jsonError(`En fazla ${AFTERMOVIE_VIDEO_MAX} video seçebilirsiniz.`);
      }

      const hardLocked =
        existing.status === "queued" || existing.status === "rendering";

      if (hardLocked) {
        return jsonError(
          "Film şu an üretiliyor. Bitince seçimleri değiştirebilirsiniz.",
        );
      }

      // Couples may update picks anytime except during active render.
      const saved = await saveAftermovieSelections({
        aftermovieId: existing.id,
        coupleId: couple.id,
        items,
        posterMediaId: body.posterMediaId,
        durationPreset: body.durationPreset,
        openingText: body.openingText,
        closingText: body.closingText,
        title: body.title,
        publishAt: body.publishAt,
        preserveStatus:
          existing.status === "ready" ||
          existing.status === "waiting_for_production" ||
          existing.status === "scheduled" ||
          existing.status === "published",
      });
      return NextResponse.json({ aftermovie: saved });
    }

    if (action === "submit" || action === "queue-render") {
      if (existing.status === "queued" || existing.status === "rendering") {
        return jsonError(
          "Film şu an üretiliyor. Bitince tekrar gönderebilirsiniz.",
        );
      }

      // Atomic path: persist current client selections, then build slideshow film.
      let working = existing;
      if (body.items && body.items.length > 0) {
        let posterId = body.posterMediaId ?? null;
        if (!posterId) {
          posterId =
            body.items.find((i) => i.isPoster && i.mediaType === "photo")
              ?.mediaId ??
            body.items.find((i) => i.mediaType === "photo")?.mediaId ??
            null;
        }
        working = await saveAftermovieSelections({
          aftermovieId: existing.id,
          coupleId: couple.id,
          items: body.items,
          posterMediaId: posterId,
          durationPreset: body.durationPreset ?? existing.durationPreset,
          openingText: body.openingText ?? existing.openingText,
          closingText: body.closingText ?? existing.closingText,
          title: body.title ?? existing.title,
          publishAt: body.publishAt ?? existing.publishAt,
          preserveStatus: true,
        });
      }

      const refreshed = await fetchCoupleAftermovie(couple.id, {
        includePrivate: true,
      });
      if (!refreshed?.media?.length) {
        return jsonError(
          "Önce anı seçin ve kaydedin. Seçili fotoğraf bulunamadı.",
        );
      }
      const photos = refreshed.media.filter((m) => m.mediaType === "photo").length;
      if (photos < AFTERMOVIE_PHOTO_MIN) {
        return jsonError(`En az ${AFTERMOVIE_PHOTO_MIN} fotoğraf seçilmeli.`);
      }

      let posterMediaId = refreshed.posterMediaId;
      if (!posterMediaId) {
        posterMediaId =
          refreshed.media.find((m) => m.mediaType === "photo")?.mediaId ?? null;
        if (posterMediaId) {
          await updateAftermovieFields(
            refreshed.id,
            { poster_media_id: posterMediaId },
            { coupleId: couple.id },
          );
        }
      }
      if (!posterMediaId) {
        return jsonError("Göndermeden önce bir kapak fotoğrafı seçin.");
      }

      let mode: string;
      try {
        mode = assertAftermovieEnvForProvider();
      } catch {
        mode = "manual";
      }

      const globalMusic = await getGlobalAftermovieMusic();
      const provider = getAftermovieRenderProvider();
      const queued = await provider.queueRender({
        aftermovieId: refreshed.id,
        coupleId: couple.id,
        media: refreshed.media.map((m) => ({
          mediaId: m.mediaId,
          mediaType: m.mediaType,
          sortOrder: m.sortOrder,
          category: m.category,
          isPoster: m.isPoster || m.mediaId === posterMediaId,
        })),
        music: globalMusic ?? undefined,
        title: refreshed.title ?? couple.names ?? "Memoora After",
        weddingDate: couple.wedding_date ?? "",
        openingText: refreshed.openingText ?? undefined,
        closingText: refreshed.closingText ?? undefined,
        durationPreset: refreshed.durationPreset,
      });

      if (
        queued.awaitingManualProduction ||
        mode === "manual" ||
        mode === "mock" ||
        provider.name === "manual" ||
        provider.name === "mock"
      ) {
        const now = new Date().toISOString();
        const publish = resolveAutoPublishPatch({
          publishAt: body.publishAt,
          existingPublishAt: refreshed.publishAt,
          recommendedPublishAt: refreshed.recommendedPublishAt,
        });
        const updated = await updateAftermovieFields(
          refreshed.id,
          {
            status: publish.status,
            submitted_at: now,
            render_provider: "slideshow",
            render_job_id: queued.jobId,
            render_started_at: now,
            render_completed_at: now,
            render_error: null,
            approved_at: publish.approved_at,
            published_at: publish.published_at,
            publish_at: publish.publish_at,
            final_video_url: "slideshow://memoora",
            final_video_storage_key: null,
            poster_media_id: posterMediaId,
            music_id:
              globalMusic && globalMusic.id !== "env-global"
                ? globalMusic.id
                : refreshed.musicId,
          },
          { coupleId: couple.id },
        );
        const full = await fetchCoupleAftermovie(couple.id, {
          includePrivate: true,
        });
        return NextResponse.json({
          aftermovie: full ?? updated ?? working,
          job: queued,
          playbackMode: "slideshow",
          autoPublished: publish.status === "published",
          message: publish.message,
        });
      }

      if (isProductionRuntime() && queued.provider === "mock") {
        return jsonError(
          "Otomatik video üretim servisi yapılandırılmadı.",
          503,
        );
      }

      const updated = await updateAftermovieFields(
        refreshed.id,
        {
          status: "rendering",
          submitted_at: new Date().toISOString(),
          render_provider: queued.provider,
          render_job_id: queued.jobId,
          render_started_at: new Date().toISOString(),
          render_error: null,
        },
        { coupleId: couple.id },
      );

      return NextResponse.json({ aftermovie: updated, job: queued });
    }

    if (action === "poll-render") {
      if (existing.renderProvider === "manual") {
        return NextResponse.json({
          aftermovie: existing,
          job: {
            jobId: existing.renderJobId,
            state: "waiting_for_production",
          },
        });
      }
      if (!existing.renderJobId) return jsonError("Render işi yok.");
      if (isProductionRuntime()) {
        return jsonError("Otomatik video üretim servisi yapılandırılmadı.", 503);
      }

      const provider = getAftermovieRenderProvider();
      const status = await provider.getRenderStatus(existing.renderJobId);
      if (status.state === "ready" && status.outputUrl) {
        if (isForbiddenMockVideoUrl(status.outputUrl) && isProductionRuntime()) {
          return jsonError("Mock video production'da kullanılamaz.", 503);
        }
        // Dev only: may store stand-in for local UX testing
        const updated = await updateAftermovieFields(
          existing.id,
          {
            status: "ready",
            final_video_url: status.outputUrl,
            render_completed_at: new Date().toISOString(),
            render_error: null,
          },
          { coupleId: couple.id },
        );
        return NextResponse.json({ aftermovie: updated, job: status });
      }
      if (status.state === "failed") {
        const updated = await updateAftermovieFields(
          existing.id,
          {
            status: "failed",
            render_error: status.error ?? "Render failed",
          },
          { coupleId: couple.id },
        );
        return NextResponse.json({ aftermovie: updated, job: status });
      }
      return NextResponse.json({ aftermovie: existing, job: status });
    }

    if (action === "approve") {
      if (!hasPlayableAftermovie(existing)) {
        return jsonError(
          "Önce filmi hazırlamaya gönderin; slayt otomatik oluşur.",
        );
      }
      const publish = resolveAutoPublishPatch({
        publishAt: body.publishAt,
        existingPublishAt: existing.publishAt,
        recommendedPublishAt: existing.recommendedPublishAt,
      });
      const updated = await updateAftermovieFields(
        existing.id,
        {
          status: publish.status,
          approved_at: publish.approved_at,
          published_at: publish.published_at,
          publish_at: publish.publish_at,
          // Ensure slideshow sentinel if media exists but provider unset
          ...(isSlideshowFilm(existing) || (existing.media?.length ?? 0) > 0
            ? {
                render_provider: existing.renderProvider || "slideshow",
                final_video_url:
                  existing.finalVideoUrl || "slideshow://memoora",
              }
            : {}),
          revision_requested_at: null,
          revision_note: null,
          revision_resolved_at: new Date().toISOString(),
        },
        { coupleId: couple.id },
      );
      return NextResponse.json({
        aftermovie: updated,
        message: publish.message,
      });
    }

    if (action === "request-revision") {
      const note = (body.revisionNote ?? "").trim();
      if (!note) return jsonError("Düzenleme notu gerekli.");
      const updated = await updateAftermovieFields(
        existing.id,
        {
          status: "revision_requested",
          approved_at: null,
          revision_requested_at: new Date().toISOString(),
          revision_note: note,
          revision_resolved_at: null,
        },
        { coupleId: couple.id },
      );
      return NextResponse.json({ aftermovie: updated });
    }

    if (action === "schedule") {
      if (!body.publishAt) return jsonError("Yayın tarihi gerekli.");
      const updated = await updateAftermovieFields(
        existing.id,
        {
          publish_at: body.publishAt,
          status: existing.approvedAt ? "scheduled" : existing.status,
        },
        { coupleId: couple.id },
      );
      return NextResponse.json({ aftermovie: updated });
    }

    if (action === "retry") {
      const updated = await updateAftermovieFields(
        existing.id,
        {
          status: "selecting",
          render_error: null,
          render_job_id: null,
          approved_at: null,
        },
        { coupleId: couple.id },
      );
      return NextResponse.json({ aftermovie: updated });
    }

    // Playback helper paths for UI (always proxy-shaped)
    if (action === "playback-meta") {
      return NextResponse.json({
        playbackUrl: getAftermoviePlaybackPath(couple.slug),
        posterUrl: getAftermoviePosterPath(couple.slug),
      });
    }

    return jsonError("Unknown action");
  } catch (error) {
    console.error("[aftermovie POST]", error);
    return jsonError("Aftermovie update failed", 500);
  }
}
