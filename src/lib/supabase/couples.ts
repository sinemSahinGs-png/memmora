import type {
  Couple,
  CoupleCreateInput,
  CoupleListItem,
  CoupleSettingsInput,
  CoupleStatus,
} from "@/lib/types";
import { getMockCoupleBySlug } from "@/lib/mock-data";
import { createSupabaseClient, isSupabaseConfigured } from "./client";
import {
  BRAND_NAME,
  DEFAULT_HERO_SUBTITLE,
  DEFAULT_HERO_VIDEO,
  DEFAULT_INVITATION_MESSAGE,
} from "./constants";
import type { DbCouple } from "./database.types";
import { fetchRsvpStats } from "./rsvp";

export { DEFAULT_INVITATION_MESSAGE };

/** Placeholder IDs from local mock data — never valid in Supabase. */
const PLACEHOLDER_COUPLE_ID =
  /^00000000-0000-0000-0000-00000000000[0-9a-f]$/i;

export function isPlaceholderCoupleId(id: string): boolean {
  return PLACEHOLDER_COUPLE_ID.test(id);
}

export const COUPLE_NOT_FOUND_MESSAGE =
  "Çift kaydı bulunamadı. Lütfen sayfa bağlantısını kontrol edin.";

interface MapCoupleOptions {
  includeAdminPin?: boolean;
}

function mapCouple(
  row: DbCouple,
  leafCount = 0,
  options?: MapCoupleOptions
): Couple {
  const heroSubtitle = row.hero_subtitle ?? DEFAULT_HERO_SUBTITLE;
  return {
    id: row.id,
    slug: row.slug,
    names: row.names,
    brideName: row.bride_name ?? "",
    groomName: row.groom_name ?? "",
    displayTitle: row.display_title ?? row.names,
    brandName: BRAND_NAME,
    weddingDate: row.wedding_date ?? "",
    heroSubtitle,
    heroVideoUrl: row.hero_video_url ?? DEFAULT_HERO_VIDEO,
    quizEnabled: row.quiz_enabled ?? true,
    quizWinnerName: row.quiz_winner_name,
    playlistTitle: row.playlist_title ?? "",
    playlistArtist: row.playlist_artist ?? "",
    playlistUrl: row.playlist_url ?? "",
    status: (row.status as Couple["status"]) ?? "active",
    packageType:
      ((row as DbCouple & { package_type?: string | null }).package_type as Couple["packageType"]) ??
      null,
    leafCount,
    brideEmail: row.bride_email ?? "",
    groomEmail: row.groom_email ?? "",
    driveFolderUrl: row.drive_folder_url ?? "",
    mediaUploadEnabled: row.media_upload_enabled ?? true,
    memoriesGalleryEnabled:
      (row as DbCouple & { memories_gallery_enabled?: boolean | null })
        .memories_gallery_enabled ?? true,
    couplePhotoUrl: (row as DbCouple & { couple_photo_url?: string | null }).couple_photo_url ?? "",
    adminPin: options?.includeAdminPin ? row.admin_pin ?? undefined : undefined,
    driveFolderId: options?.includeAdminPin ? row.drive_folder_id ?? undefined : undefined,
    createdAt: row.created_at,
    createdByOrderId: (row as DbCouple & { created_by_order_id?: string | null }).created_by_order_id ?? null,
    deletedAt: (row as DbCouple & { deleted_at?: string | null }).deleted_at ?? null,
    archivedAt: (row as DbCouple & { archived_at?: string | null }).archived_at ?? null,
    invitationEnabled: row.invitation_enabled ?? true,
    invitationTitle: row.invitation_title ?? "",
    invitationMessage: row.invitation_message ?? DEFAULT_INVITATION_MESSAGE,
    venueName: row.venue_name ?? "",
    venueAddress: row.venue_address ?? "",
    venueMapsUrl: row.venue_maps_url ?? "",
    weddingTime: row.wedding_time ?? "",
    rsvpEnabled: row.rsvp_enabled ?? true,
    rsvpDeadline: row.rsvp_deadline ?? "",
    maxGuestCount: row.max_guest_count ?? 5,
    tagline: heroSubtitle,
  };
}

async function fetchLeafCountForCouple(coupleId: string): Promise<number> {
  const supabase = createSupabaseClient();
  const { count, error } = await supabase
    .from("contributions")
    .select("*", { count: "exact", head: true })
    .eq("couple_id", coupleId);
  if (error) throw error;
  return count ?? 0;
}

async function fetchMediaCountForCouple(coupleId: string): Promise<number> {
  const supabase = createSupabaseClient();
  const { data: contributions, error: contribError } = await supabase
    .from("contributions")
    .select("id")
    .eq("couple_id", coupleId);

  if (contribError) throw contribError;
  if (!contributions?.length) return 0;

  const ids = contributions.map((c) => c.id);
  const { count, error } = await supabase
    .from("contribution_media")
    .select("*", { count: "exact", head: true })
    .in("contribution_id", ids);

  if (error) throw error;
  return count ?? 0;
}

