import type {
  CreateCoupleOrderInput,
  OrderRecord,
  OrderStatus,
  PackageType,
  PaymentStatus,
} from "@/lib/types";
import { createServiceRoleClient } from "./server";

interface DbOrderRow {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  package_type: string | null;
  price: number | null;
  payment_status: string | null;
  payment_provider: string | null;
  payment_reference: string | null;
  couple_id: string | null;
  status: string | null;
  created_at: string;
  updated_at: string | null;
  archived_at: string | null;
  deleted_at: string | null;
  couples?: {
    slug: string;
    display_title: string | null;
    names: string;
    drive_folder_url: string | null;
  } | null;
}

function mapOrder(row: DbOrderRow): OrderRecord {
  return {
    id: row.id,
    customerName: row.customer_name ?? "",
    customerEmail: row.customer_email ?? "",
    customerPhone: row.customer_phone ?? "",
    packageType: (row.package_type as PackageType | null) ?? null,
    price: row.price,
    paymentStatus: (row.payment_status as PaymentStatus) ?? "manual_pending",
    paymentProvider: row.payment_provider,
    paymentReference: row.payment_reference,
    coupleId: row.couple_id,
    status: (row.status as OrderStatus) ?? "active",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at,
    deletedAt: row.deleted_at,
    coupleSlug: row.couples?.slug ?? null,
    coupleDisplayTitle:
      row.couples?.display_title ?? row.couples?.names ?? null,
    driveFolderUrl: row.couples?.drive_folder_url ?? null,
  };
}

export async function createOrderRecord(input: {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  packageType: PackageType;
  coupleId: string;
  paymentStatus?: PaymentStatus;
}): Promise<{ id: string }> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("orders")
    .insert({
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      customer_phone: input.customerPhone ?? null,
      package_type: input.packageType,
      couple_id: input.coupleId,
      payment_status: input.paymentStatus ?? "manual_pending",
      status: "active",
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Sipariş kaydı oluşturulamadı.");
  }

  return { id: data.id };
}

export async function fetchOrderById(orderId: string): Promise<OrderRecord | null> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      couples ( slug, display_title, names, drive_folder_url )
    `
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error || !data) return null;
  return mapOrder(data as DbOrderRow);
}

export async function fetchAllOrders(): Promise<OrderRecord[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      couples ( slug, display_title, names, drive_folder_url )
    `
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapOrder(row as DbOrderRow));
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<void> {
  const supabase = createServiceRoleClient();
  const payload: {
    status: OrderStatus;
    updated_at: string;
    archived_at?: string;
  } = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (status === "archived") {
    payload.archived_at = new Date().toISOString();
  }

  const { error } = await supabase.from("orders").update(payload).eq("id", orderId);
  if (error) throw error;
}

export async function updateOrderPaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus
): Promise<void> {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("orders")
    .update({
      payment_status: paymentStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) throw error;
}

export type { CreateCoupleOrderInput };
