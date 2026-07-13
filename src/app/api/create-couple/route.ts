import { NextResponse } from "next/server";
import {
  buildCoupleDisplayTitle,
  generateAdminPin,
  isValidEmail,
  normalizeEmail,
  resolveUniqueSlug,
  slugifyCoupleNames,
} from "@/lib/onboarding-utils";
import { packageDefaults } from "@/lib/pricing";
import {
  getSiteBaseUrl,
  resolveCoupleUrls,
} from "@/lib/site-url";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { createOrderRecord } from "@/lib/supabase/orders";
import {
  createCoupleFolder,
  getParentFolderId,
} from "@/lib/google/drive";
import { shareDriveFolderWithEmails } from "@/lib/google/drive-share";
import { DEFAULT_HERO_SUBTITLE, DEFAULT_HERO_VIDEO } from "@/lib/supabase/constants";
import type { CreateCoupleOrderInput, CreateCoupleResponse, PackageType } from "@/lib/types";

export const runtime = "nodejs";

const PACKAGE_TYPES: PackageType[] = ["basic", "premium", "luxury"];

function parseBody(body: unknown): CreateCoupleOrderInput | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;

  const packageType = String(b.package_type ?? "").trim() as PackageType;
  if (!PACKAGE_TYPES.includes(packageType)) return null;

  const customerName = String(b.customer_name ?? "").trim();
  const customerEmail = String(b.customer_email ?? "").trim();
  const brideName = String(b.bride_name ?? "").trim();
  const groomName = String(b.groom_name ?? "").trim();

  if (!customerName || !customerEmail || !brideName || !groomName) return null;
  if (!isValidEmail(customerEmail)) return null;

  const brideEmail = normalizeEmail(String(b.bride_email ?? ""));
  const groomEmail = normalizeEmail(String(b.groom_email ?? ""));
  if (brideEmail && !isValidEmail(brideEmail)) return null;
  if (groomEmail && !isValidEmail(groomEmail)) return null;

  const defaults = packageDefaults(packageType);

  return {
    customer_name: customerName,
    customer_email: customerEmail,
    customer_phone: String(b.customer_phone ?? "").trim() || undefined,
    package_type: packageType,
    bride_name: brideName,
    groom_name: groomName,
    wedding_date: String(b.wedding_date ?? "").trim() || undefined,
    bride_email: brideEmail ?? undefined,
    groom_email: groomEmail ?? undefined,
    playlist_title: String(b.playlist_title ?? "").trim() || undefined,
    playlist_artist: String(b.playlist_artist ?? "").trim() || undefined,
    playlist_url: String(b.playlist_url ?? "").trim() || undefined,
    media_upload_enabled:
      typeof b.media_upload_enabled === "boolean"
        ? b.media_upload_enabled
        : defaults.mediaUploadEnabled,
    quiz_enabled:
      typeof b.quiz_enabled === "boolean"
        ? b.quiz_enabled
        : defaults.quizEnabled,
    notes: String(b.notes ?? "").trim() || undefined,
  };
}

async function slugTaken(slug: string): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("couples")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  return Boolean(data);
}

export async function POST(request: Request) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
      return NextResponse.json(
        { success: false, error: "Sunucu yapılandırması eksik." },
        { status: 500 }
      );
    }

    const body = parseBody(await request.json());
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Geçersiz form verisi." },
        { status: 400 }
      );
    }

    const baseSlug = slugifyCoupleNames(body.groom_name, body.bride_name);
    const slug = await resolveUniqueSlug(baseSlug, slugTaken);
    const displayTitle = buildCoupleDisplayTitle(body.groom_name, body.bride_name);
    const adminPin = generateAdminPin();
    const supabase = createServiceRoleClient();

    const { data: coupleRow, error: coupleError } = await supabase
      .from("couples")
      .insert({
        slug,
        names: displayTitle,
        bride_name: body.bride_name,
        groom_name: body.groom_name,
        display_title: displayTitle,
        wedding_date: body.wedding_date || null,
        hero_subtitle: DEFAULT_HERO_SUBTITLE,
        hero_video_url: DEFAULT_HERO_VIDEO,
        admin_pin: adminPin,
        status: "active",
        package_type: body.package_type,
        bride_email: body.bride_email ?? null,
        groom_email: body.groom_email ?? null,
        playlist_title: body.playlist_title ?? null,
        playlist_artist: body.playlist_artist ?? null,
        playlist_url: body.playlist_url ?? null,
        media_upload_enabled: body.media_upload_enabled ?? true,
        quiz_enabled: body.quiz_enabled ?? true,
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (coupleError || !coupleRow) {
      return NextResponse.json(
        { success: false, error: coupleError?.message ?? "Çift oluşturulamadı." },
        { status: 500 }
      );
    }

    let driveFolderUrl: string | null = null;
    let driveFolderId: string | null = null;

    try {
      const parentFolderId = getParentFolderId();
      const folder = await createCoupleFolder(slug, parentFolderId);
      driveFolderId = folder.id;
      driveFolderUrl = folder.webViewLink;

      await supabase
        .from("couples")
        .update({
          drive_folder_id: driveFolderId,
          drive_folder_url: driveFolderUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", coupleRow.id);

      const shareEmails = [body.bride_email, body.groom_email].filter(Boolean) as string[];
      if (shareEmails.length > 0 && driveFolderId) {
        await shareDriveFolderWithEmails(driveFolderId, shareEmails);
      }
    } catch (driveError) {
      console.error("[create-couple] Drive folder error:", driveError);
    }

    const { id: orderId } = await createOrderRecord({
      customerName: body.customer_name,
      customerEmail: body.customer_email,
      customerPhone: body.customer_phone,
      packageType: body.package_type,
      coupleId: coupleRow.id,
      paymentStatus: "manual_pending",
    });

    await supabase
      .from("couples")
      .update({
        created_by_order_id: orderId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", coupleRow.id);

    const urls = resolveCoupleUrls(slug);

    const response: CreateCoupleResponse = {
      success: true,
      orderId,
      coupleId: coupleRow.id,
      slug,
      publicUrl: urls.publicUrl,
      adminUrl: urls.adminUrl,
      adminPin,
      driveFolderUrl,
      packageType: body.package_type,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[create-couple]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Beklenmeyen hata.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    siteUrl: getSiteBaseUrl(),
  });
}
