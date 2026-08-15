import { getSiteBaseUrl } from "@/lib/site-url";
import { getTelegramConfig } from "./config";

export type TelegramInlineButton = {
  text: string;
  url?: string;
  callback_data?: string;
};

export type SendTelegramResult = {
  ok: boolean;
  messageId?: number;
  skipped?: boolean;
  error?: string;
};

type TelegramApiResponse = {
  ok?: boolean;
  description?: string;
  result?: { message_id?: number };
};

async function callTelegramApi(
  method: string,
  body: Record<string, unknown>
): Promise<{ ok: boolean; data?: TelegramApiResponse; error?: string }> {
  const config = getTelegramConfig();
  if (!config) {
    return { ok: false, error: "not_configured" };
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${config.token}/${method}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );
    const data = (await res.json().catch(() => ({}))) as TelegramApiResponse;
    if (!res.ok || !data.ok) {
      console.warn(`[telegram] ${method} failed`);
      return {
        ok: false,
        error: typeof data.description === "string" ? data.description : "api_error",
      };
    }
    return { ok: true, data };
  } catch (error) {
    console.warn(`[telegram] ${method} network error`);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "network_error",
    };
  }
}

export async function sendTelegramMessage(options: {
  text: string;
  chatId?: string;
  parseMode?: "HTML" | "Markdown";
  disablePreview?: boolean;
  replyMarkup?: { inline_keyboard: TelegramInlineButton[][] };
}): Promise<SendTelegramResult> {
  const config = getTelegramConfig();
  if (!config) return { ok: false, skipped: true, error: "not_configured" };

  const chatId = options.chatId ?? config.defaultChatId;
  const payload: Record<string, unknown> = {
    chat_id: chatId,
    text: options.text,
    disable_web_page_preview: options.disablePreview ?? true,
  };
  if (options.parseMode) payload.parse_mode = options.parseMode;
  if (options.replyMarkup) payload.reply_markup = options.replyMarkup;

  const result = await callTelegramApi("sendMessage", payload);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }
  return {
    ok: true,
    messageId: result.data?.result?.message_id,
  };
}

export async function editTelegramMessage(options: {
  chatId: string | number;
  messageId: number;
  text: string;
  parseMode?: "HTML";
  replyMarkup?: { inline_keyboard: TelegramInlineButton[][] };
}): Promise<SendTelegramResult> {
  const payload: Record<string, unknown> = {
    chat_id: options.chatId,
    message_id: options.messageId,
    text: options.text,
    disable_web_page_preview: true,
  };
  if (options.parseMode) payload.parse_mode = options.parseMode;
  if (options.replyMarkup) payload.reply_markup = options.replyMarkup;

  const result = await callTelegramApi("editMessageText", payload);
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, messageId: options.messageId };
}

export async function answerCallbackQuery(options: {
  callbackQueryId: string;
  text?: string;
  showAlert?: boolean;
}): Promise<void> {
  await callTelegramApi("answerCallbackQuery", {
    callback_query_id: options.callbackQueryId,
    text: options.text,
    show_alert: options.showAlert ?? false,
  });
}

export function adminOrdersUrl(orderId?: string): string {
  const base = getSiteBaseUrl();
  const url = `${base}/admin`;
  return orderId ? `${url}?tab=orders&order=${encodeURIComponent(orderId)}` : url;
}
