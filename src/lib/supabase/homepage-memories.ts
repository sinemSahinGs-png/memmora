import {
  clampFrameCrop,
  DEFAULT_MEMORIES_FRAME_CROP,
  type MemoriesFrameCrop,
} from "@/lib/memories-frame-crop";
import type { DbHomepageSharedMemory, Database } from "@/lib/supabase/database.types";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { createSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";

export const HOMEPAGE_MEMORIES_BUCKET = "homepage-memories";

export interface HomepageSharedMemory {
  id: string;
  storagePath: string;
  publicUrl: string;
  guestName: string;
  category: string;
  title: string;
  sortOrder: number;
  frameZoom: number;
  framePanX: number;
  framePanY: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function mapHomepageMemory(
  row: DbHomepageSharedMemory,
): HomepageSharedMemory {
  return {
    id: row.id,
    storagePath: row.storage_path,
    publicUrl: row.public_url,
    guestName: row.guest_name ?? "",
    category: row.category ?? "",
    title: row.title ?? "",
    sortOrder: row.sort_order ?? 0,
    frameZoom: row.frame_zoom ?? 1,
    framePanX: row.frame_pan_x ?? 0,
    framePanY: row.frame_pan_y ?? 0,
    isActive: row.is_active ?? true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function homepageMemoryCrop(
  memory: Pick<HomepageSharedMemory, "frameZoom" | "framePanX" | "framePanY">,
): MemoriesFrameCrop {
  return clampFrameCrop({
    zoom: memory.frameZoom,
    panX: memory.framePanX,
    panY: memory.framePanY,
  });
}

/** Public landing fetch (anon). Falls back to empty on misconfig / missing table. */
export async function fetchActiveHomepageMemories(): Promise<HomepageSharedMemory[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from("homepage_shared_memories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error || !data) return [];
    return data.map(mapHomepageMemory);
  } catch {
    return [];
  }
}

export async function listHomepageMemoriesAdmin(): Promise<HomepageSharedMemory[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("homepage_shared_memories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapHomepageMemory);
}

export async function createHomepageMemory(input: {
  storagePath: string;
  publicUrl: string;
  guestName?: string;
  category?: string;
  title?: string;
  sortOrder?: number;
  crop?: MemoriesFrameCrop;
  isActive?: boolean;
}): Promise<HomepageSharedMemory> {
  const crop = clampFrameCrop(input.crop ?? DEFAULT_MEMORIES_FRAME_CROP);
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("homepage_shared_memories")
    .insert({
      storage_path: input.storagePath,
      public_url: input.publicUrl,
      guest_name: input.guestName?.trim() || "",
      category: input.category?.trim() || "",
      title: input.title?.trim() || "",
      sort_order: input.sortOrder ?? 0,
      frame_zoom: crop.zoom,
      frame_pan_x: crop.panX,
      frame_pan_y: crop.panY,
      is_active: input.isActive ?? true,
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Kayıt oluşturulamadı.");
  return mapHomepageMemory(data);
}

export async function updateHomepageMemory(
  id: string,
  patch: {
    guestName?: string;
    category?: string;
    title?: string;
    sortOrder?: number;
    crop?: MemoriesFrameCrop;
    isActive?: boolean;
  },
): Promise<HomepageSharedMemory> {
  const supabase = createServiceRoleClient();
  const update: Database["public"]["Tables"]["homepage_shared_memories"]["Update"] =
    {
      updated_at: new Date().toISOString(),
    };
  if (patch.guestName !== undefined) update.guest_name = patch.guestName.trim();
  if (patch.category !== undefined) update.category = patch.category.trim();
  if (patch.title !== undefined) update.title = patch.title.trim();
  if (patch.sortOrder !== undefined) update.sort_order = patch.sortOrder;
  if (patch.isActive !== undefined) update.is_active = patch.isActive;
  if (patch.crop) {
    const crop = clampFrameCrop(patch.crop);
    update.frame_zoom = crop.zoom;
    update.frame_pan_x = crop.panX;
    update.frame_pan_y = crop.panY;
  }

  const { data, error } = await supabase
    .from("homepage_shared_memories")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Güncelleme başarısız.");
  return mapHomepageMemory(data);
}

export async function deleteHomepageMemory(id: string): Promise<void> {
  const supabase = createServiceRoleClient();
  const { data: existing } = await supabase
    .from("homepage_shared_memories")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("homepage_shared_memories")
    .delete()
    .eq("id", id);
  if (error) throw error;

  if (existing?.storage_path) {
    await supabase.storage
      .from(HOMEPAGE_MEMORIES_BUCKET)
      .remove([existing.storage_path]);
  }
}

export function getHomepageMemoryPublicUrl(storagePath: string): string {
  const supabase = createServiceRoleClient();
  const { data } = supabase.storage
    .from(HOMEPAGE_MEMORIES_BUCKET)
    .getPublicUrl(storagePath);
  return data.publicUrl;
}
