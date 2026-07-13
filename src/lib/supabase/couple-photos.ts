import { createSupabaseClient } from "./client";
import type { DbCouplePhoto } from "./database.types";
import { mapCouplePhoto } from "@/lib/couple-photo-utils";
import type { CouplePhoto } from "@/lib/types";

export async function fetchCouplePhotos(coupleId: string): Promise<CouplePhoto[]> {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("couple_photos")
    .select("*")
    .eq("couple_id", coupleId)
    .eq("is_visible", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as DbCouplePhoto[]).map(mapCouplePhoto);
}

export async function fetchCouplePhotosForAdmin(
  coupleId: string
): Promise<CouplePhoto[]> {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("couple_photos")
    .select("*")
    .eq("couple_id", coupleId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as DbCouplePhoto[]).map(mapCouplePhoto);
}

export async function fetchCouplePhotoAdminCount(coupleId: string): Promise<number> {
  const supabase = createSupabaseClient();

  const { count, error } = await supabase
    .from("couple_photos")
    .select("*", { count: "exact", head: true })
    .eq("couple_id", coupleId);

  if (error) throw error;
  return count ?? 0;
}

export async function fetchCouplePhotoCount(coupleId: string): Promise<number> {
  const supabase = createSupabaseClient();

  const { count, error } = await supabase
    .from("couple_photos")
    .select("*", { count: "exact", head: true })
    .eq("couple_id", coupleId)
    .eq("is_visible", true);

  if (error) throw error;
  return count ?? 0;
}