export async function fetchCoupleBySlug(slug: string): Promise<Couple | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("couples")
    .select("*")
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) return null;

  const leafCount = await fetchLeafCountForCouple(data.id);
  return mapCouple(data, leafCount);
}

export async function resolveCoupleForPage(slug: string): Promise<Couple | null> {
  if (isSupabaseConfigured()) {
    return fetchCoupleBySlug(slug);
  }
  return getMockCoupleBySlug(slug) ?? null;
}

export async function resolveCoupleAdminForPage(
  slug: string
): Promise<Couple | null> {
  if (isSupabaseConfigured()) {
    return fetchCoupleAdminBySlug(slug);
  }
  return getMockCoupleBySlug(slug) ?? null;
}

export async function fetchCoupleAdminBySlug(slug: string): Promise<Couple | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("couples")
    .select("*")
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) return null;

  const leafCount = await fetchLeafCountForCouple(data.id);
  return mapCouple(data, leafCount, { includeAdminPin: true });
}

export async function fetchLeafCount(coupleId: string): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  return fetchLeafCountForCouple(coupleId);
}

export async function slugExists(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const supabase = createSupabaseClient();
  let query = supabase.from("couples").select("id").eq("slug", slug.trim());
  if (excludeId) query = query.neq("id", excludeId);

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function fetchAllCouplesList(): Promise<CoupleListItem[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("couples")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!data?.length) return [];

  const items = await Promise.all(
    data.map(async (row) => {
      const [leafCount, mediaCount, rsvpStats] = await Promise.all([
        fetchLeafCountForCouple(row.id),
        fetchMediaCountForCouple(row.id),
        fetchRsvpStats(row.id).catch(() => ({
          totalGuestCount: 0,
          totalResponses: 0,
          attendingCount: 0,
          notAttendingCount: 0,
          maybeCount: 0,
        })),
      ]);
      return {
        id: row.id,
        slug: row.slug,
        displayTitle: row.display_title ?? row.names,
        names: row.names,
        weddingDate: row.wedding_date ?? "",
        leafCount,
        mediaCount,
        quizEnabled: row.quiz_enabled ?? true,
        status: (row.status as CoupleStatus) ?? "active",
        packageType: ((row as DbCouple & { package_type?: string | null }).package_type as CoupleListItem["packageType"]) ?? null,
        createdAt: row.created_at,
        driveFolderUrl: row.drive_folder_url ?? "",
        rsvpGuestCount: rsvpStats.totalGuestCount,
        rsvpResponseCount: rsvpStats.totalResponses,
        invitationEnabled: row.invitation_enabled ?? true,
      } satisfies CoupleListItem;
    })
  );

  return items;
}

export async function fetchCoupleById(
  coupleId: string,
  options?: MapCoupleOptions
): Promise<Couple | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("couples")
    .select("*")
    .eq("id", coupleId)
    .maybeSingle();

  if (error || !data) return null;
  const leafCount = await fetchLeafCountForCouple(data.id);
  return mapCouple(data, leafCount, options);
}

function buildNames(input: {
  displayTitle: string;
  groomName: string;
  brideName: string;
}): string {
  return (
    input.displayTitle.trim() ||
    `${input.groomName.trim()} & ${input.brideName.trim()}`
  );
}

function couplePayloadFromCreate(input: CoupleCreateInput) {
  const names = buildNames(input);
  return {
    slug: input.slug.trim(),
    names,
    bride_name: input.brideName.trim() || null,
    groom_name: input.groomName.trim() || null,
    display_title: input.displayTitle.trim() || names,
    wedding_date: input.weddingDate || null,
    hero_subtitle: input.heroSubtitle.trim() || DEFAULT_HERO_SUBTITLE,
    hero_video_url: input.heroVideoUrl.trim() || DEFAULT_HERO_VIDEO,
    admin_pin: input.adminPin.trim() || null,
    quiz_enabled: input.quizEnabled,
    playlist_title: input.playlistTitle.trim() || null,
    playlist_artist: input.playlistArtist.trim() || null,
    playlist_url: input.playlistUrl.trim() || null,
    bride_email: input.brideEmail?.trim() || null,
    groom_email: input.groomEmail?.trim() || null,
    status: input.status,
    updated_at: new Date().toISOString(),
  };
}

export async function createCouple(
  input: CoupleCreateInput
): Promise<{ success: true; couple: Couple } | { success: false; error: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase yapılandırılmamış." };
  }

  const slug = input.slug.trim();
  if (!slug) return { success: false, error: "Slug boş olamaz." };

  if (await slugExists(slug)) {
    return { success: false, error: `Bu slug zaten kullanılıyor: ${slug}` };
  }

  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("couples")
    .insert(couplePayloadFromCreate(input))
    .select("*")
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Çift oluşturulamadı." };
  }

  return { success: true, couple: mapCouple(data, 0, { includeAdminPin: true }) };
}

