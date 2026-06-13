import { classify, matchReport, transcribeAudio, type BrainResult, type BrainTask } from "./brain";
import { CHANNEL_ID, OWNER_CHAT_ID, type Env } from "./config";
import { isoWeekLabel, isPlannedDay, todayISO, todayLabel, tomorrowISO } from "./dates";
import {
  createContentIdea,
  createLead,
  createNote,
  createTask,
  dropTask,
  habitStreaks,
  logHabit,
  markTaskDone,
  queryActiveHabits,
  queryLeads,
  queryOpenTodayTasks,
  queryTodayTasks,
  queryWeekTasks,
  rescheduleTaskToDate,
  staleLeads,
  upsertWeeklyMetrics,
  type Habit,
  type Task,
} from "./notion";
import { answerCallback, clearKeyboard, downloadFile, sendMessage, type InlineButton } from "./telegram";

const PENDING_KEY = `pending:${OWNER_CHAT_ID}`;
const DIALOG_KEY = `dialog:${OWNER_CHAT_ID}`;
const KV_TTL = 86_400; // 24 часа
const DEDUP_TTL = 600; // 10 минут
const POST_TTL = 3_600; // 1 час на подтверждение поста

const VOICE_MAX_SEC = 60;
const VOICE_MAX_BYTES = 4 * 1024 * 1024;

const PRIORITY_EMOJI: Record<string, string> = { "Высокий": "🔴", "Средний": "🟡", "Низкий": "🟢" };
const PRIORITY_ORDER: Record<string, number> = { "Высокий": 0, "Средний": 1, "Низкий": 2 };

// ---------- входная точка ----------

export async function handleUpdate(update: any, env: Env): Promise<void> {
  // Дедупликация ретраев Telegram (A3)
  const updateId = update?.update_id;
  if (updateId != null && env.LUTIK_CONTEXT) {
    const key = `processed:${updateId}`;
    if (await env.LUTIK_CONTEXT.get(key)) return;
    await env.LUTIK_CONTEXT.put(key, "1", { expirationTtl: DEDUP_TTL });
  }

  if (update?.callback_query) {
    await handleCallback(update.callback_query, env);
    return;
  }

  const msg = update?.message;
  if (!msg?.chat) return;

  const chatId: number = msg.chat.id;
  if (chatId !== OWNER_CHAT_ID) {
    if (msg.chat.type === "private") {
      await sendMessage(env, chatId, "Я личный ассистент Эдуарда 🦝");
    }
    return;
  }

  try {
    let text = msg.text?.trim();

    if (!text && msg.voice) {
      text = await transcribeVoice(env, msg.voice);
      if (text === null) return; // отказ уже отправлен
    }

    if (!text) {
      await sendMessage(env, chatId, "🦝 Пока понимаю только текст и голосовые. Картинки — в следующих версиях!");
      return;
    }

    await routeText(env, text);
  } catch (e) {
    console.error("handleUpdate:", e);
    await sendMessage(env, OWNER_CHAT_ID, `🦝 Споткнулся: ${String(e).slice(0, 300)}`);
  }
}

// ---------- голосовые (A1) ----------

async function transcribeVoice(env: Env, voice: any): Promise<string | null> {
  if ((voice.duration ?? 0) > VOICE_MAX_SEC || (voice.file_size ?? 0) > VOICE_MAX_BYTES) {
    await sendMessage(env, OWNER_CHAT_ID, "🦝 Слишком длинное — давай покороче или текстом");
    return null;
  }
  try {
    const buf = await downloadFile(env, voice.file_id);
    const text = (await transcribeAudio(env, buf, voice.mime_type || "audio/ogg")).trim();
    if (!text) {
      await sendMessage(env, OWNER_CHAT_ID, "🦝 Не расслышал — повтори, пожалуйста");
      return null;
    }
    await sendMessage(env, OWNER_CHAT_ID, `🎙 «${text}»`);
    return text;
  } catch (e) {
    console.error("transcribeVoice:", e);
    await sendMessage(env, OWNER_CHAT_ID, "🦝 Не смог распознать голосовое. Попробуй ещё раз или текстом.");
    return null;
  }
}

// ---------- маршрутизация текста ----------

