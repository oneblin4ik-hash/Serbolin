export interface Env {
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_WEBHOOK_SECRET: string;
  ANTHROPIC_API_KEY: string;
  NOTION_TOKEN: string;
  /** Опциональный KV: контекст диалога + ожидание ответа «перенести/снять» */
  LUTIK_CONTEXT?: KVNamespace;
}

export const OWNER_CHAT_ID = 708122486; // Эдуард — единственный пользователь
export const CHANNEL_ID = -1002095605776; // канал «Mr. Serbolin» (для v2)
export const TZ_OFFSET_HOURS = 5; // Asia/Yekaterinburg, UTC+5

export const DB = {
  tasks: "352c40a0-012d-4291-9466-e4fb5a54bfff",
  projects: "985d3bd8-0283-4c00-908a-fd82a1fd6909",
  goals: "4ba017b4-8d10-452c-ba23-c6dd3410c58b",
  habits: "0abd84f8-0101-4e78-b833-fe9b5192b079",
  habitLog: "f8c1c0b7-009d-43c0-8960-a788dd4a6ce8",
  leads: "2ee5c7ba-eaf1-40c1-8003-350b74d93eaf",
  knowledge: "84d7d59d-b401-4a9d-b0c8-03b81e718c22",
  spheres: "3f38f104-a501-4240-8fd0-76c318e9cbfb",
} as const;

export const SPHERES: Record<string, string> = {
  "работа": "37a481b9-598e-8165-ba5a-c135db540e4d", // Работа / клиенты / тренерство
  "контент": "37a481b9-598e-819e-a72c-e5de9fb1167c", // Контент и соцсети
  "финансы": "37a481b9-598e-81c1-953e-d6294f242bf0", // Финансы и деньги
  "здоровье": "37a481b9-598e-81f6-97f0-e6fdb7677296", // Здоровье и тренировки
  "семья": "37a481b9-598e-811a-a108-e3a8db65b58d", // Семья и отношения
  "обучение": "37a481b9-598e-81b1-b092-d5b5e1509e58", // Обучение и саморазвитие
};

export const PRIORITIES = ["Высокий", "Средний", "Низкий"];
export const LEAD_SOURCES = ["Instagram", "Telegram", "YouTube", "ВКонтакте", "Рекомендация", "Другое"];
export const LEAD_INTERESTS = ["Ведение 25к", "Программа", "План питания", "Не определён"];
