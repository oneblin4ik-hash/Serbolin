import type { Env } from "./config";
import { todayISO, todayLabel } from "./dates";

// OpenAI-совместимый endpoint Gemini — для классификации и сопоставления.
const OPENAI_COMPAT_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
// Нативный endpoint Gemini — только для распознавания аудио (inline_data).
const NATIVE_URL = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

const MODEL = "gemini-2.5-flash";
const MODEL_FALLBACK = "gemini-2.5-flash-lite";

const PERSONA = `Ты — Енот Лютик 🦝, личный ассистент Эдуарда Серболина (фитнес-тренер, Екатеринбург, UTC+5).
Характер: дружелюбный, краткий, дисциплинированный. Без воды. Иногда лёгкий юмор. Девиз: «Терпение + Дисциплина = Результат».
Контекст: Эдуард ведёт онлайн-клиентов (цель 20 × 25к = доход 700к/мес), перезапускает Instagram (8,5к) и растит Telegram (цель 2000), тренируется пн/ср/пт в 12:00, контент-блоки ежедневно. Главные привычки: силовая тренировка, режим питания, отбой до 00:00, подъём 6–7, чистый день (трезвость).
Сферы: работа, контент, финансы, здоровье, семья, обучение.`;

const CLASSIFY_RULES = `Твоя работа: классифицировать сообщение Эдуарда, извлечь структуру и вернуть СТРОГО один JSON-объект без пояснений и без markdown:
{
  "intent": "morning_plan" | "add_task" | "add_lead" | "evening_report" | "weekly_metrics" | "post_to_channel" | "content_idea" | "question" | "note",
  "tasks": [{"title": "...", "sphere": "работа|контент|финансы|здоровье|семья|обучение", "priority": "Высокий|Средний|Низкий", "time": "HH:MM"}],
  "lead": {"name": "...", "source": "Instagram|Telegram|YouTube|ВКонтакте|Рекомендация|Другое", "interest": "Ведение 25к|Программа|План питания|Не определён", "comment": "...", "consult_date": "YYYY-MM-DD"},
  "metrics": {"leads": 0, "reels": 0, "ig": 0, "tg": 0, "clients": 0, "comment": "..."},
  "post": {"text": "...", "when": "YYYY-MM-DDTHH:MM"},
  "idea": {"title": "...", "text": "..."},
  "reply": "твой короткий ответ Эдуарду"
}

Правила:
- morning_plan: план/список дел на сегодня → заполни tasks (каждой задаче sphere по смыслу; priority и time только если ясны из текста).
- add_task: одна или несколько задач, добавленных в течение дня («добавь…», «надо…», «не забыть…») → tasks.
- add_lead: заявка от потенциального клиента (имя, откуда пришёл, что хочет) → lead. consult_date вычисли от сегодняшней даты, если назван день созвона.
- evening_report: отчёт о сделанном за день («сделал то-то…»).
- weekly_metrics: ответ на воскресный опрос метрик («заявок 3, роликов 5, IG 8600, TG 410») → metrics. leads=заявки, reels=ролики/рилсы, ig=подписчики Instagram, tg=подписчики Telegram, clients=новые клиенты. Бери только названные числа, остальные опускай.
- post_to_channel: «запости в канал …» → post.text = текст поста. Если назван срок («завтра в 10», «сегодня в 18:30») → post.when в формате YYYY-MM-DDTHH:MM (местное время Екатеринбурга), иначе when опусти (постим сразу после подтверждения).
- content_idea: «идея для рилса/поста/контента: …» → idea.title (короткий заголовок) и idea.text (полный текст идеи).
- question: вопрос о планах, задачах, системе.
- note: всё остальное, что стоит сохранить (мысль, заметка, ссылка).
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
  metrics?: {
    leads?: number | null;
    reels?: number | null;
    ig?: number | null;
    tg?: number | null;
    clients?: number | null;
    comment?: string | null;
  } | null;
  post?: { text?: string | null; when?: string | null } | null;
  idea?: { title?: string | null; text?: string | null } | null;
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

/** Gemini через OpenAI-совместимый endpoint: основная модель + фолбэк на flash-lite */
async function callLLM(env: Env, system: string, user: string): Promise<string> {
  let lastErr: unknown;
  for (const model of [MODEL, MODEL_FALLBACK]) {
    try {
      const res = await fetch(OPENAI_COMPAT_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.AI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          max_tokens: 1024,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      });
      if (!res.ok) {
        lastErr = new Error(`Gemini(${model}) → ${res.status}: ${(await res.text()).slice(0, 200)}`);
        continue;
      }
      const data: any = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (typeof content === "string" && content.trim()) return content;
      lastErr = new Error(`Gemini(${model}) пустой ответ`);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Gemini недоступен");
}

export async function classify(env: Env, text: string, dialogContext?: string): Promise<BrainResult | null> {
  let system = `${PERSONA}\n\nСегодня: ${todayLabel()}, ${todayISO()}.\n\n${CLASSIFY_RULES}`;
  if (dialogContext) {
    system += `\n\nПоследние сообщения диалога (для связности «перенеси», «да, второе» и т.п.):\n${dialogContext}`;
  }
  return extractJSON<BrainResult>(await callLLM(env, system, text));
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
  return extractJSON<ReportMatch>(await callLLM(env, system, report));
}

/** Распознавание голосового через нативный Gemini endpoint (аудио понимается без отдельного STT) */
export async function transcribeAudio(env: Env, audio: ArrayBuffer, mimeType = "audio/ogg"): Promise<string> {
  const body = {
    contents: [
      {
        parts: [
          { inline_data: { mime_type: mimeType, data: bufferToBase64(audio) } },
          { text: "Расшифруй аудио дословно на русском. Верни только текст." },
        ],
      },
    ],
  };
  let lastErr: unknown;
  for (const model of [MODEL, MODEL_FALLBACK]) {
    try {
      const res = await fetch(`${NATIVE_URL(model)}?key=${env.AI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        lastErr = new Error(`Gemini audio(${model}) → ${res.status}: ${(await res.text()).slice(0, 200)}`);
        continue;
      }
      const data: any = await res.json();
      const text = (data.candidates?.[0]?.content?.parts ?? [])
        .map((p: any) => p.text ?? "")
        .join("")
        .trim();
      if (text) return text;
      lastErr = new Error(`Gemini audio(${model}) пустая расшифровка`);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Распознавание аудио недоступно");
}

/** ArrayBuffer → base64 чанками (без переполнения стека на крупных файлах) */
function bufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}
