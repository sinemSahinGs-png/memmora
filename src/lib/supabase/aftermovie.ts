import { createSupabaseClient, isSupabaseConfigured } from "./client";
import { createServiceRoleClient } from "./server";
import { getMediaViewUrl } from "@/lib/admin-media-urls";
import { addDaysIso } from "@/lib/aftermovie/lifecycle";
import type {
  AftermovieDurationPreset,
  AftermovieMediaItem,
  AftermovieMusic,
  AftermovieStatus,
  CoupleAftermovie,
  OrderedAftermovieMedia,
} from "@/lib/aftermovie/types";
import { isAftermovieStatus } from "@/lib/aftermovie/types";

type DbAftermovie = {
  id: string;
  couple_id: string;
  status: string;
  template_key: string;
  title: string | null;
  opening_text: string | null;
  closing_text: string | null;
  poster_media_id: string | null;
  music_id: string | null;
  duration_preset: string;
  recommended_publish_at: string | null;
  publish_at: string | null;
  approved_at: string | null;
  published_at: string | null;
  submitted_at?: string | null;
  revision_requested_at?: string | null;
  revision_note?: string | null;
  revision_resolved_at?: string | null;
  production_notes?: string | null;
  final_video_duration_seconds?: number | null;
  final_poster_url?: string | null;
  final_poster_storage_key?: string | null;
  render_started_at: string | null;
  render_completed_at: string | null;
  final_video_url: string | null;
  final_video_storage_key: string | null;
  render_provider: string | null;
  render_job_id: string | null;
  render_error: string | null;
  created_at: string;
  updated_at: string;
};

type DbAftermovieMedia = {
  id: string;
  aftermovie_id: string;
  media_id: string;
  media_type: string;
  sort_order: number;
  trim_start_seconds: number | null;
  trim_end_seconds: number | null;
  category: string | null;
  is_poster: boolean;
};

type DbMusic = {
  id: string;
  title: string;
  artist: string | null;
  file_url: string;
  storage_key: string | null;
  duration_seconds: number | null;
  license_source: string | null;
  is_active: boolean;
};

function mapMusic(row: DbMusic): AftermovieMusic {
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    fileUrl: row.file_url,
    storageKey: row.storage_key,
    durationSeconds: row.duration_seconds,
    licenseSource: row.license_source,
    isActive: row.is_active,
  };
}

function mapStatus(raw: string): AftermovieStatus {
  return isAftermovieStatus(raw) ? raw : "draft";
}