async function routeText(env: Env, text: string): Promise<void> {
  const command = text.match(/^\/(\w+)(?:@\w+)?\s*(.*)$/s);
  if (command) {
    const [, cmd, rest] = command;
    switch (cmd.toLowerCase()) {
      case "start":
      case "help":
        await sendMessage(env, OWNER_CHAT_ID, helpText());
        return;
      case "today":
        await sendMessage(env, OWNER_CHAT_ID, await formatToday(env));
        return;
      case "week":
        await sendMessage(env, OWNER_CHAT_ID, await formatWeek(env));
        return;
      case "habits":
        await sendMessage(env, OWNER_CHAT_ID, await formatHabits(env));
        return;
      case "lead":
      case "leads":
        await sendMessage(env, OWNER_CHAT_ID, await formatFunnel(env));
        return;
      case "done":
        if (rest.trim()) {
          await sendMessage(env, OWNER_CHAT_ID, await handleEveningReport(env, rest.trim()));
        } else {
          await sendMessage(env, OWNER_CHAT_ID, "🦝 Рассказывай, что сделал за день — отмечу в системе.");
        }
        return;
      default:
        await sendMessage(env, OWNER_CHAT_ID, "🦝 Такой команды не знаю. Есть /today, /week, /habits, /lead, /done.");
        return;
    }
  }

  // Ответ на вопрос «перенести/снять» после вечернего отчёта (в т.ч. по номерам — B4)
  if (await resolvePending(env, text)) return;

  const dialog = await loadDialog(env);
  const brain = await classify(env, text, dialog);
  if (!brain || !brain.intent) {
    await sendMessage(env, OWNER_CHAT_ID, "🦝 Не разобрал, что ты имел в виду. Скажи иначе?");
    return;
  }

  const reply = await applyIntent(env, text, brain);
  if (reply !== null) {
    await sendMessage(env, OWNER_CHAT_ID, reply);
    await saveDialog(env, text, reply);
  }
}

// ---------- интенты ----------

async function applyIntent(env: Env, text: string, brain: BrainResult): Promise<string | null> {
  switch (brain.intent) {
    case "morning_plan":
    case "add_task": {
      const tasks = (brain.tasks ?? []).filter((t): t is BrainTask => Boolean(t?.title));
      if (!tasks.length) return brain.reply || "🦝 Задач не нашёл. Напиши списком — поставлю.";
      for (const t of tasks) await createTask(env, t);
      const lines = tasks.map((t) => `• ${t.title}${t.time ? ` (${t.time})` : ""}`).join("\n");
      const head = `🦝 Поставил ${tasks.length} ${plural(tasks.length, "задачу", "задачи", "задач")}:\n${lines}`;
      return brain.reply ? `${head}\n\n${brain.reply}` : head;
    }

    case "add_lead": {
      const name = await createLead(env, brain.lead ?? {});
      const head = `🦝 Записал лида: ${name} → «Новая заявка»`;
      return brain.reply ? `${head}\n\n${brain.reply}` : head;
    }

    case "evening_report":
      return handleEveningReport(env, text, brain.reply ?? undefined);

    case "weekly_metrics": {
      const m = brain.metrics ?? {};
      const week = isoWeekLabel();
      const op = await upsertWeeklyMetrics(env, week, m);
      const parts = [
        m.leads != null ? `заявки: ${m.leads}` : null,
        m.reels != null ? `ролики: ${m.reels}` : null,
        m.ig != null ? `IG: ${m.ig}` : null,
        m.tg != null ? `TG: ${m.tg}` : null,
        m.clients != null ? `клиенты: ${m.clients}` : null,
      ].filter(Boolean);
      const head = `🦝 Метрики недели ${week} ${op === "created" ? "записаны" : "обновлены"}: ${parts.join(" · ") || "—"}`;
      return brain.reply ? `${head}\n\n${brain.reply}` : head;
    }

    case "content_idea": {
      const title = await createContentIdea(env, brain.idea?.title ?? "", brain.idea?.text ?? text);
      const head = `💡 Идея в копилку: «${title}» (контент)`;
      return brain.reply ? `${head}\n\n${brain.reply}` : head;
    }

    case "post_to_channel":
      await handlePostToChannel(env, text, brain);
      return null; // ответ отправлен внутри

    case "note": {
      const title = await createNote(env, text);
      const head = `🦝 Сохранил в базу знаний: «${title}»`;
      return brain.reply ? `${head}\n\n${brain.reply}` : head;
    }

    case "question":
    default:
      return brain.reply || "🦝 Принял!";
  }
}

