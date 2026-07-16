export const AFTERMOVIE_STATUSES = [
  "draft",
  "selecting",
  "submitted",
  "waiting_for_production",
  "queued",
  "rendering",
  "ready",
  "revision_requested",
  "scheduled",
  "published",
  "failed",
  "unpublished",
] as const;

export type AftermovieStatus = (typeof AFTERMOVIE_STATUSES)[number];

export function isAftermovieStatus(value: unknown): value is AftermovieStatus {
  return (
    typeof value === "string" &&
    (AFTERMOVIE_STATUSES as readonly string[]).includes(value)
  );
}

export type AftermovieDurationPreset = "short" | "standard" | "long";

export type CoupleLifecycleMode =
  | "pre_wedding"
  | "wedding_live"
  | "collecting"
  | "selecting"
  | "rendering"
  | "scheduled"
  | "post_wedding";

export type AftermovieMediaType = "photo" | "video";

export interface AftermovieMusic {
  id: string;
  title: string;
  artist: string | null;
  fileUrl: string;
  storageKey: string | null;
  durationSeconds: number | null;
  licenseSource: string | null;
  isActive: boolean;
}

export interface AftermovieMediaItem {
  id: string;
  aftermovieId: string;
  mediaId: string;
  mediaType: AftermovieMediaType;
  sortOrder: number;
  trimStartSeconds: number | null;
  trimEndSeconds: number | null;
  category: string | null;
  isPoster: boolean;
  guestName?: string | null;
  mimeType?: string | null;
  filename?: string | null;
  createdAt?: string | null;
  proxyUrl?: string | null;
}

export interface CoupleAftermovie {
  id: string;
  coupleId: string;
  status: AftermovieStatus;
  templateKey: string;
  title: string | null;
  openingText: string | null;
  closingText: string | null;
  posterMediaId: string | null;
  musicId: string | null;
  durationPreset: AftermovieDurationPreset;
  recommendedPublishAt: string | null;
  publishAt: string | null;
  approvedAt: string | null;
  publishedAt: string | null;
  submittedAt: string | null;
  revisionRequestedAt: string | null;
  revisionNote: string | null;
  revisionResolvedAt: string | null;
  productionNotes: string | null;
  finalVideoDurationSeconds: number | null;
  finalPosterUrl: string | null;
  finalPosterStorageKey: string | null;
  renderStartedAt: string | null;
  renderCompletedAt: string | null;
  finalVideoUrl: string | null;
  finalVideoStorageKey: string | null;
  renderProvider: string | null;
  renderJobId: string | null;
  renderError: string | null;
  createdAt: string;
  updatedAt: string;
  media?: AftermovieMediaItem[];
  music?: AftermovieMusic | null;
  posterProxyUrl?: string | null;
}

/** Safe subset for anonymous public clients when film is live. */
export type PublicCoupleAftermovie = Pick<
  CoupleAftermovie,
  | "id"
  | "coupleId"
  | "status"
  | "title"
  | "openingText"
  | "closingText"
  | "posterMediaId"
  | "durationPreset"
  | "publishAt"
  | "publishedAt"
  | "approvedAt"
  | "finalVideoUrl"
  | "finalPosterUrl"
  | "finalVideoDurationSeconds"
>;

export interface OrderedAftermovieMedia {
  mediaId: string;
  mediaType: AftermovieMediaType;
  sortOrder: number;
  category?: string | null;
  isPoster?: boolean;
  trimStartSeconds?: number | null;
  trimEndSeconds?: number | null;
  downloadUrl?: string;
}

export interface AftermovieRenderInput {
  aftermovieId: string;
  coupleId: string;
  media: OrderedAftermovieMedia[];
  music?: AftermovieMusic;
  title: string;
  weddingDate: string;
  openingText?: string;
  closingText?: string;
  durationPreset: AftermovieDurationPreset;
  posterUrl?: string;
}

export interface AftermovieRenderResult {
  jobId: string;
  provider: string;
  /** Manual provider signals no automatic final video. */
  awaitingManualProduction?: boolean;
}

export interface AftermovieRenderStatus {
  jobId: string;
  state: "queued" | "rendering" | "ready" | "failed" | "waiting_for_production";
  progress?: number;
  outputUrl?: string;
  error?: string;
}

export const AFTERMOVIE_PHOTO_MIN = 10;
export const AFTERMOVIE_PHOTO_RECOMMENDED = 28;
export const AFTERMOVIE_PHOTO_MAX = 50;
export const AFTERMOVIE_VIDEO_MAX = 15;

export const AFTERMOVIE_STATUS_LABELS: Record<AftermovieStatus, string> = {
  draft: "Taslak",
  selecting: "Anılar Seçiliyor",
  submitted: "Seçimler Gönderildi",
  waiting_for_production: "Film Hazırlanmayı Bekliyor",
  queued: "Sıraya Alındı",
  rendering: "Film Hazırlanıyor",
  ready: "Ön İzlemeye Hazır",
  revision_requested: "Düzenleme Talep Edildi",
  scheduled: "Yayın Planlandı",
  published: "Yayında",
  failed: "Hazırlanamadı",
  unpublished: "Yayından Kaldırıldı",
};

export const FORBIDDEN_MOCK_VIDEO_MARKERS = [
  "/videos/living-tree-bg.mp4",
  "living-tree-bg.mp4",
] as const;
