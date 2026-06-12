import type { Env } from "./config";
import { handleUpdate } from "./handlers";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (request.method !== "POST" || url.pathname !== "/webhook") {
      return new Response("Лютик на месте 🦝", { status: 200 });
    }

    if (request.headers.get("X-Telegram-Bot-Api-Secret-Token") !== env.TELEGRAM_WEBHOOK_SECRET) {
      return new Response("unauthorized", { status: 401 });
    }

    let update: unknown;
    try {
      update = await request.json();
    } catch {
      return new Response("ok"); // битый JSON — не даём Telegram ретраить
    }

    // Отвечаем Telegram сразу (<3 сек), тяжёлое — в фоне
    ctx.waitUntil(handleUpdate(update, env).catch((e) => console.error("waitUntil:", e)));
    return new Response("ok");
  },
} satisfies ExportedHandler<Env>;
