import type { CouplePhoto } from "@/lib/types";
import type { DbCouplePhoto } from "@/lib/supabase/database.types";

import { clampFrameCrop } from "@/lib/memories-frame-crop";

export function mapCouplePhoto(row: DbCouplePhoto): CouplePhoto {
  const crop = clampFrameCrop({
    zoom: row.frame_zoom ?? 1,
    panX: row.frame_pan_x ?? 0,
    panY: row.frame_pan_y ?? 0,
  });
  return {
    id: row.id,
    coupleId: row.couple_id,
    caption: row.caption,
    sortOrder: row.sort_order,
    imageUrl: getCouplePhotoImageUrl(row.id, row.drive_file_id, row.image_url),
    filename: row.filename,
    mimeType: row.mime_type,
    driveFileId: row.drive_file_id,
    driveWebViewLink: row.drive_web_view_link,
    frameZoom: crop.zoom,
    framePanX: crop.panX,
    framePanY: crop.panY,
    isVisible: row.is_visible,
    createdAt: row.created_at,
  };
}

/** Proxy through our API so Drive images render in <img> tags. */
export function getCouplePhotoImageUrl(
  photoId: string,
  driveFileId: string | null | undefined,
  fallbackUrl: string
): string {
  if (driveFileId?.trim()) {
    return `/api/couple-photo-image?id=${photoId}`;
  }
  return fallbackUrl;
}
