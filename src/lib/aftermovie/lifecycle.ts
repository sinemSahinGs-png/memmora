import type {
  AftermovieStatus,
  CoupleAftermovie,
  CoupleLifecycleMode,
  PublicCoupleAftermovie,
} from "./types";
import { AFTERMOVIE_STATUS_LABELS, FORBIDDEN_MOCK_VIDEO_MARKERS } from "./types";

function parseDay(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso.includes("T") ? iso : `${iso}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function addDaysIso(dateIso: string, days: number): string {
  const d = parseDay(dateIso) ?? new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function isForbiddenMockVideoUrl(
  url: string | null | undefined,
): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return FORBIDDEN_MOCK_VIDEO_MARKERS.some((marker) =>
    lower.includes(marker.toLowerCase()),
  );
}

export function hasPlayableFinalVideo(
  aftermovie: CoupleAftermovie | null | undefined,
): boolean {
  if (!aftermovie) return false;
  if (isForbiddenMockVideoUrl(aftermovie.finalVideoUrl)) return false;
  if (aftermovie.finalVideoUrl === "slideshow://memoora") return false;
  if (aftermovie.finalVideoStorageKey?.trim()) return true;
  if (aftermovie.finalVideoUrl?.trim()) return true;
  return false;
}

/** Cinematic photo/video slideshow film (no rendered MP4 required). */
export function isSlideshowFilm(
  aftermovie: CoupleAftermovie | null | undefined,
): boolean {
  if (!aftermovie) return false;
  if (aftermovie.renderProvider === "slideshow") return true;
  return aftermovie.finalVideoUrl === "slideshow://memoora";
}

export function hasSlideshowContent(
  aftermovie: CoupleAftermovie | null | undefined,
): boolean {
  if (!aftermovie) return false;
  if (!isSlideshowFilm(aftermovie)) return false;
  // Media relation may be omitted on some fetches — slideshow sentinel is enough
  // when selections were validated at submit time.
  if ((aftermovie.media?.length ?? 0) > 0) return true;
  return Boolean(aftermovie.posterMediaId) || aftermovie.status === "ready" ||
    aftermovie.status === "scheduled" ||
    aftermovie.status === "published";
}

export function hasPlayableAftermovie(
  aftermovie: CoupleAftermovie | null | undefined,
): boolean {
  return hasPlayableFinalVideo(aftermovie) || hasSlideshowContent(aftermovie);
}

/**
 * After slideshow/video is ready: auto-approve and schedule or publish by date.
 */
export function resolveAutoPublishPatch(input: {
  publishAt?: string | null;
  existingPublishAt?: string | null;
  recommendedPublishAt?: string | null;
  now?: Date;
}): {
  publish_at: string;
  status: "scheduled" | "published";
  approved_at: string;
  published_at: string | null;
  message: string;
} {
  const now = input.now ?? new Date();
  const nowIso = now.toISOString();
  const publishAt =
    input.publishAt?.trim() ||
    input.existingPublishAt?.trim() ||
    input.recommendedPublishAt?.trim() ||
    nowIso;
  const due =
    !Number.isNaN(new Date(publishAt).getTime()) &&
    new Date(publishAt).getTime() <= now.getTime();

  if (due) {
    return {
      publish_at: publishAt,
      status: "published",
      approved_at: nowIso,
      published_at: nowIso,
      message:
        "Düğün filminiz slayt olarak hazırlandı ve NFC sayfanızda yayınlandı.",
    };
  }

  return {
    publish_at: publishAt,
    status: "scheduled",
    approved_at: nowIso,
    published_at: null,
    message:
      "Düğün filminiz slayt olarak hazırlandı ve yayın tarihine zamanlandı. Tarih gelince otomatik yayınlanır.",
  };
}

/**
 * Central public availability check.
 * Post-wedding experience must only render when every condition passes.
 */
export function isAftermoviePubliclyAvailable(
  aftermovie: CoupleAftermovie | null | undefined,
  now = new Date(),
): boolean {
  if (!aftermovie) return false;
  if (aftermovie.status === "failed") return false;
  if (aftermovie.status === "unpublished") return false;
  if (aftermovie.status === "revision_requested") return false;

  const statusOk =
    aftermovie.status === "ready" ||
    aftermovie.status === "scheduled" ||
    aftermovie.status === "published";
  if (!statusOk) return false;
  if (!aftermovie.approvedAt) return false;
  if (!aftermovie.publishAt) return false;
  if (!hasPlayableAftermovie(aftermovie)) return false;

  const publishAt = new Date(aftermovie.publishAt);
  if (Number.isNaN(publishAt.getTime())) return false;
  return publishAt.getTime() <= now.getTime();
}

export function toPublicAftermovie(
  aftermovie: CoupleAftermovie,
): PublicCoupleAftermovie {
  return {
    id: aftermovie.id,
    coupleId: aftermovie.coupleId,
    status: aftermovie.status,
    title: aftermovie.title,
    openingText: aftermovie.openingText,
    closingText: aftermovie.closingText,
    posterMediaId: aftermovie.posterMediaId,
    durationPreset: aftermovie.durationPreset,
    publishAt: aftermovie.publishAt,
    publishedAt: aftermovie.publishedAt,
    approvedAt: aftermovie.approvedAt,
    finalVideoUrl: isForbiddenMockVideoUrl(aftermovie.finalVideoUrl)
      ? null
      : aftermovie.finalVideoUrl,
    finalPosterUrl: aftermovie.finalPosterUrl,
    finalVideoDurationSeconds: aftermovie.finalVideoDurationSeconds,
  };
}

export function resolveCoupleLifecycleMode(input: {
  weddingDate: string | null | undefined;
  aftermovie?: CoupleAftermovie | null;
  now?: Date;
}): CoupleLifecycleMode {
  const now = input.now ?? new Date();
  if (isAftermoviePubliclyAvailable(input.aftermovie, now)) {
    return "post_wedding";
  }

  const status = input.aftermovie?.status;
  if (
    status === "queued" ||
    status === "rendering" ||
    status === "waiting_for_production" ||
    status === "submitted"
  ) {
    return "rendering";
  }
  if (status === "scheduled" || status === "ready") return "scheduled";
  if (status === "revision_requested") return "collecting";
  if (status === "selecting" || status === "draft") {
    const wedding = parseDay(input.weddingDate);
    if (wedding && now.getTime() > wedding.getTime() + 24 * 60 * 60 * 1000) {
      return "selecting";
    }
  }

  const wedding = parseDay(input.weddingDate);
  if (!wedding) return "wedding_live";

  const dayMs = 24 * 60 * 60 * 1000;
  const start = new Date(wedding);
  start.setHours(0, 0, 0, 0);
  const end = new Date(wedding);
  end.setHours(23, 59, 59, 999);

  if (now.getTime() < start.getTime() - dayMs) return "pre_wedding";
  if (now.getTime() <= end.getTime() + dayMs) return "wedding_live";
  return "collecting";
}

export function adminStatusLabel(status: AftermovieStatus): string {
  return AFTERMOVIE_STATUS_LABELS[status] ?? "İçerikler Toplanıyor";
}

export function getAftermoviePlaybackPath(slug: string): string {
  return `/api/aftermovie/${encodeURIComponent(slug)}/playback`;
}

export function getAftermoviePosterPath(slug: string): string {
  return `/api/aftermovie/${encodeURIComponent(slug)}/poster`;
}