// ---------- вечерний отчёт ----------

async function handleEveningReport(env: Env, report: string, brainReply?: string): Promise<string> {
  const [open, habits] = await Promise.all([queryOpenTodayTasks(env), queryActiveHabits(env)]);
  const match = await matchReport(env, report, open.map((t) => t.title), habits.map((h) => h.title));

  const doneSet = new Set((match?.done_tasks ?? []).map(norm));
  const habitSet = new Set((match?.habits_done ?? []).map(norm));

  const doneTasks = open.filter((t) => doneSet.has(norm(t.title)));
  const undoneTasks = open.filter((t) => !doneSet.has(norm(t.title)));
  const doneHabits = habits.filter((h) => habitSet.has(norm(h.title)));

  for (const t of doneTasks) await markTaskDone(env, t.id);
  for (const h of doneHabits) await logHabit(env, h);

  // Флаг «отчёт за сегодня был» — чтобы вечернее напоминание не пришло (A3)
  await setReportDone(env);

  const parts: string[] = [];
  if (doneTasks.length) {
    parts.push(`✅ Готово (${doneTasks.length}):\n${doneTasks.map((t) => `• ${t.title}`).join("\n")}`);
  }
  if (doneHabits.length) {
    parts.push(`💪 Привычки отмечены: ${doneHabits.map((h) => h.title).join(" · ")}`);
  }
  if (!doneTasks.length && !doneHabits.length) {
    parts.push("🦝 По отчёту ничего не сопоставил с открытыми задачами.");
  }
  if (undoneTasks.length) {
    await savePending(env, undoneTasks);
    const numbered = undoneTasks.map((t, i) => `${i + 1}. ${t.title}`).join("\n");
    parts.push(
      `⏳ Не сделано (${undoneTasks.length}):\n${numbered}` +
        `\n\nПеренести на завтра или снять? Можно по номерам: «перенеси 1 и 3, второе сними».`,
    );
  } else if (open.length) {
    parts.push("Все задачи дня закрыты. Терпение + Дисциплина = Результат 🦝");
  }
  if (brainReply) parts.push(brainReply);
  return parts.join("\n\n");
}

// ---------- разбор ответа «перенести/снять» (B4) ----------

const ORDINALS: Record<string, number> = {
  "перв": 1, "втор": 2, "трет": 3, "четверт": 4, "пят": 5, "шест": 6, "седьм": 7, "восьм": 8, "девят": 9, "десят": 10,
};
const RESCHEDULE_WORD = /(перенес|перенос|на завтра)/i;
const DROP_WORD = /(сними|снять|снимай|убери|убрать|отмен)/i;

interface ParsedActions {
  reschedule: number[]; // 1-based индексы
  drop: number[];
}

/** «перенеси 1 и 3, второе сними» → {reschedule:[1,3], drop:[2]}. Без номеров — действие на всё. */
function parseActions(text: string, count: number): ParsedActions | null {
  const lower = text.toLowerCase();
  const hasResch = RESCHEDULE_WORD.test(lower);
  const hasDrop = DROP_WORD.test(lower);
  if (!hasResch && !hasDrop) return null;

  // Позиции глаголов
  const verbs: { pos: number; type: "r" | "d" }[] = [];
  for (const m of lower.matchAll(/перенес|перенос|на завтра/g)) verbs.push({ pos: m.index!, type: "r" });
  for (const m of lower.matchAll(/сними|снять|снимай|убери|убрать|отмен/g)) verbs.push({ pos: m.index!, type: "d" });
  verbs.sort((a, b) => a.pos - b.pos);

  // Собираем номера: цифры и порядковые слова
  const nums: { pos: number; val: number }[] = [];
  for (const m of lower.matchAll(/\d+/g)) {
    const v = Number(m[0]);
    if (v >= 1 && v <= count) nums.push({ pos: m.index!, val: v });
  }
  for (const m of lower.matchAll(/[а-яё]+/g)) {
    for (const [stem, val] of Object.entries(ORDINALS)) {
      if (m[0].startsWith(stem) && val <= count) {
        nums.push({ pos: m.index!, val });
        break;
      }
    }
  }

  const reschedule = new Set<number>();
  const drop = new Set<number>();

  if (!nums.length) {
    // Номера не названы — глагол применяется ко всем задачам
    const type = hasResch && !hasDrop ? "r" : hasDrop && !hasResch ? "d" : verbs[0].type;
    const target = type === "r" ? reschedule : drop;
    for (let i = 1; i <= count; i++) target.add(i);
  } else {
    // Каждый номер — к ближайшему глаголу (при равенстве предпочесть более ранний)
    for (const n of nums) {
      let best = verbs[0];
      let bestDist = Math.abs(n.pos - best.pos);
      for (const v of verbs.slice(1)) {
        const d = Math.abs(n.pos - v.pos);
        if (d < bestDist) {
          best = v;
          bestDist = d;
        }
      }
      (best.type === "r" ? reschedule : drop).add(n.val);
    }
  }

  return { reschedule: [...reschedule], drop: [...drop] };
}

