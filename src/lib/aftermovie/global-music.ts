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
  const fallbackUrl = "/audio/memoora-after.mp3";
  const envUrl = process.env.AFTERMOVIE_GLOBAL_MUSIC_URL?.trim() || fallbackUrl;

  // Always prefer env / shipped file — never rely on missing seed placeholders alone.
  const envMusic: AftermovieMusic = {
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

  // If explicitly configured, use it.
  if (process.env.AFTERMOVIE_GLOBAL_MUSIC_URL?.trim()) {
    return envMusic;
  }

  const client = createServiceRoleClient();

  try {
    const { data: globalRow, error: globalError } = await client
      .from("aftermovie_music")
      .select("*")
      .eq("is_active", true)
      .eq("is_global_default", true)
      .maybeSingle();

    if (!globalError && globalRow) {
      const mapped = mapMusic(globalRow as Parameters<typeof mapMusic>[0]);
      if (
        mapped.fileUrl.includes("aftermovie-soft-emerald") ||
        mapped.fileUrl.includes("aftermovie-ivory-evening")
      ) {
        return { ...mapped, fileUrl: fallbackUrl };
      }
      return mapped;
    }
  } catch {
    /* is_global_default column may be missing before migration */
  }

  const { data: fallback, error } = await client
    .from("aftermovie_music")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[global aftermovie music]", error);
    return envMusic;
  }

  if (!fallback) return envMusic;

  const mapped = mapMusic(fallback as Parameters<typeof mapMusic>[0]);
  if (
    !mapped.fileUrl ||
    mapped.fileUrl.includes("aftermovie-soft-emerald") ||
    mapped.fileUrl.includes("aftermovie-ivory-evening")
  ) {
    return { ...mapped, fileUrl: fallbackUrl };
  }
  return mapped;
}
