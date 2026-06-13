import type { Env } from "./config";
import {
  eveningReminder,
  handleUpdate,
  morningBrief,
  processScheduledPosts,
  weeklyReview,
} from "./handlers";

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

  async scheduled(event: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    switch (event.cron) {
      case "0 2 * * *": // 07:00 Екб — утренний бриф
        ctx.waitUntil(morningBrief(env));
        break;
      case "30 16 * * *": // 21:30 Екб — напоминание об отчёте
        ctx.waitUntil(eveningReminder(env));
        break;
      case "0 14 * * 0": // 19:00 вс — недельный обзор
        ctx.waitUntil(weeklyReview(env));
        break;
      case "0 * * * *": // ежечасно — публикация отложенных постов
        ctx.waitUntil(processScheduledPosts(env));
        break;
      default:
        console.error("Неизвестный cron:", event.cron);
    }
  },
} satisfies ExportedHandler<Env>;