async function resolvePending(env: Env, text: string): Promise<boolean> {
  if (text.length > 120) return false;

  let pending = await loadPending(env);
  if (!pending?.length) {
    if (!RESCHEDULE_WORD.test(text) && !DROP_WORD.test(text)) return false;
    // Без сохранённого списка (нет KV) — берём актуальные открытые задачи дня
    pending = (await queryOpenTodayTasks(env)).map((t) => ({ id: t.id, title: t.title }));
    if (!pending.length) return false;
  }

  const actions = parseActions(text, pending.length);
  if (!actions || (!actions.reschedule.length && !actions.drop.length)) return false;

  const iso = tomorrowISO();
  const moved: string[] = [];
  const dropped: string[] = [];

  for (const n of actions.reschedule) {
    const t = pending[n - 1];
    if (!t) continue;
    await rescheduleTaskToDate(env, t.id, iso);
    moved.push(t.title);
  }
  for (const n of actions.drop) {
    const t = pending[n - 1];
    if (!t) continue;
    await dropTask(env, t.id);
    dropped.push(t.title);
  }

  await clearPending(env);

  const parts: string[] = [];
  if (moved.length) parts.push(`🦝 Перенёс на завтра (${moved.length}):\n${moved.map((t) => `• ${t}`).join("\n")}`);
  if (dropped.length) parts.push(`🦝 Снял (${dropped.length}):\n${dropped.map((t) => `• ${t}`).join("\n")}\nСтатус: Отложено.`);
  await sendMessage(env, OWNER_CHAT_ID, parts.join("\n\n"));
  return true;
}

// ---------- постинг в канал (C1) ----------

async function handlePostToChannel(env: Env, text: string, brain: BrainResult): Promise<void> {
  const postText = (brain.post?.text ?? "").trim();
  if (!postText) {
    await sendMessage(env, OWNER_CHAT_ID, "🦝 Что именно запостить? Напиши: «запости в канал: …»");
    return;
  }

  const when = brain.post?.when ? parseLocalDateTime(brain.post.when) : null;
  if (when && when > Date.now()) {
    if (!env.LUTIK_CONTEXT) {
      await sendMessage(env, OWNER_CHAT_ID, "🦝 Отложенные посты требуют KV (LUTIK_CONTEXT). Сейчас могу запостить только сразу.");
      return;
    }
    const ts = Math.floor(when / 1000);
    await env.LUTIK_CONTEXT.put(`scheduled_post:${ts}`, JSON.stringify({ text: postText }));
    await sendMessage(env, OWNER_CHAT_ID, `🗓 Запланировал пост на ${brain.post!.when} (Екб):\n\n${postText}`);
    return;
  }

  // Немедленный пост — предпросмотр + подтверждение
  const id = randomId();
  if (env.LUTIK_CONTEXT) {
    await env.LUTIK_CONTEXT.put(`pendingpost:${id}`, postText, { expirationTtl: POST_TTL });
  }
  const keyboard: InlineButton[][] = [[
    { text: "✅ Запостить", callback_data: `pc:${id}` },
    { text: "✖️ Отмена", callback_data: `px:${id}` },
  ]];
  await sendMessage(env, OWNER_CHAT_ID, `📣 Предпросмотр поста в канал:\n\n${postText}`, keyboard);
}

