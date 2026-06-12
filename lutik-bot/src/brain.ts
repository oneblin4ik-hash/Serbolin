import type { Env } from "./config";
import { todayISO, todayLabel } from "./dates";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";

const PERSONA = `Ты — Енот Лютик 🦝, личный ассистент Эдуарда Серболина (фитнес-тренер, Екатеринбург, UTC+5).
Характер: дружелюбный, краткий, дисциплинированный. Без воды. Иногда лёгкий юмор. Девиз: «Терпение + Дисциплина = Результат».
Контекст: Эдуард ведёт онлайн-клиентов (цель 20 × 25к = доход 700к/мес), перезапускает Instagram (8,5к) и растит Telegram (цель 2000), тренируется пн/ср/пт в 12:00, контент-блоки ежедневно. Главные привычки: силовая тренировка, режим питания, отбой до 00:00, подъём 6–7, чистый день (трезвость).
Сферы: работа, контент, финансы, здоровье, семья, обучение.`;

const CLASSIFY_RULES = `Твоя работа: классифицировать сообщение Эдуарда, извлечь структуру и вернуть СТРОГО один JSON-объект без пояснений и без markdown:
{
  "intent": "morning_plan" | "add_task" | "add_lead" | "evening_report" | "question" | "note",
  "tasks": [{"title": "...", "sphere": "работа|контент|финансы|здоровье|семья|обучение", "priority": "Высокий|Средний|Низкий", "time": "HH:MM"}],
  "lead": {"name": "...", "source": "Instagram|Telegram|YouTube|ВКонтакте|Рекомендация|Другое", "interest": "Ведение 25к|Программа|План питания|Не определён", "comment": "...", "consult_date": "YYYY-MM-DD"},
  "reply": "твой короткий ответ Эдуарду"
}

Правила:
- morning_plan: план/список дел на сегодня → заполни tasks (каждой задаче sphere по смыслу; priority и time только если ясны из текста).
- add_task: одна или несколько задач, добавленных в течение дня («добавь…», «надо…», «не забыть…») → tasks.
- add_lead: заявка от потенциального клиента (имя, откуда пришёл, что хочет) → lead. consult_date вычисли от сегодняшней даты, если назван день созвона.
- evening_report: отчёт о сделанном за день («сделал то-то…»).
- question: вопрос о планах, задачах, системе.
- note: всё остальное, что стоит сохранить (мысль, идея, ссылка).
- Поля, не относящиеся к intent, опускай или ставь null / [].
- reply: коротко, по делу, поддерживающе. Не перечисляй в reply задачи — сводку бот добавит сам.`;

export interface BrainTask {
  title: string;
  sphere?: string | null;
  priority?: string | null;
  time?: string | null;
}

export interface BrainResult {
  intent: string;
  tasks?: BrainTask[] | null;
  lead?: {
    name?: string | null;
    source?: string | null;
    interest?: string | null;
    comment?: string | null;
    consult_date?: string | null;
  } | null;
  reply?: string | null;
}

export interface ReportMatch {
  done_tasks: string[];
  habits_done: string[];
}

/** Срезает ```json-обёртки и вытаскивает первый JSON-объект из ответа модели */
export function extractJSON<T>(raw: string): T | null {
  let s = raw.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) s = fence[1].trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(s.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

async function callClaude(env: Env, system: string, user: string): Promise<string> {
  const res = await fetch(ANTHROPIC_API, {
    method: "POST",
    headers: {
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok) {
    throw new Error(`Anthropic → ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const data: any = await res.json();
  return (data.content ?? [])
    .filter((b: any) => b.type === "text")
    .map((b: any) => b.text)
    .join("");
}

export async function classify(env: Env, text: string, dialogContext?: string): Promise<BrainResult | null> {
  let system = `${PERSONA}\n\nСегодня: ${todayLabel()}, ${todayISO()}.\n\n${CLASSIFY_RULES}`;
  if (dialogContext) {
    system += `\n\nПоследние сообщения диалога (для связности):\n${dialogContext}`;
  }
  return extractJSON<BrainResult>(await callClaude(env, system, text));
}

/** Второй вызов для вечернего отчёта: сопоставить отчёт с реальными задачами и привычками */
export async function matchReport(
  env: Env,
  report: string,
  taskTitles: string[],
  habitTitles: string[],
): Promise<ReportMatch | null> {
  const system = `${PERSONA}

Эдуард прислал вечерний отчёт. Сопоставь его с открытыми задачами и привычками.
Верни СТРОГО один JSON-объект без пояснений:
{"done_tasks": ["..."], "habits_done": ["..."]}
- done_tasks: названия задач из списка ниже, которые по отчёту ВЫПОЛНЕНЫ. Копируй названия точно.
- habits_done: названия привычек из списка ниже, которые по отчёту выполнены (тренировка → силовая, еда по плану → питание, лёг вовремя → сон/отбой, не пил → чистый день и т.п.). Копируй названия точно.
- Включай только то, что явно сделано. Если ничего — пустые массивы.

Открытые задачи на сегодня:
${taskTitles.map((t) => `- ${t}`).join("\n") || "(нет)"}

Активные привычки:
${habitTitles.map((t) => `- ${t}`).join("\n") || "(нет)"}`;
  return extractJSON<ReportMatch>(await callClaude(env, system, report));
}
