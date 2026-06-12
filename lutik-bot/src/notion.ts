import { DB, LEAD_INTERESTS, LEAD_SOURCES, PRIORITIES, SPHERES, type Env } from "./config";
import { normTime, todayISO, weekdayShort, weekdayShortISO } from "./dates";

const NOTION_API = "https://api.notion.com/v1";

async function notion(env: Env, path: string, method: string, body?: unknown): Promise<any> {
  const res = await fetch(`${NOTION_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${env.NOTION_TOKEN}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Notion ${method} ${path} → ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  return res.json();
}

function pageTitle(page: any): string {
  for (const prop of Object.values(page.properties ?? {}) as any[]) {
    if (prop?.type === "title") {
      return (prop.title ?? []).map((t: any) => t.plain_text ?? "").join("") || "(без названия)";
    }
  }
  return "(без названия)";
}

function selectName(page: any, prop: string): string | null {
  const p = page.properties?.[prop];
  return p?.select?.name ?? p?.status?.name ?? null;
}

export interface Task {
  id: string;
  title: string;
  status: string;
  priority: string | null;
  date: string | null; // ISO, может содержать время
}

function parseTask(page: any): Task {
  return {
    id: page.id,
    title: pageTitle(page),
    status: selectName(page, "Статус") ?? "Не начато",
    priority: selectName(page, "Приоритет"),
    date: page.properties?.["Дата"]?.date?.start ?? null,
  };
}

export interface TaskInput {
  title: string;
  sphere?: string | null;
  priority?: string | null;
  time?: string | null;
}

export async function createTask(env: Env, t: TaskInput): Promise<void> {
  const today = todayISO();
  const time = normTime(t.time);
  const props: Record<string, unknown> = {
    "Задача": { title: [{ text: { content: t.title.slice(0, 200) } }] },
    "Статус": { select: { name: "Не начато" } },
    "Дата": { date: { start: time ? `${today}T${time}:00+05:00` : today } },
    "Сегодня": { checkbox: true },
    "Эта неделя": { checkbox: true },
    "День недели": { select: { name: weekdayShort() } },
  };
  if (t.priority && PRIORITIES.includes(t.priority)) {
    props["Приоритет"] = { select: { name: t.priority } };
  }
  const sphereId = t.sphere ? SPHERES[t.sphere.toLowerCase().trim()] : undefined;
  if (sphereId) {
    props["Область"] = { relation: [{ id: sphereId }] };
  }
  await notion(env, "/pages", "POST", { parent: { database_id: DB.tasks }, properties: props });
}

export async function queryTodayTasks(env: Env): Promise<Task[]> {
  const data = await notion(env, `/databases/${DB.tasks}/query`, "POST", {
    filter: {
      or: [
        { property: "Сегодня", checkbox: { equals: true } },
        { property: "Дата", date: { equals: todayISO() } },
      ],
    },
    page_size: 100,
  });
  return (data.results ?? []).map(parseTask);
}

export async function queryWeekTasks(env: Env): Promise<Task[]> {
  const data = await notion(env, `/databases/${DB.tasks}/query`, "POST", {
    filter: {
      or: [
        { property: "Эта неделя", checkbox: { equals: true } },
        { property: "Сегодня", checkbox: { equals: true } },
      ],
    },
    page_size: 100,
  });
  return (data.results ?? []).map(parseTask);
}

export async function queryOpenTodayTasks(env: Env): Promise<Task[]> {
  const data = await notion(env, `/databases/${DB.tasks}/query`, "POST", {
    filter: {
      and: [
        { property: "Сегодня", checkbox: { equals: true } },
        { property: "Статус", select: { does_not_equal: "Готово" } },
      ],
    },
    page_size: 100,
  });
  return (data.results ?? []).map(parseTask);
}

export async function markTaskDone(env: Env, pageId: string): Promise<void> {
  await notion(env, `/pages/${pageId}`, "PATCH", {
    properties: { "Статус": { select: { name: "Готово" } } },
  });
}

/** Перенос на завтра: Дата = завтра, Сегодня = false, Эта неделя = true */
export async function rescheduleTaskToDate(env: Env, pageId: string, iso: string): Promise<void> {
  await notion(env, `/pages/${pageId}`, "PATCH", {
    properties: {
      "Дата": { date: { start: iso } },
      "Сегодня": { checkbox: false },
      "Эта неделя": { checkbox: true },
      "День недели": { select: { name: weekdayShortISO(iso) } },
    },
  });
}

/** Снять задачу: Статус = Отложено, убрать из «сегодня» */
export async function dropTask(env: Env, pageId: string): Promise<void> {
  await notion(env, `/pages/${pageId}`, "PATCH", {
    properties: {
      "Статус": { select: { name: "Отложено" } },
      "Сегодня": { checkbox: false },
    },
  });
}

export interface LeadInput {
  name?: string | null;
  source?: string | null;
  interest?: string | null;
  comment?: string | null;
  consult_date?: string | null; // YYYY-MM-DD
}

export async function createLead(env: Env, lead: LeadInput): Promise<string> {
  const name = (lead.name ?? "").trim() || "Без имени";
  const props: Record<string, unknown> = {
    "Имя": { title: [{ text: { content: name.slice(0, 200) } }] },
    "Статус": { select: { name: "Новая заявка" } },
    "Источник": { select: { name: LEAD_SOURCES.includes(lead.source ?? "") ? lead.source : "Другое" } },
    "Дата заявки": { date: { start: todayISO() } },
  };
  if (lead.interest && LEAD_INTERESTS.includes(lead.interest)) {
    props["Интерес"] = { select: { name: lead.interest } };
  }
  if (lead.consult_date && /^\d{4}-\d{2}-\d{2}$/.test(lead.consult_date)) {
    props["Дата консультации"] = { date: { start: lead.consult_date } };
  }
  if (lead.comment) {
    props["Комментарий"] = { rich_text: [{ text: { content: lead.comment.slice(0, 1900) } }] };
  }
  await notion(env, "/pages", "POST", { parent: { database_id: DB.leads }, properties: props });
  return name;
}

export interface Habit {
  id: string;
  title: string;
}

export async function queryActiveHabits(env: Env): Promise<Habit[]> {
  const data = await notion(env, `/databases/${DB.habits}/query`, "POST", {
    filter: { property: "Активна", checkbox: { equals: true } },
    page_size: 100,
  });
  return (data.results ?? []).map((p: any) => ({ id: p.id, title: pageTitle(p) }));
}

export async function logHabit(env: Env, habit: Habit): Promise<void> {
  const today = todayISO();
  await notion(env, "/pages", "POST", {
    parent: { database_id: DB.habitLog },
    properties: {
      "Отметка": { title: [{ text: { content: `${habit.title} — ${today}` } }] },
      "Привычка": { relation: [{ id: habit.id }] },
      "Дата": { date: { start: today } },
      "Сделано": { checkbox: true },
    },
  });
}

export async function createNote(env: Env, text: string): Promise<string> {
  const title = text.split("\n")[0].slice(0, 80);
  await notion(env, "/pages", "POST", {
    parent: { database_id: DB.knowledge },
    properties: {
      "Заголовок": { title: [{ text: { content: title } }] },
      "Тип": { select: { name: "Заметка" } },
    },
    children: [
      {
        object: "block",
        type: "paragraph",
        paragraph: { rich_text: [{ text: { content: text.slice(0, 1900) } }] },
      },
    ],
  });
  return title;
}
