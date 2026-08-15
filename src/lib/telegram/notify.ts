/**
 * Backward-compatible Telegram helpers.
 * Prefer importing from @/lib/telegram/* going forward.
 */

export {
  notifyTelegramPaidOrder,
  formatPaidOrderTelegramMessage,
  sendTelegramError,
  sendOrderStatusNotification,
} from "./notifications";

export { isTelegramConfigured } from "./config";

import { sendTelegramMessage as sendMessage } from "./api";

/** Legacy plain-text sender used by older call sites. */
export async function sendTelegramMessage(text: string): Promise<boolean> {
  const result = await sendMessage({ text });
  return result.ok;
}
