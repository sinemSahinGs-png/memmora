import {
  ALLOWED_MIME_TYPES,
  DEFAULT_MAX_UPLOAD_MB,
  GALLERY_IMAGE_MIME_TYPES,
} from "@/lib/supabase/constants";

export function getMaxUploadBytes(): number {
  const mb = Number(process.env.MAX_UPLOAD_MB);
  if (Number.isFinite(mb) && mb > 0) {
    return mb * 1024 * 1024;
  }
  return DEFAULT_MAX_UPLOAD_MB * 1024 * 1024;
}

export function getMaxUploadMbLabel(): number {
  return Math.round(getMaxUploadBytes() / (1024 * 1024));
}

export function isAllowedMimeType(mimeType: string): boolean {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType);
}

export function isAllowedGalleryImageMimeType(mimeType: string): boolean {
  return (GALLERY_IMAGE_MIME_TYPES as readonly string[]).includes(mimeType);
}

export function validateUploadFiles(
  files: File[]
): { ok: true } | { ok: false; error: string } {
  const maxBytes = getMaxUploadBytes();
  const maxMb = getMaxUploadMbLabel();

  for (const file of files) {
    if (file.size > maxBytes) {
      return {
        ok: false,
        error: `"${file.name}" ${maxMb}MB sınırını aşıyor.`,
      };
    }
    if (!isAllowedMimeType(file.type)) {
      return {
        ok: false,
        error: `"${file.name}" desteklenmiyor. JPEG, PNG, WebP, MP4 veya MOV yükleyin.`,
      };
    }
  }

  return { ok: true };
}
