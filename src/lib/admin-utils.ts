import type { DbContributionMedia } from "@/lib/supabase/database.types";
import type { ContributionWithMedia } from "@/lib/supabase/database.types";
import { getMediaDownloadUrl, getMediaViewUrl } from "@/lib/admin-media-urls";

export type AdminContributionFilter = "all" | "with-media" | "message-only";

export interface MediaStats {
  total: number;
  photos: number;
  videos: number;
  totalBytes: number;
}

export function getMediaMimeType(media: DbContributionMedia): string {
  return media.mime_type ?? media.file_type ?? "";
}

/** Internal / super-admin only — exposes Drive URLs. */
export function getMediaOpenUrl(media: DbContributionMedia): string {
  const webView = media.drive_web_view_link?.trim();
  if (webView) return webView;

  const fileUrl = media.file_url?.trim();
  if (fileUrl) return fileUrl;

  const driveFileId = media.drive_file_id?.trim();
  if (driveFileId) {
    return `https://drive.google.com/file/d/${driveFileId}/view`;
  }

  return "";
}

export function getMediaProxyViewUrl(
  media: DbContributionMedia,
  coupleSlug: string
): string {
  return getMediaViewUrl(media.id, coupleSlug);
}

export function getMediaProxyDownloadUrl(
  media: DbContributionMedia,
  coupleSlug: string
): string {
  return getMediaDownloadUrl(media.id, coupleSlug);
}

export function getMediaFilename(media: DbContributionMedia): string {
  return media.filename ?? media.file_name ?? "dosya";
}

export function isPhotoMedia(media: DbContributionMedia): boolean {
  return getMediaMimeType(media).startsWith("image/");
}

export function isVideoMedia(media: DbContributionMedia): boolean {
  return getMediaMimeType(media).startsWith("video/");
}

export function countMediaItems(contributions: ContributionWithMedia[]): number {
  return computeMediaStats(contributions).total;
}

export function computeMediaStats(
  contributions: ContributionWithMedia[]
): MediaStats {
  let photos = 0;
  let videos = 0;
  let totalBytes = 0;

  for (const item of contributions) {
    for (const media of item.contribution_media ?? []) {
      if (isPhotoMedia(media)) photos += 1;
      else if (isVideoMedia(media)) videos += 1;
      if (media.file_size) totalBytes += Number(media.file_size);
    }
  }

  return {
    total: photos + videos,
    photos,
    videos,
    totalBytes,
  };
}

export function formatMediaSize(bytes: number): string {
  if (bytes <= 0) return "";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${Math.round(mb)} MB`;
  const kb = bytes / 1024;
  return `${Math.round(kb)} KB`;
}

export function filterContributions(
  contributions: ContributionWithMedia[],
  filter: AdminContributionFilter,
  searchQuery: string
): ContributionWithMedia[] {
  const query = searchQuery.trim().toLowerCase();

  return contributions.filter((item) => {
    const hasMedia = (item.contribution_media?.length ?? 0) > 0;

    if (filter === "with-media" && !hasMedia) return false;
    if (filter === "message-only" && hasMedia) return false;

    if (!query) return true;

    return (
      item.guest_name.toLowerCase().includes(query) ||
      item.message.toLowerCase().includes(query)
    );
  });
}

function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportContributionsCsv(
  contributions: ContributionWithMedia[],
  filename = "memoora-notlar.csv",
  options?: { includeDriveUrls?: boolean; coupleSlug?: string }
): void {
  const includeDriveUrls = options?.includeDriveUrls ?? false;
  const coupleSlug = options?.coupleSlug?.trim();

  const headers = includeDriveUrls
    ? [
        "guest_name",
        "message",
        "created_at",
        "media_count",
        "media_urls",
        "filenames",
        "mime_types",
      ]
    : ["guest_name", "message", "created_at", "media_count", "filenames", "mime_types"];

  const rows = contributions.map((item) => {
    const media = item.contribution_media ?? [];
    const base = [
      escapeCsvField(item.guest_name),
      escapeCsvField(item.message),
      escapeCsvField(item.created_at),
      escapeCsvField(String(media.length)),
    ];

    if (includeDriveUrls) {
      return [
        ...base,
        escapeCsvField(media.map(getMediaOpenUrl).join("; ")),
        escapeCsvField(media.map(getMediaFilename).join("; ")),
        escapeCsvField(media.map(getMediaMimeType).join("; ")),
      ];
    }

    return [
      ...base,
      escapeCsvField(media.map(getMediaFilename).join("; ")),
      escapeCsvField(media.map(getMediaMimeType).join("; ")),
    ];
  });

  const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  downloadCsvBlob(csv, filename);
}

export function exportMemoriesListCsv(
  contributions: ContributionWithMedia[],
  coupleSlug: string,
  filename = "memoora-ani-listesi.csv"
): void {
  const headers = [
    "misafir",
    "tarih",
    "medya_tipi",
    "dosya_adi",
    "indirme",
  ];

  const rows: string[][] = [];

  for (const item of contributions) {
    for (const media of item.contribution_media ?? []) {
      if (media.hidden || media.deleted_at) continue;
      const type = isPhotoMedia(media)
        ? "fotoğraf"
        : isVideoMedia(media)
          ? "video"
          : "medya";
      rows.push([
        escapeCsvField(item.guest_name),
        escapeCsvField(item.created_at),
        escapeCsvField(type),
        escapeCsvField(getMediaFilename(media)),
        escapeCsvField(getMediaProxyDownloadUrl(media, coupleSlug)),
      ]);
    }
  }

  const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  downloadCsvBlob(csv, filename);
}

function downloadCsvBlob(csv: string, filename: string): void {
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export interface QuizAttemptExportRow {
  participantName: string;
  score: number;
  totalQuestions: number;
  createdAt: string;
}

export function exportQuizAttemptsCsv(
  attempts: QuizAttemptExportRow[],
  filename = "memoora-quiz-sonuclari.csv"
): void {
  const headers = ["katilimci", "puan", "toplam_soru", "tarih"];
  const rows = attempts.map((item) => [
    escapeCsvField(item.participantName),
    escapeCsvField(String(item.score)),
    escapeCsvField(String(item.totalQuestions)),
    escapeCsvField(item.createdAt),
  ]);
  const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  downloadCsvBlob(csv, filename);
}

export interface RsvpExportRow {
  guestName: string;
  phone: string;
  status: string;
  guestCount: number;
  note: string;
  createdAt: string;
}

export function exportRsvpCsv(
  rows: RsvpExportRow[],
  filename = "memoora-katilim-listesi.csv"
): void {
  const headers = [
    "guest_name",
    "phone",
    "status",
    "guest_count",
    "note",
    "created_at",
  ];
  const csvRows = rows.map((item) => [
    escapeCsvField(item.guestName),
    escapeCsvField(item.phone),
    escapeCsvField(item.status),
    escapeCsvField(String(item.guestCount)),
    escapeCsvField(item.note),
    escapeCsvField(item.createdAt),
  ]);
  const csv = [headers.join(","), ...csvRows.map((row) => row.join(","))].join("\n");
  downloadCsvBlob(csv, filename);
}