export async function updateCoupleById(
  coupleId: string,
  input: CoupleCreateInput
): Promise<{ success: true; couple: Couple } | { success: false; error: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase yapılandırılmamış." };
  }

  const slug = input.slug.trim();
  if (!slug) return { success: false, error: "Slug boş olamaz." };

  if (await slugExists(slug, coupleId)) {
    return { success: false, error: `Bu slug zaten kullanılıyor: ${slug}` };
  }

  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("couples")
    .update(couplePayloadFromCreate(input))
    .eq("id", coupleId)
    .select("*")
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Çift güncellenemedi." };
  }

  const leafCount = await fetchLeafCountForCouple(coupleId);
  return {
    success: true,
    couple: mapCouple(data, leafCount, { includeAdminPin: true }),
  };
}

export async function setCoupleStatus(
  coupleId: string,
  status: CoupleStatus
): Promise<{ success: true } | { success: false; error: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase yapılandırılmamış." };
  }

  const supabase = createSupabaseClient();
  const payload: {
    status: CoupleStatus;
    updated_at: string;
    archived_at?: string;
  } = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (status === "archived") {
    payload.archived_at = new Date().toISOString();
  }

  const { error } = await supabase.from("couples").update(payload).eq("id", coupleId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteCouple(
  coupleId: string
): Promise<{ success: true } | { success: false; error: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase yapılandırılmamış." };
  }

  const supabase = createSupabaseClient();
  const { error } = await supabase.from("couples").delete().eq("id", coupleId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function updateCoupleSettings(
  coupleId: string,
  input: CoupleSettingsInput
): Promise<{ success: true; couple: Couple } | { success: false; error: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase yapılandırılmamış." };
  }

  const supabase = createSupabaseClient();
  const names = buildNames(input);

  const { data, error } = await supabase
    .from("couples")
    .update({
      slug: input.slug.trim(),
      names,
      bride_name: input.brideName.trim() || null,
      groom_name: input.groomName.trim() || null,
      display_title: input.displayTitle.trim() || names,
      wedding_date: input.weddingDate || null,
      hero_subtitle: input.heroSubtitle.trim() || DEFAULT_HERO_SUBTITLE,
      hero_video_url: input.heroVideoUrl.trim() || DEFAULT_HERO_VIDEO,
      quiz_enabled: input.quizEnabled,
      quiz_winner_name: input.quizWinnerName.trim() || null,
      playlist_title: input.playlistTitle.trim() || null,
      playlist_artist: input.playlistArtist.trim() || null,
      playlist_url: input.playlistUrl.trim() || null,
      bride_email: input.brideEmail.trim() || null,
      groom_email: input.groomEmail.trim() || null,
      media_upload_enabled: input.mediaUploadEnabled,
      couple_photo_url: input.couplePhotoUrl.trim() || null,
      admin_pin: input.adminPin.trim() || null,
      status: input.status,
      invitation_enabled: input.invitationEnabled,
      invitation_title: input.invitationTitle.trim() || null,
      invitation_message: input.invitationMessage.trim() || DEFAULT_INVITATION_MESSAGE,
      venue_name: input.venueName.trim() || null,
      venue_address: input.venueAddress.trim() || null,
      venue_maps_url: input.venueMapsUrl.trim() || null,
      wedding_time: input.weddingTime.trim() || null,
      rsvp_enabled: input.rsvpEnabled,
      rsvp_deadline: input.rsvpDeadline || null,
      max_guest_count: input.maxGuestCount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", coupleId)
    .select("*")
    .single();

  if (error || !data) {
    return {
      success: false,
      error: error?.message ?? "Ayarlar kaydedilemedi.",
    };
  }

  const leafCount = await fetchLeafCountForCouple(coupleId);
  return {
    success: true,
    couple: mapCouple(data, leafCount, { includeAdminPin: true }),
  };
}

export async function updateMemoriesGalleryEnabled(
  coupleId: string,
  enabled: boolean
): Promise<{ success: true; couple: Couple } | { success: false; error: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase yapılandırılmamış." };
  }

  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("couples")
    .update({
      memories_gallery_enabled: enabled,
      updated_at: new Date().toISOString(),
    })
    .eq("id", coupleId)
    .select("*")
    .single();

  if (error || !data) {
    return {
      success: false,
      error: error?.message ?? "Galeri ayarı kaydedilemedi.",
    };
  }

  const leafCount = await fetchLeafCountForCouple(coupleId);
  return {
    success: true,
    couple: mapCouple(data, leafCount, { includeAdminPin: true }),
  };
}