async function handleCallback(cb: any, env: Env): Promise<void> {
  const data: string = cb.data ?? "";
  const chatId = cb.message?.chat?.id;
  const messageId = cb.message?.message_id;
  if (chatId !== OWNER_CHAT_ID) {
    await answerCallback(env, cb.id);
    return;
  }

  const [action, id] = data.split(":");
  if (action !== "pc" && action !== "px") {
    await answerCallback(env, cb.id);
    return;
  }

  if (messageId) await clearKeyboard(env, chatId, messageId);

  if (action === "px") {
    if (env.LUTIK_CONTEXT) await env.LUTIK_CONTEXT.delete(`pendingpost:${id}`);
    await answerCallback(env, cb.id, "Отменено");
    await sendMessage(env, OWNER_CHAT_ID, "🦝 Окей, не постим.");
    return;
  }

  // pc — подтверждение
  const postText = env.LUTIK_CONTEXT ? await env.LUTIK_CONTEXT.get(`pendingpost:${id}`) : null;
  if (!postText) {
    await answerCallback(env, cb.id, "Истекло");
    await sendMessage(env, OWNER_CHAT_ID, "🦝 Текст поста уже не нашёл (истёк). Пришли заново.");
    return;
  }
  try {
    await sendMessage(env, CHANNEL_ID, postText);
    if (env.LUTIK_CONTEXT) await env.LUTIK_CONTEXT.delete(`pendingpost:${id}`);
    await answerCallback(env, cb.id, "Опубликовано");
    await sendMessage(env, OWNER_CHAT_ID, "✅ Запостил в канал.");
  } catch (e) {
    console.error("post to channel:", e);
    await answerCallback(env, cb.id, "Ошибка");
    await sendMessage(env, OWNER_CHAT_ID, `🦝 Не смог запостить: ${String(e).slice(0, 200)}`);
  }
}

// ---------- /today, /week, /habits, /lead ----------

async function formatToday(env: Env): Promise<string> {
  const [tasks, habits] = await Promise.all([queryTodayTasks(env), queryActiveHabits(env)]);
  return renderPlan(`📋 План на сегодня (${todayLabel()})`, tasks, habits, false);
}

function renderPlan(header: string, tasks: Task[], habits: Habit[], plannedOnly: boolean): string {
  const lines = [header];
  if (!tasks.length) {
    lines.push("Задач нет. Либо ты гений планирования, либо пора написать план 🦝");
  } else {
    const sorted = [...tasks].sort(
      (a, b) => (PRIORITY_ORDER[a.priority ?? ""] ?? 3) - (PRIORITY_ORDER[b.priority ?? ""] ?? 3),
    );
    for (const t of sorted) {
      const mark = t.status === "Готово" ? "✅" : PRIORITY_EMOJI[t.priority ?? ""] ?? "⚪";
      lines.push(`${mark} ${t.title}${taskTime(t)}`);
    }
  }
  const today = todayISO();
  const shown = plannedOnly ? habits.filter((h) => isPlannedDay(h.frequency, today)) : habits;
  if (shown.length) {
    lines.push(`Привычки: ${shown.map((h) => `${habitEmoji(h.title)} ${h.title}`).join(" · ")}`);
  }
  return lines.join("\n");
}

async function formatWeek(env: Env): Promise<string> {
  const tasks = await queryWeekTasks(env);
  return renderWeek(tasks);
}

function renderWeek(tasks: Task[]): string {
  if (!tasks.length) return "🗓 На этой неделе задач не отмечено. Чистый лист 🦝";
  const groups: [string, string, Task[]][] = [
    ["✅", "Сделано", tasks.filter((t) => t.status === "Готово")],
    ["🔄", "В работе", tasks.filter((t) => t.status === "В работе")],
    ["⬜", "Не начато", tasks.filter((t) => t.status === "Не начато")],
    ["⏸", "Отложено", tasks.filter((t) => t.status === "Отложено")],
  ];
  const lines = [`🗓 Неделя: ${tasks.length} задач, готово ${groups[0][2].length}`];
  for (const [emoji, label, list] of groups) {
    if (!list.length) continue;
    lines.push(`\n${emoji} ${label} (${list.length}):`);
    for (const t of list) lines.push(`• ${t.title}`);
  }
  return lines.join("\n");
}

async function formatHabits(env: Env): Promise<string> {
  const habits = await queryActiveHabits(env);
  if (!habits.length) return "🦝 Активных привычек нет.";
  const streaks = await habitStreaks(env, habits);
  const parts = habits.map((h) => {
    const s = streaks.get(h.id) ?? 0;
    return `${habitEmoji(h.title)} ${h.title} — ${s > 0 ? `🔥 ${s} подряд` : "пока 0"}`;
  });
  return `🔥 Привычки:\n${parts.join("\n")}`;
}

