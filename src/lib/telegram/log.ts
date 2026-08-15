import {
  createServiceRoleClient,
  isServiceRoleConfigured,
} from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";

export async function claimNotificationSlot(options: {
  eventKey: string;
  eventType: string;
  orderId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<boolean> {
  if (!isServiceRoleConfigured()) {
    return true;
  }

  try {
    const admin = createServiceRoleClient();
    const { error } = await admin.from("memoora_notification_log").insert({
      channel: "telegram",
      event_type: options.eventType,
      event_key: options.eventKey,
      order_id: options.orderId ?? null,
      metadata: (options.metadata ?? {}) as Json,
    });

    if (!error) return true;

    const code = (error as { code?: string }).code;
    if (code === "23505") return false;

    console.warn("[telegram] notification_log insert failed");
    return true;
  } catch {
    console.warn("[telegram] notification_log unavailable");
    return true;
  }
}
