/** Telegram env + allowlist (server-only; never NEXT_PUBLIC). */

export type TelegramConfig = {
  token: string;
  defaultChatId: string;
  allowedChatIds: Set<string>;
  webhookSecret: string | null;
};

export function getTelegramConfig(): TelegramConfig | null {
  const token = (process.env.TELEGRAM_BOT_TOKEN ?? "").trim();
  const defaultChatId = (process.env.TELEGRAM_CHAT_ID ?? "").trim();
  if (!token || !defaultChatId) return null;

  const allowed = new Set<string>([defaultChatId]);
  const extra = (process.env.TELEGRAM_ALLOWED_CHAT_IDS ?? "").trim();
  if (extra) {
    for (const part of extra.split(",")) {
      const id = part.trim();
      if (id) allowed.add(id);
    }
  }

  const webhookSecret =
    (process.env.TELEGRAM_WEBHOOK_SECRET ?? "").trim() || null;

  return { token, defaultChatId, allowedChatIds: allowed, webhookSecret };
}

export function isTelegramConfigured(): boolean {
  return getTelegramConfig() !== null;
}

export function isAllowedTelegramChatId(chatId: string | number): boolean {
  const config = getTelegramConfig();
  if (!config) return false;
  return config.allowedChatIds.has(String(chatId));
}