async function formatFunnel(env: Env): Promise<string> {
  const leads = await queryLeads(env);
  if (!leads.length) return "🦝 В CRM пока пусто.";
  const counts = new Map<string, number>();
  for (const l of leads) counts.set(l.status ?? "—", (counts.get(l.status ?? "—") ?? 0) + 1);
  const order = ["Новая заявка", "Консультация назначена", "Консультация проведена", "Думает", "Клиент", "Отказ"];
  const emoji: Record<string, string> = {
    "Новая заявка": "🔴", "Консультация назначена": "🟠", "Консультация проведена": "🟡",
    "Думает": "🤔", "Клиент": "✅", "Отказ": "⚫",
  };
  const seen = new Set<string>();
  const summary: string[] = [];
  for (const s of order) {
    if (counts.has(s)) { summary.push(`${emoji[s] ?? "•"} ${counts.get(s)} ${s.toLowerCase()}`); seen.add(s); }
  }
  for (const [s, c] of counts) if (!seen.has(s)) summary.push(`• ${c} ${s.toLowerCase()}`);

  const lastNew = leads.filter((l) => l.status === "Новая заявка").slice(0, 3);
  const lines = [`Воронка: ${summary.join(" · ")}`];
  if (lastNew.length) {
    lines.push(`\nПоследние заявки:\n${lastNew.map((l) => `• ${l.name}${l.applied ? ` (${l.applied})` : ""}`).join("\n")}`);
  }
  return lines.join("\n");
}

// ---------- cron-задачи (A2) ----------

export async function morningBrief(env: Env): Promise<void> {
  try {
    const [tasks, habits, leads] = await Promise.all([queryTodayTasks(env), queryActiveHabits(env), queryLeads(env)]);
    let text: string;
    if (!tasks.length) {
      text = `☀️ Доброе утро! (${todayLabel()})\nПлан пуст. Что сегодня делаем?`;
    } else {
      text = renderPlan(`☀️ Доброе утро! План на день (${todayLabel()})`, tasks, habits, true);
    }
    const stale = staleLeads(leads);
    if (stale.length) {
      text += `\n\n⚠️ Лиды ждут:\n${stale.map((l) => `• ${l.name} — ${l.status}`).join("\n")}`;
    }
    await sendMessage(env, OWNER_CHAT_ID, text);
  } catch (e) {
    console.error("morningBrief:", e);
    await sendMessage(env, OWNER_CHAT_ID, `🦝 Не собрал утренний бриф: ${String(e).slice(0, 200)}`);
  }
}

export async function eveningReminder(env: Env): Promise<void> {
  try {
    if (await isReportDone(env)) return;
    await sendMessage(env, OWNER_CHAT_ID, "🦝 Как прошёл день? Кидай отчёт.");
  } catch (e) {
    console.error("eveningReminder:", e);
  }
}

export async function weeklyReview(env: Env): Promise<void> {
  try {
    const tasks = await queryWeekTasks(env);
    const done = tasks.filter((t) => t.status === "Готово").length;
    const left = tasks.length - done;
    const text =
      `🗓 Итоги недели ${isoWeekLabel()}\n` +
      `Задачи: ✅ ${done} · осталось ${left}\n\n` +
      `Подбей метрики недели — пришли числа одним сообщением:\n` +
      `• заявок\n• роликов выложено\n• подписчиков Instagram\n• подписчиков Telegram\n\n` +
      `Например: «заявок 3, роликов 5, IG 8600, TG 410».`;
    await sendMessage(env, OWNER_CHAT_ID, text);
  } catch (e) {
    console.error("weeklyReview:", e);
    await sendMessage(env, OWNER_CHAT_ID, `🦝 Не собрал недельный обзор: ${String(e).slice(0, 200)}`);
  }
}

export async function processScheduledPosts(env: Env): Promise<void> {
  if (!env.LUTIK_CONTEXT) return;
  try {
    const now = Math.floor(Date.now() / 1000);
    const list = await env.LUTIK_CONTEXT.list({ prefix: "scheduled_post:" });
    for (const key of list.keys) {
      const ts = Number(key.name.split(":")[1]);
      if (!Number.isFinite(ts) || ts > now) continue;
      const raw = await env.LUTIK_CONTEXT.get(key.name);
      await env.LUTIK_CONTEXT.delete(key.name);
      if (!raw) continue;
      try {
        const { text } = JSON.parse(raw) as { text: string };
        await sendMessage(env, CHANNEL_ID, text);
        await sendMessage(env, OWNER_CHAT_ID, `✅ Отложенный пост опубликован:\n\n${text}`);
      } catch (e) {
        console.error("scheduled post:", e);
        await sendMessage(env, OWNER_CHAT_ID, `🦝 Не смог опубликовать отложенный пост: ${String(e).slice(0, 200)}`);
      }
    }
  } catch (e) {
    console.error("processScheduledPosts:", e);
  }
}