function mapAftermovie(row: DbAftermovie): CoupleAftermovie {
  return {
    id: row.id,
    coupleId: row.couple_id,
    status: mapStatus(row.status),
    templateKey: row.template_key,
    title: row.title,
    openingText: row.opening_text,
    closingText: row.closing_text,
    posterMediaId: row.poster_media_id,
    musicId: row.music_id,
    durationPreset: (row.duration_preset as AftermovieDurationPreset) || "standard",
    recommendedPublishAt: row.recommended_publish_at,
    publishAt: row.publish_at,
    approvedAt: row.approved_at,
    publishedAt: row.published_at,
    submittedAt: row.submitted_at ?? null,
    revisionRequestedAt: row.revision_requested_at ?? null,
    revisionNote: row.revision_note ?? null,
    revisionResolvedAt: row.revision_resolved_at ?? null,
    productionNotes: row.production_notes ?? null,
    finalVideoDurationSeconds:
      row.final_video_duration_seconds != null
        ? Number(row.final_video_duration_seconds)
        : null,
    finalPosterUrl: row.final_poster_url ?? null,
    finalPosterStorageKey: row.final_poster_storage_key ?? null,
    renderStartedAt: row.render_started_at,
    renderCompletedAt: row.render_completed_at,
    finalVideoUrl: row.final_video_url,
    finalVideoStorageKey: row.final_video_storage_key,
    renderProvider: row.render_provider,
    renderJobId: row.render_job_id,
    renderError: row.render_error,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function ensureCoupleAftermovie(input: {
  coupleId: string;
  weddingDate: string;
  coupleNames: string;
  useServiceRole?: boolean;
}): Promise<CoupleAftermovie | null> {
  if (!isSupabaseConfigured()) return null;
  const client = input.useServiceRole
    ? createServiceRoleClient()
    : createSupabaseClient();

  const { data: existing } = await client
    .from("couple_aftermovies")
    .select("*")
    .eq("couple_id", input.coupleId)
    .maybeSingle();

  if (existing) return mapAftermovie(existing as DbAftermovie);

  const recommended = addDaysIso(input.weddingDate || new Date().toISOString(), 7);
  const { data, error } = await client
    .from("couple_aftermovies")
    .insert({
      couple_id: input.coupleId,
      status: "draft",
      title: input.coupleNames,
      opening_text: input.coupleNames,
      closing_text: "Anılar yaşamaya devam ediyor.",
      duration_preset: "standard",
      recommended_publish_at: recommended,
      publish_at: recommended,
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapAftermovie(data as DbAftermovie);
}

export async function fetchCoupleAftermovie(
  coupleId: string,
  opts?: { includePrivate?: boolean },
): Promise<CoupleAftermovie | null> {
  if (!isSupabaseConfigured()) return null;
  const client = opts?.includePrivate
    ? createServiceRoleClient()
    : createSupabaseClient();

  const { data, error } = await client
    .from("couple_aftermovies")
    .select("*")
    .eq("couple_id", coupleId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const aftermovie = mapAftermovie(data as DbAftermovie);

  const { data: mediaRows } = await client
    .from("couple_aftermovie_media")
    .select("*")
    .eq("aftermovie_id", aftermovie.id)
    .order("sort_order", { ascending: true });

  aftermovie.media = ((mediaRows ?? []) as DbAftermovieMedia[]).map((m) => ({
    id: m.id,
    aftermovieId: m.aftermovie_id,
    mediaId: m.media_id,
    mediaType: m.media_type as "photo" | "video",
    sortOrder: m.sort_order,
    trimStartSeconds: m.trim_start_seconds,
    trimEndSeconds: m.trim_end_seconds,
    category: m.category,
    isPoster: m.is_poster,
  }));

  if (aftermovie.musicId) {
    const { data: music } = await client
      .from("aftermovie_music")
      .select("*")
      .eq("id", aftermovie.musicId)
      .maybeSingle();
    aftermovie.music = music ? mapMusic(music as DbMusic) : null;
  }

  return aftermovie;
}

export async function fetchActiveMusicLibrary(): Promise<AftermovieMusic[]> {
  if (!isSupabaseConfigured()) return [];
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from("aftermovie_music")
    .select("*")
    .eq("is_active", true)
    .order("title", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as DbMusic[]).map(mapMusic);
}

export interface SelectableGuestMedia {
  mediaId: string;
  mediaType: "photo" | "video";
  guestName: string;
  mimeType: string | null;
  filename: string | null;
  createdAt: string;
  proxyUrl: string;
  durationSeconds?: number | null;
}

/**
 * Same wedding-upload source as couple admin Galeri / contribution_media.
 */
export async function fetchSelectableGuestMedia(
  coupleId: string,
  coupleSlug: string,
): Promise<SelectableGuestMedia[]> {
  if (!isSupabaseConfigured()) return [];
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from("contributions")
    .select(
      `
      guest_name,
      created_at,
      is_visible,
      contribution_media (*)
    `,
    )
    .eq("couple_id", coupleId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const out: SelectableGuestMedia[] = [];
  for (const row of data ?? []) {
    const contribution = row as {
      guest_name?: string | null;
      created_at?: string;
      is_visible?: boolean | null;
      contribution_media?: Array<Record<string, unknown>> | null;
    };
    // Match gallery: skip hidden contributions
    if (contribution.is_visible === false) continue;

    const mediaList = contribution.contribution_media ?? [];
    for (const m of mediaList) {
      if (m.hidden || m.deleted_at) continue;
      const mime = String(m.mime_type ?? m.file_type ?? "").toLowerCase();
      const isVideo =
        mime.startsWith("video/") ||
        mime === "video" ||
        String(m.file_type ?? "").toLowerCase() === "video";
      out.push({
        mediaId: String(m.id),
        mediaType: isVideo ? "video" : "photo",
        guestName: String(contribution.guest_name ?? "Misafir"),
        mimeType: mime || null,
        filename: (m.filename as string) ?? (m.file_name as string) ?? null,
        createdAt: String(m.created_at ?? contribution.created_at ?? ""),
        proxyUrl: getMediaViewUrl(String(m.id), coupleSlug),
        durationSeconds: null,
      });
    }
  }

  out.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return out;
}

export async function saveAftermovieSelections(input: {
  aftermovieId: string;
  coupleId: string;
  items: OrderedAftermovieMedia[];
  posterMediaId?: string | null;
  durationPreset?: AftermovieDurationPreset;
  openingText?: string | null;
  closingText?: string | null;
  title?: string | null;
  publishAt?: string | null;
  /** When true, keep current status (e.g. ready publish-date only). */
  preserveStatus?: boolean;
}): Promise<CoupleAftermovie> {
  const client = createServiceRoleClient();

  // Resolve global music server-side — ignore any couple music_id
  let globalMusicId: string | null = null;
  try {
    const { getGlobalAftermovieMusic } = await import(
      "@/lib/aftermovie/global-music"
    );
    const globalMusic = await getGlobalAftermovieMusic();
    if (globalMusic && globalMusic.id !== "env-global") {
      globalMusicId = globalMusic.id;
    }
  } catch {
    globalMusicId = null;
  }

  await client
    .from("couple_aftermovie_media")
    .delete()
    .eq("aftermovie_id", input.aftermovieId);

  if (input.items.length > 0) {
    const rows = input.items.map((item, index) => ({
      aftermovie_id: input.aftermovieId,
      media_id: item.mediaId,
      media_type: item.mediaType,
      sort_order: item.sortOrder ?? index,
      category: item.category ?? null,
      is_poster: Boolean(item.isPoster),
      trim_start_seconds: item.trimStartSeconds ?? null,
      trim_end_seconds: item.trimEndSeconds ?? null,
    }));
    const { error: mediaError } = await client
      .from("couple_aftermovie_media")
      .insert(rows);
    if (mediaError) throw mediaError;
  }

  const posterId =
    input.posterMediaId ??
    input.items.find((i) => i.isPoster)?.mediaId ??
    input.items.find((i) => i.mediaType === "photo")?.mediaId ??
    null;

  const patch = {
    poster_media_id: posterId,
    music_id: globalMusicId,
    duration_preset: input.durationPreset ?? "standard",
    opening_text: input.openingText ?? null,
    closing_text: input.closingText ?? null,
    title: input.title ?? null,
    publish_at: input.publishAt ?? undefined,
    updated_at: new Date().toISOString(),
    render_error: null as string | null,
    ...(input.preserveStatus ? {} : { status: "selecting" as const }),
  };

  const { data, error } = await client
    .from("couple_aftermovies")
    .update(patch)
    .eq("id", input.aftermovieId)
    .eq("couple_id", input.coupleId)
    .select("*")
    .single();

  if (error) throw error;
  return mapAftermovie(data as DbAftermovie);
}

export async function updateAftermovieFields(
  aftermovieId: string,
  patch: Record<string, unknown>,
  opts?: { coupleId?: string },
): Promise<CoupleAftermovie> {
  const client = createServiceRoleClient();
  let query = client
    .from("couple_aftermovies")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", aftermovieId);
  if (opts?.coupleId) {
    query = query.eq("couple_id", opts.coupleId);
  }
  const { data, error } = await query.select("*").single();
  if (error) throw error;
  return mapAftermovie(data as DbAftermovie);
}

/**
 * Idempotent publish candidates — excludes already published and revision-blocked.
 */
export async function listDueAftermoviesForPublish(
  nowIso = new Date().toISOString(),
): Promise<CoupleAftermovie[]> {
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from("couple_aftermovies")
    .select("*")
    .in("status", ["ready", "scheduled"])
    .not("approved_at", "is", null)
    .not("final_video_url", "is", null)
    .lte("publish_at", nowIso)
    .is("published_at", null);

  if (error) throw error;
  return ((data ?? []) as DbAftermovie[])
    .map(mapAftermovie)
    .filter((row) => row.status !== "revision_requested");
}

export async function markAftermoviePublishedIdempotent(
  aftermovieId: string,
): Promise<{ published: boolean; aftermovie: CoupleAftermovie | null }> {
  const client = createServiceRoleClient();
  const now = new Date().toISOString();
  const { data, error } = await client
    .from("couple_aftermovies")
    .update({
      status: "published",
      published_at: now,
      updated_at: now,
    })
    .eq("id", aftermovieId)
    .in("status", ["ready", "scheduled"])
    .not("approved_at", "is", null)
    .not("final_video_url", "is", null)
    .is("published_at", null)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  if (!data) return { published: false, aftermovie: null };
  return { published: true, aftermovie: mapAftermovie(data as DbAftermovie) };
}

export async function listProductionAftermovies(): Promise<
  Array<CoupleAftermovie & { coupleSlug?: string; coupleTitle?: string; weddingDate?: string | null }>
> {
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from("couple_aftermovies")
    .select(
      `
      *,
      couples (
        slug,
        display_title,
        names,
        wedding_date,
        deleted_at
      )
    `,
    )
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return (data ?? [])
    .map((row) => {
      const couple = (
        row as {
          couples?: {
            slug: string;
            display_title: string | null;
            names: string | null;
            wedding_date: string | null;
            deleted_at: string | null;
          } | null;
        }
      ).couples;
      if (!couple || couple.deleted_at) return null;
      const mapped = mapAftermovie(row as DbAftermovie);
      return {
        ...mapped,
        coupleSlug: couple.slug,
        coupleTitle: couple.display_title || couple.names || undefined,
        weddingDate: couple.wedding_date ?? null,
      };
    })
    .filter(Boolean) as Array<
    CoupleAftermovie & {
      coupleSlug?: string;
      coupleTitle?: string;
      weddingDate?: string | null;
    }
  >;
}

export type { AftermovieMediaItem };
