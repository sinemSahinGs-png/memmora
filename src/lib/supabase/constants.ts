export const MAX_COUPLE_GALLERY_PHOTOS = 20;

/** Images only — couple gallery uploads */
export const GALLERY_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const DEFAULT_MAX_UPLOAD_MB = 100;

/** Allowed MIME types for guest uploads (server + client). */
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/quicktime",
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export const ACCEPTED_MEDIA_TYPES = ALLOWED_MIME_TYPES.join(",");

/** @deprecated Supabase Storage — legacy media only */
export const STORAGE_BUCKET = "memories";

export const DEFAULT_TAGLINE =
  "Her mesaj ağaca yeni bir yaprak ekler. Fotoğraf ve videolar bu yaprağın içinde saklanır.";

export const DEFAULT_HERO_SUBTITLE = "Her not bir yaprak olur.";
export const DEFAULT_HERO_VIDEO = "/videos/living-tree-bg.mp4";
export const DEFAULT_INVITATION_MESSAGE =
  "Bu özel günde bizimle olmanızdan mutluluk duyarız.";

export const BRAND_NAME = "Memoora";