// ---------- KV ----------

interface PendingTask {
  id: string;
  title: string;
}

async function savePending(env: Env, tasks: Task[]): Promise<void> {
  if (!env.LUTIK_CONTEXT) return;
  const payload: PendingTask[] = tasks.map((t) => ({ id: t.id, title: t.title }));
  await env.LUTIK_CONTEXT.put(PENDING_KEY, JSON.stringify(payload), { expirationTtl: KV_TTL });
}

async function loadPending(env: Env): Promise<PendingTask[] | null> {
  if (!env.LUTIK_CONTEXT) return null;
  const raw = await env.LUTIK_CONTEXT.get(PENDING_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingTask[];
  } catch {
    return null;
  }
}

async function clearPending(env: Env): Promise<void> {
  await env.LUTIK_CONTEXT?.delete(PENDING_KEY);
}

async function setReportDone(env: Env): Promise<void> {
  await env.LUTIK_CONTEXT?.put(`report_done:${todayISO()}`, "1", { expirationTtl: KV_TTL });
}

async function isReportDone(env: Env): Promise<boolean> {
  if (!env.LUTIK_CONTEXT) return false;
  return (await env.LUTIK_CONTEXT.get(`report_done:${todayISO()}`)) != null;
}

async function loadDialog(env: Env): Promise<string | undefined> {
  if (!env.LUTIK_CONTEXT) return undefined;
  return (await env.LUTIK_CONTEXT.get(DIALOG_KEY)) ?? undefined;
}

async function saveDialog(env: Env, userText: string, botReply: string): Promise<void> {
  if (!env.LUTIK_CONTEXT) return;
  const prev = (await env.LUTIK_CONTEXT.get(DIALOG_KEY)) ?? "";
  const entry = `Эдуард: ${userText.slice(0, 300)}\nЛютик: ${botReply.slice(0, 300)}`;
  const pairs = prev ? prev.split("\n---\n") : [];
  pairs.push(entry);
  await env.LUTIK_CONTEXT.put(DIALOG_KEY, pairs.slice(-6).join("\n---\n"), { expirationTtl: KV_TTL });
}

// ---------- мелочи ----------

function norm(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function taskTime(t: Task): string {
  const m = t.date?.match(/T(\d{2}:\d{2})/);
  return m ? ` — ${m[1]}` : "";
}

/** «YYYY-MM-DDTHH:MM» в локальном времени Екб → epoch ms */
function parseLocalDateTime(s: string): number | null {
  const m = s.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
  if (!m) return null;
  const t = Date.parse(`${m[1]}T${m[2]}:00+05:00`);
  return Number.isNaN(t) ? null : t;
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function habitEmoji(title: string): string {
  const t = title.toLowerCase();
  if (/(трениров|силов|спорт)/.test(t)) return "💪";
  if (/(питани|еда|рацион)/.test(t)) return "🍽";
  if (/(сон|отбой|спать)/.test(t)) return "😴";
  if (/(подъ[её]м|утро)/.test(t)) return "🌅";
  if (/(чист|трезв)/.test(t)) return "🚭";
  return "✅";
}

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

function helpText(): string {
  return `🦝 Я Лютик — ассистент Эдуарда. Веду систему жизни в Notion. Понимаю текст и голосовые.

Понимаю:
• «сегодня: снять рилс, тренировка в 12…» — поставлю задачи на день
• «добавь / надо / не забыть…» — добавлю задачу
• «Аня из инсты хочет консультацию» — запишу лида
• «сделал то-то и то-то» или /done — отмечу выполненное и привычки
• «идея для рилса: …» — сохраню в копилку контента
• «запости в канал: …» — пост в канал с подтверждением

Команды:
/today — план на сегодня
/week — обзор недели
/habits — стрики привычек
/lead — воронка CRM
/done — вечерний отчёт

Терпение + Дисциплина = Результат`;
}
