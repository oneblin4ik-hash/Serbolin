import { classify, matchReport, type BrainResult, type BrainTask } from "./brain";
import { OWNER_CHAT_ID, type Env } from "./config";
import { todayLabel, tomorrowISO } from "./dates";
import {
  createLead,
  createNote,
  createTask,
  dropTask,
  logHabit,
  markTaskDone,
  queryActiveHabits,
  queryOpenTodayTasks,
  queryTodayTasks,
  queryWeekTasks,
  rescheduleTaskToDate,
  type Task,
} from "./notion";
import { sendMessage } from "./telegram";

const PENDING_KEY = `pending:${OWNER_CHAT_ID}`;
const DIALOG_KEY = `dialog:${OWNER_CHAT_ID}`;
const KV_TTL = 86_400; // 24 часа

const PRIORITY_EMOJI: Record<string, string> = { "Высокий": "🔴", "Средний": "🟡", "Низкий": "🟢" };
const PRIORITY_ORDER: Record<string, number> = { "Высокий": 0, "Средний": 1, "Низкий": 2 };

// ---------- входная точка ----------

export async function handleUpdate(update: any, env: Env): Promise<void> {
  const msg = update?.message;
  if (!msg?.chat) return; // edited_message, callback и прочее — игнорируем

  const chatId: number = msg.chat.id;
  if (chatId !== OWNER_CHAT_ID) {
    if (msg.chat.type === "private") {
      await sendMessage(env, chatId, "Я личный ассистент Эдуарда 🦝");
    }
    return;
  }

  const text: string | undefined = msg.text?.trim();
  if (!text) {
    await sendMessage(env, chatId, "🦝 Пока понимаю только текст. Голосовые — в v2!");
    return;
  }

  try {
    await routeText(env, text);
  } catch (e) {
    console.error("handleUpdate:", e);
    await sendMessage(env, OWNER_CHAT_ID, `🦝 Споткнулся: ${String(e).slice(0, 300)}`);
  }
}

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
      case "done":
        if (rest.trim()) {
          await handleEveningReport(env, rest.trim());
        } else {
          await sendMessage(env, OWNER_CHAT_ID, "🦝 Рассказывай, что сделал за день — отмечу в системе.");
        }
        return;
      default:
        await sendMessage(env, OWNER_CHAT_ID, "🦝 Такой команды не знаю. Есть /today, /week, /done.");
        return;
    }
  }

  // Ответ на вопрос «перенести или снять?» после вечернего отчёта
  if (await resolvePending(env, text)) return;

  const dialog = await loadDialog(env);
  const brain = await classify(env, text, dialog);
  if (!brain || !brain.intent) {
    await sendMessage(env, OWNER_CHAT_ID, "🦝 Не разобрал, что ты имел в виду. Скажи иначе?");
    return;
  }

  const reply = await applyIntent(env, text, brain);
  await sendMessage(env, OWNER_CHAT_ID, reply);
  await saveDialog(env, text, reply);
}

// ---------- интенты ----------

async function applyIntent(env: Env, text: string, brain: BrainResult): Promise<string> {
  switch (brain.intent) {
    case "morning_plan":
    case "add_task": {
      const tasks = (brain.tasks ?? []).filter((t): t is BrainTask => Boolean(t?.title));
      if (!tasks.length) {
        return brain.reply || "🦝 Задач не нашёл. Напиши списком — поставлю.";
      }
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
    parts.push(
      `⏳ Не сделано (${undoneTasks.length}):\n${undoneTasks.map((t) => `• ${t.title}`).join("\n")}` +
        `\n\nПеренести на завтра или снять? («перенеси» / «сними»)`,
    );
  } else if (open.length) {
    parts.push("Все задачи дня закрыты. Терпение + Дисциплина = Результат 🦝");
  }
  if (brainReply) parts.push(brainReply);
  return parts.join("\n\n");
}

// «перенеси» / «сними» сразу после вечернего отчёта
const RESCHEDULE_RE = /^(да[,!. ]*)?\s*(перенеси|перенести|перенос|на завтра)/i;
const DROP_RE = /^(да[,!. ]*)?\s*(сними|снять|снимай|убери|убрать|отмени|отменяй)/i;

async function resolvePending(env: Env, text: string): Promise<boolean> {
  if (text.length > 80) return false;
  const reschedule = RESCHEDULE_RE.test(text);
  const drop = !reschedule && DROP_RE.test(text);
  if (!reschedule && !drop) return false;

  let pending = await loadPending(env);
  if (!pending && !env.LUTIK_CONTEXT) {
    // Без KV состояние не хранится — берём актуальные открытые задачи дня
    pending = (await queryOpenTodayTasks(env)).map((t) => ({ id: t.id, title: t.title }));
  }
  if (!pending?.length) return false;

  if (reschedule) {
    const iso = tomorrowISO();
    for (const t of pending) await rescheduleTaskToDate(env, t.id, iso);
    await clearPending(env);
    await sendMessage(
      env,
      OWNER_CHAT_ID,
      `🦝 Перенёс на завтра (${pending.length}):\n${pending.map((t) => `• ${t.title}`).join("\n")}`,
    );
  } else {
    for (const t of pending) await dropTask(env, t.id);
    await clearPending(env);
    await sendMessage(
      env,
      OWNER_CHAT_ID,
      `🦝 Снял (${pending.length}):\n${pending.map((t) => `• ${t.title}`).join("\n")}\nСтатус: Отложено.`,
    );
  }
  return true;
}

// ---------- /today и /week ----------

async function formatToday(env: Env): Promise<string> {
  const [tasks, habits] = await Promise.all([queryTodayTasks(env), queryActiveHabits(env)]);
  const lines = [`📋 План на сегодня (${todayLabel()})`];

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
  if (habits.length) {
    lines.push(`Привычки: ${habits.map((h) => `${habitEmoji(h.title)} ${h.title}`).join(" · ")}`);
  }
  return lines.join("\n");
}

async function formatWeek(env: Env): Promise<string> {
  const tasks = await queryWeekTasks(env);
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

// ---------- KV: pending и контекст диалога ----------

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
  return `🦝 Я Лютик — ассистент Эдуарда. Веду систему жизни в Notion.

Понимаю:
• «сегодня: снять рилс, тренировка в 12…» — поставлю задачи на день
• «добавь / надо / не забыть…» — добавлю задачу
• «Аня из инсты хочет консультацию» — запишу лида
• «сделал то-то и то-то» или /done — отмечу выполненное и привычки

Команды:
/today — план на сегодня
/week — обзор недели
/done — вечерний отчёт

Терпение + Дисциплина = Результат`;
}
