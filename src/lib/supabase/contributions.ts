import { createSupabaseClient, isSupabaseConfigured } from "./client";
import {
  COUPLE_NOT_FOUND_MESSAGE,
  isPlaceholderCoupleId,
} from "./couples";
import { formatSubmitError } from "./errors";
import { getMaxUploadMbLabel, validateUploadFiles } from "@/lib/upload-validation";
import { uploadFileToDriveApi } from "@/lib/upload-to-drive-client";
import type { ContributionWithMedia } from "./database.types";

export interface SubmitContributionInput {
  coupleId: string;
  coupleSlug: string;
  guestName: string;
  message: string;
  files: File[];
}

export type SubmitContributionResult =
  | { success: true; mediaWarning?: string }
  | { success: false; error: string };

export async function submitContribution(
  input: SubmitContributionInput
): Promise<SubmitContributionResult> {
  const fileValidation = validateUploadFiles(input.files);
  if (!fileValidation.ok) {
    return { success: false, error: fileValidation.error };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: formatSubmitError(
        "env",
        new Error(
          "NEXT_PUBLIC_SUPABASE_URL veya NEXT_PUBLIC_SUPABASE_ANON_KEY tanımlı değil."
        )
      ),
    };
  }

  let supabase;
  try {
    supabase = createSupabaseClient();
  } catch (error) {
    return { success: false, error: formatSubmitError("client", error) };
  }

  const coupleSlug = input.coupleSlug.trim();
  if (!coupleSlug || isPlaceholderCoupleId(input.coupleId)) {
    return { success: false, error: COUPLE_NOT_FOUND_MESSAGE };
  }

  const { data: coupleRow, error: coupleError } = await supabase
    .from("couples")
    .select("id, slug, media_upload_enabled, status")
    .eq("slug", coupleSlug)
    .is("deleted_at", null)
    .maybeSingle();

  if (coupleError) {
    return {
      success: false,
      error: formatSubmitError("couple_lookup", coupleError),
    };
  }

  if (!coupleRow) {
    return { success: false, error: COUPLE_NOT_FOUND_MESSAGE };
  }

  if (coupleRow.status === "passive" || coupleRow.status === "archived") {
    return {
      success: false,
      error: "Bu Memoora sayfası şu anda anı kabul etmiyor.",
    };
  }

  if (input.coupleId !== coupleRow.id) {
    console.warn("[Memoora submit] coupleId mismatch, using slug lookup", {
      clientCoupleId: input.coupleId,
      resolvedCoupleId: coupleRow.id,
      coupleSlug,
    });
  }

  const resolvedCoupleId = coupleRow.id;

  if (input.files.length > 0 && coupleRow.media_upload_enabled === false) {
    return {
      success: false,
      error: "Bu çift için medya yükleme şu an kapalı.",
    };
  }

  const { data: contribution, error: insertError } = await supabase
    .from("contributions")
    .insert({
      couple_id: resolvedCoupleId,
      guest_name: input.guestName,
      message: input.message,
      is_visible: true,
    })
    .select("id")
    .single();

  if (insertError || !contribution) {
    return {
      success: false,
      error: formatSubmitError(
        "contributions_insert",
        insertError ?? new Error("Kayıt oluşturulamadı")
      ),
    };
  }

  if (input.files.length === 0) {
    return { success: true };
  }

  const uploadErrors: string[] = [];

  for (const file of input.files) {
    try {
      await uploadFileToDriveApi(file, input.coupleSlug, contribution.id);
    } catch (error) {
      console.error("[Memoora submit] drive_upload", file.name, error);
      uploadErrors.push(
        error instanceof Error ? error.message : `"${file.name}" yüklenemedi.`
      );
    }
  }

  if (uploadErrors.length === input.files.length) {
    return {
      success: true,
      mediaWarning: `Mesajınız kaydedildi ancak medya yüklenemedi: ${uploadErrors[0]}`,
    };
  }

  if (uploadErrors.length > 0) {
    return {
      success: true,
      mediaWarning: `Mesajınız kaydedildi. Bazı dosyalar yüklenemedi (${uploadErrors.length}/${input.files.length}).`,
    };
  }

  return { success: true };
}

export async function fetchRecentContributions(
  coupleId: string,
  limit = 3
): Promise<ContributionWithMedia[]> {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("contributions")
    .select(
      `
      *,
      contribution_media (*)
    `
    )
    .eq("couple_id", coupleId)
    .eq("is_visible", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as ContributionWithMedia[];
}

export async function fetchContributionsWithMedia(
  coupleId: string
): Promise<ContributionWithMedia[]> {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("contributions")
    .select(
      `
      *,
      contribution_media (*)
    `
    )
    .eq("couple_id", coupleId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ContributionWithMedia[];
}

export async function hideContribution(contributionId: string): Promise<void> {
  const supabase = createSupabaseClient();

  const { error: mediaError } = await supabase
    .from("contribution_media")
    .update({ hidden: true })
    .eq("contribution_id", contributionId);

  if (mediaError) throw mediaError;

  const { error } = await supabase
    .from("contributions")
    .update({
      hidden: true,
      is_visible: false,
    })
    .eq("id", contributionId);

  if (error) throw error;
}

export async function permanentlyDeleteContribution(
  contributionId: string
): Promise<void> {
  const supabase = createSupabaseClient();

  const { error: mediaError } = await supabase
    .from("contribution_media")
    .delete()
    .eq("contribution_id", contributionId);

  if (mediaError) throw mediaError;

  const { error } = await supabase
    .from("contributions")
    .delete()
    .eq("id", contributionId);

  if (error) throw error;
}

/** @deprecated Prefer hideContribution or permanentlyDeleteContribution */
export async function deleteContribution(contributionId: string): Promise<void> {
  return hideContribution(contributionId);
}

export { getMaxUploadMbLabel };
