import { createServiceRoleClient, isServiceRoleConfigured } from "@/lib/supabase/server";
import { calculatePurchaseTotals, PURCHASE_PRODUCTS } from "./pricing";
import type {
  CreateMemooraOrderInput,
  MemooraOrderPaymentStatus,
  MemooraOrderRecord,
  MemooraOrderStatus,
} from "./types";

interface DbOrderRow {
  id: string;
  bride_name: string;
  groom_name: string;
  wedding_date: string;
  subtotal: number;
  vat: number;
  total: number;
  vat_rate: number;
  payment_status: string;
  order_status: string;
  payment_provider: string | null;
  payment_reference: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_name: string | null;
  created_at: string;
  updated_at: string;
}

interface DbItemRow {
  id: string;
  product_type: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  line_subtotal: number;
  line_vat: number;
  line_total: number;
}

function mapOrder(
  row: DbOrderRow,
  items: DbItemRow[],
): MemooraOrderRecord {
  return {
    id: row.id,
    brideName: row.bride_name,
    groomName: row.groom_name,
    weddingDate: row.wedding_date,
    subtotal: Number(row.subtotal),
    vat: Number(row.vat),
    total: Number(row.total),
    vatRate: Number(row.vat_rate),
    paymentStatus: row.payment_status as MemooraOrderPaymentStatus,
    orderStatus: row.order_status as MemooraOrderStatus,
    paymentProvider: row.payment_provider,
    paymentReference: row.payment_reference,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    customerName: row.customer_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items: items.map((item) => ({
      id: item.id,
      productType: item.product_type as MemooraOrderRecord["items"][number]["productType"],
      productName: item.product_name,
      quantity: item.quantity,
      unitPrice: Number(item.unit_price),
      lineSubtotal: Number(item.line_subtotal),
      lineVat: Number(item.line_vat),
      lineTotal: Number(item.line_total),
    })),
  };
}

export async function createMemooraOrder(
  input: CreateMemooraOrderInput,
  opts?: {
    paymentStatus?: MemooraOrderPaymentStatus;
    orderStatus?: MemooraOrderStatus;
    paymentProvider?: string | null;
  },
): Promise<MemooraOrderRecord> {
  if (!isServiceRoleConfigured()) {
    throw new Error(
      "Supabase yapılandırması eksik. NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli.",
    );
  }

  const totals = calculatePurchaseTotals(input.items);
  const supabase = createServiceRoleClient();
  const now = new Date().toISOString();

  const { data: order, error } = await supabase
    .from("memoora_orders")
    .insert({
      bride_name: input.brideName,
      groom_name: input.groomName,
      wedding_date: input.weddingDate,
      subtotal: totals.subtotal,
      vat: totals.vat,
      total: totals.total,
      vat_rate: totals.vatRate,
      payment_status: opts?.paymentStatus ?? "awaiting_payment",
      order_status: opts?.orderStatus ?? "pending_payment",
      payment_provider: opts?.paymentProvider ?? null,
      customer_email: input.customerEmail ?? null,
      customer_phone: input.customerPhone ?? null,
      customer_name:
        input.customerName ?? `${input.brideName} & ${input.groomName}`,
      updated_at: now,
    })
    .select("*")
    .single();

  if (error || !order) {
    throw new Error(error?.message ?? "Sipariş oluşturulamadı.");
  }

  const itemRows = totals.lines.map((line) => ({
    order_id: order.id,
    product_type: line.productType,
    product_name: PURCHASE_PRODUCTS[line.productType].name,
    quantity: line.quantity,
    unit_price: line.unitPrice,
    line_subtotal: line.lineSubtotal,
    line_vat: line.lineVat,
    line_total: line.lineTotal,
  }));

  const { data: items, error: itemsError } = await supabase
    .from("memoora_order_items")
    .insert(itemRows)
    .select("*");

  if (itemsError) {
    throw new Error(itemsError.message);
  }

  return mapOrder(order as DbOrderRow, (items ?? []) as DbItemRow[]);
}

export async function fetchMemooraOrderById(
  orderId: string,
): Promise<MemooraOrderRecord | null> {
  if (!isServiceRoleConfigured()) return null;

  const supabase = createServiceRoleClient();
  const { data: order, error } = await supabase
    .from("memoora_orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) return null;

  const { data: items } = await supabase
    .from("memoora_order_items")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  return mapOrder(order as DbOrderRow, (items ?? []) as DbItemRow[]);
}

export async function updateMemooraOrderPayment(
  orderId: string,
  patch: {
    paymentStatus: MemooraOrderPaymentStatus;
    orderStatus?: MemooraOrderStatus;
    paymentProvider?: string | null;
    paymentReference?: string | null;
  },
): Promise<void> {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("memoora_orders")
    .update({
      payment_status: patch.paymentStatus,
      order_status: patch.orderStatus,
      payment_provider: patch.paymentProvider,
      payment_reference: patch.paymentReference,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) throw error;
}
