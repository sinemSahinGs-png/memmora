import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { resolveCoupleUrls } from "@/lib/site-url";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        package_type,
        payment_status,
        customer_name,
        couples (
          id,
          slug,
          display_title,
          names,
          admin_pin,
          drive_folder_url
        )
      `
      )
      .eq("id", orderId)
      .maybeSingle();

    if (error || !data?.couples) {
      return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
    }

    const couple = data.couples as {
      id: string;
      slug: string;
      display_title: string | null;
      names: string;
      admin_pin: string | null;
      drive_folder_url: string | null;
    };

    const urls = resolveCoupleUrls(couple.slug);

    return NextResponse.json({
      orderId: data.id,
      packageType: data.package_type,
      paymentStatus: data.payment_status,
      customerName: data.customer_name,
      slug: couple.slug,
      displayTitle: couple.display_title ?? couple.names,
      publicUrl: urls.publicUrl,
      adminUrl: urls.adminUrl,
      adminPin: couple.admin_pin,
      driveFolderUrl: couple.drive_folder_url,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Hata." },
      { status: 500 }
    );
  }
}
