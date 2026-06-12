import type { Env } from "./config";

const MAX_LEN = 4096;

export async function sendMessage(env: Env, chatId: number, text: string): Promise<void> {
  const body = {
    chat_id: chatId,
    text: text.length > MAX_LEN ? text.slice(0, MAX_LEN - 1) + "…" : text,
  };
  const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    console.error("telegram sendMessage failed:", res.status, await res.text());
  }
}
