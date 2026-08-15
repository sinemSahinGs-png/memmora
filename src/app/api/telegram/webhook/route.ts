import { NextResponse } from "next/server";
import {
  getTelegramConfig,
  isAllowedTelegramChatId,
} from "@/lib/telegram/config";
import { answerCallbackQuery, sendTelegramMessage } from "@/lib/telegram/api";
import {
  applyMemooraOrderStatusChange,
  handleTelegramCommand,
  isTelegramStatusAction,
} from "@/lib/telegram/ops";
import { claimNotificationSlot } from "@/lib/telegram/log";
import { ORDER_STATUS_LABELS } from "@/lib/telegram/format";

export const runtime = "nodejs";

type TelegramUpdate = {
  update_id?: number;
  message?: {
    message_id?: number;
    text?: string;
    chat?: { id?: number };
    from?: { id?: number };
  };
  callback_query?: {
    id: string;
    data?: string;
    from?: { id?: number };
    message?: {
      message_id?: number;
      chat?: { id?: number };
      text?: string;
    };
  };
};

function unauthorized() {
  return NextResponse.json({ ok: false }, { status: 401 });
}

function verifyWebhookSecret(req: Request): boolean {
  const config = getTelegramConfig();
  if (!config) return false;
  if (!config.webhookSecret) return true;
  const header = req.headers.get("x-telegram-bot-api-secret-token");
  return Boolean(header && header === config.webhookSecret);
}

export async function POST(req: Request) {
  if (!getTelegramConfig()) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  if (!verifyWebhookSecret(req)) {
    return unauthorized();
  }

  let update: TelegramUpdate;
  try {
    update = (await req.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const updateId = update.update_id;
  if (typeof updateId === "number") {
    const claimed = await claimNotificationSlot({
      eventKey: `telegram:update:${updateId}`,
      eventType: "webhook_update",
    });
    if (!claimed) {
      return NextResponse.json({ ok: true, duplicate: true });
    }
  }

  try {
    if (update.callback_query) {
      await handleCallback(update.callback_query);
    } else if (update.message?.text && update.message.chat?.id != null) {
      const chatId = update.message.chat.id;
      if (!isAllowedTelegramChatId(chatId)) {
        await sendTelegramMessage({
          chatId: String(chatId),
          text: "Yetkisiz.",
        });
      } else {
        await handleTelegramCommand(chatId, update.message.text);
      }
    }
  } catch (error) {
    console.warn(
      "[telegram] webhook handler error",
      error instanceof Error ? error.message : "unknown",
    );
  }

  return NextResponse.json({ ok: true });
}

async function handleCallback(
  query: NonNullable<TelegramUpdate["callback_query"]>,
): Promise<void> {
  const fromId = query.from?.id;

  if (fromId == null || !isAllowedTelegramChatId(fromId)) {
    await answerCallbackQuery({
      callbackQueryId: query.id,
      text: "Yetkisiz",
      showAlert: true,
    });
    return;
  }

  const data = (query.data ?? "").trim();
  const match = /^ord:(confirmed|fulfilled|cancelled):([0-9a-f-]{36})$/i.exec(
    data,
  );
  if (!match) {
    await answerCallbackQuery({
      callbackQueryId: query.id,
      text: "Geçersiz işlem",
    });
    return;
  }

  const status = match[1].toLowerCase();
  const orderId = match[2];
  if (!isTelegramStatusAction(status)) {
    await answerCallbackQuery({
      callbackQueryId: query.id,
      text: "Desteklenmeyen durum",
    });
    return;
  }

  const result = await applyMemooraOrderStatusChange(orderId, status);
  if (!result) {
    await answerCallbackQuery({
      callbackQueryId: query.id,
      text: "Sipariş bulunamadı",
      showAlert: true,
    });
    return;
  }

  const label =
    ORDER_STATUS_LABELS[result.order.orderStatus] ?? result.order.orderStatus;

  await answerCallbackQuery({
    callbackQueryId: query.id,
    text: result.changed ? `Durum: ${label}` : `Zaten ${label}`,
  });
}
