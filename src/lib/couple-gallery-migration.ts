/** Detect Supabase schema errors that require couple gallery migrations. */
export function isCoupleGalleryMigrationError(message: string): boolean {
  const detail = message.toLowerCase();
  return (
    detail.includes('relation "public.couple_photos" does not exist') ||
    detail.includes("relation \"couple_photos\" does not exist") ||
    detail.includes("could not find the table 'public.couple_photos'") ||
    detail.includes("could not find the 'frame_zoom'") ||
    detail.includes("could not find the 'frame_pan_x'") ||
    detail.includes("could not find the 'frame_pan_y'") ||
    detail.includes("column couple_photos.frame_zoom") ||
    detail.includes("column couple_photos.frame_pan")
  );
}

export const COUPLE_GALLERY_MIGRATION_HINT =
  "Anılar veritabanı kurulumu tamamlanmamış. Supabase → SQL Editor'da supabase/migration-couple-gallery-complete.sql dosyasını çalıştırın, ardından sayfayı yenileyin.";

export function formatCoupleGalleryUploadError(message: string): string {
  if (isCoupleGalleryMigrationError(message)) {
    return COUPLE_GALLERY_MIGRATION_HINT;
  }
  return message;
}
