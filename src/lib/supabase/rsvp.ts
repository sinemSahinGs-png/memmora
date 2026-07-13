import type { RsvpResponse, RsvpStats, RsvpStatus } from "@/lib/types";
import { createSupabaseClient, isSupabaseConfigured } from "./client";
import type { DbRsvpResponse } from "./database.types";

const RSVP_STATUSES: RsvpStatus[] = ["attending", "not_attending", "maybe"];

export function isValidRsvpStatus(value: string): value is RsvpStatus {
  return RSVP_STATUSES.includes(value as RsvpStatus);
}

function mapRsvpResponse(row: DbRsvpResponse): RsvpResponse {
  return {
    id: row.id,
    coupleId: row.couple_id,
    guestName: row.guest_name,
    phone: row.phone,
    status: row.status as RsvpStatus,
    guestCount: row.guest_count ?? 0,
    note: row.note,
    source: row.source ?? "invite",
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
  };
}

export function computeRsvpStats(rows: RsvpResponse[]): RsvpStats {
  let totalGuestCount = 0;
  let attendingCount = 0;
  let notAttendingCount = 0;
  let maybeCount = 0;

  for (const row of rows) {
    if (row.status === "attending") {
      attendingCount += 1;
      totalGuestCount += row.guestCount;
    } else if (row.status === "not_attending") {
      notAttendingCount += 1;
    } else if (row.status === "maybe") {
      maybeCount += 1;
    }
  }

  return {
    totalGuestCount,
    totalResponses: rows.length,
    attendingCount,
    notAttendingCount,
    maybeCount,
  };
}

export async function fetchRsvpResponses(
  coupleId: string
): Promise<RsvpResponse[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("rsvp_responses")
    .select("*")
    .eq("couple_id", coupleId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapRsvpResponse);
}

export async function fetchRsvpStats(coupleId: string): Promise<RsvpStats> {
  const rows = await fetchRsvpResponses(coupleId);
  return computeRsvpStats(rows);
}

export async function fetchRsvpGuestCountForCouple(
  coupleId: string
): Promise<number> {
  const stats = await fetchRsvpStats(coupleId);
  return stats.totalGuestCount;
}

export async function fetchRsvpResponseCountForCouple(
  coupleId: string
): Promise<number> {
  if (!isSupabaseConfigured()) return 0;

  const supabase = createSupabaseClient();
  const { count, error } = await supabase
    .from("rsvp_responses")
    .select("*", { count: "exact", head: true })
    .eq("couple_id", coupleId)
    .is("deleted_at", null);

  if (error) throw error;
  return count ?? 0;
}

export function rsvpStatusLabel(status: RsvpStatus): string {
  switch (status) {
    case "attending":
      return "Katılıyorum";
    case "not_attending":
      return "Katılamıyorum";
    case "maybe":
      return "Emin Değilim";
    default:
      return status;
  }
}

export const RSVP_SUCCESS_MESSAGES: Record<RsvpStatus, string> = {
  attending: "Yanıtınız alındı. Sizi aramızda görmek için sabırsızlanıyoruz.",
  not_attending: "Yanıtınız alındı. Güzel dilekleriniz bizimle.",
  maybe:
    "Yanıtınız alındı. Dilerseniz daha sonra tekrar güncelleyebilirsiniz.",
};
