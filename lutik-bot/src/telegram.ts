import type { Env } from "./config";

const MAX_LEN = 4096;

const API = (env: Env, method: string) =>
  `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`;

async function call(env: Env, method: string, body: unknown): Promise<any> {
  const res = await fetch(API(env, method), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    console.error(`telegram ${method} failed:`, res.status, await res.text());
  }
  return res.json().catch(() => null);
}

export interface InlineButton {
  text: string;
  callback_data: string;
}

export async function sendMessage(
  env: Env,
  chatId: number,
  text: string,
  keyboard?: InlineButton[][],
): Promise<number | null> {
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text: text.length > MAX_LEN ? text.slice(0, MAX_LEN - 1) + "…" : text,
  };
  if (keyboard) body.reply_markup = { inline_keyboard: keyboard };
  const data = await call(env, "sendMessage", body);
  return data?.result?.message_id ?? null;
}

export async function answerCallback(env: Env, callbackId: string, text?: string): Promise<void> {
  await call(env, "answerCallbackQuery", { callback_query_id: callbackId, text });
}

/** Убрать кнопки у сообщения (после подтверждения/отмены) */
export async function clearKeyboard(env: Env, chatId: number, messageId: number): Promise<void> {
  await call(env, "editMessageReplyMarkup", { chat_id: chatId, message_id: messageId, reply_markup: { inline_keyboard: [] } });
}

/** getFile → скачать содержимое файла как ArrayBuffer */
export async function downloadFile(env: Env, fileId: string): Promise<ArrayBuffer> {
  const info = await call(env, "getFile", { file_id: fileId });
  const path = info?.result?.file_path;
  if (!path) throw new Error("getFile: нет file_path");
  const res = await fetch(`https://api.telegram.org/file/bot${env.TELEGRAM_BOT_TOKEN}/${path}`);
  if (!res.ok) throw new Error(`download file → ${res.status}`);
  return res.arrayBuffer();
}
