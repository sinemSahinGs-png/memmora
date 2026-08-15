/**
 * Setup Telegram webhook for Memoora ops bot.
 *
 * Usage:
 *   node scripts/setup-telegram-webhook.mjs
 *
 * Requires env:
 *   TELEGRAM_BOT_TOKEN
 *   NEXT_PUBLIC_SITE_URL   (e.g. https://memoora.com.tr)
 * Optional:
 *   TELEGRAM_WEBHOOK_SECRET
 *
 * Does not print the bot token.
 */

const token = (process.env.TELEGRAM_BOT_TOKEN || "").trim();
const site = (process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/+$/, "");
const secret = (process.env.TELEGRAM_WEBHOOK_SECRET || "").trim();

if (!token) {
  console.error("Missing TELEGRAM_BOT_TOKEN");
  process.exit(1);
}
if (!site) {
  console.error("Missing NEXT_PUBLIC_SITE_URL");
  process.exit(1);
}

const webhookUrl = `${site}/api/telegram/webhook`;

const body = {
  url: webhookUrl,
  allowed_updates: ["message", "callback_query"],
  drop_pending_updates: true,
  ...(secret ? { secret_token: secret } : {}),
};

const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const data = await res.json().catch(() => ({}));
if (!res.ok || !data.ok) {
  console.error("setWebhook failed:", data.description || res.status);
  process.exit(1);
}

console.log("Webhook set:", webhookUrl);
console.log("Secret token:", secret ? "yes" : "no");
