import { createServiceRoleClient } from "@/lib/supabase/server";
import type { AftermovieMusic } from "./types";

function mapMusic(row: {
  id: string;
  title: string;
  artist: string | null;
  file_url: string;
  storage_key: string | null;
  duration_seconds: number | null;
  license_source: string | null;
  is_active: boolean;
}): AftermovieMusic {
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

/**
 * Single global music track for every MEMOORA AFTER film.
 * Never accepts couple-selected music.
 */
export async function getGlobalAftermovieMusic(): Promise<AftermovieMusic | null> {
  const envUrl = process.env.AFTERMOVIE_GLOBAL_MUSIC_URL?.trim();
  if (envUrl) {
    return {
      id: "env-global",
      title:
        process.env.AFTERMOVIE_GLOBAL_MUSIC_TITLE?.trim() ||
        "Memoora After Theme",
      artist: process.env.AFTERMOVIE_GLOBAL_MUSIC_ARTIST?.trim() || "Memoora",
      fileUrl: envUrl,
      storageKey: process.env.AFTERMOVIE_GLOBAL_MUSIC_STORAGE_KEY?.trim() || null,
      durationSeconds: process.env.AFTERMOVIE_GLOBAL_MUSIC_DURATION
        ? Number(process.env.AFTERMOVIE_GLOBAL_MUSIC_DURATION)
        : null,
      licenseSource:
        process.env.AFTERMOVIE_GLOBAL_MUSIC_LICENSE?.trim() ||
        "Memoora licensed",
      isActive: true,
    };
  }

  const client = createServiceRoleClient();

  try {
    // Prefer explicit global default when column exists
    const { data: globalRow, error: globalError } = await client
      .from("aftermovie_music")
      .select("*")
      .eq("is_active", true)
      .eq("is_global_default", true)
      .maybeSingle();

    if (!globalError && globalRow) {
      return mapMusic(globalRow as Parameters<typeof mapMusic>[0]);
    }
  } catch {
    /* is_global_default column may be missing before migration */
  }

  // Fallback: first active track
  const { data: fallback, error } = await client
    .from("aftermovie_music")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[global aftermovie music]", error);
    return null;
  }
  return fallback ? mapMusic(fallback as Parameters<typeof mapMusic>[0]) : null;
}
