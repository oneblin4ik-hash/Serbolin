import { TZ_OFFSET_HOURS } from "./config";

// Индексация по Date.getUTCDay() для даты, сдвинутой на смещение TZ
const WEEKDAYS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

/** Текущее время Екатеринбурга, упакованное в UTC-поля Date */
export function nowLocal(): Date {
  return new Date(Date.now() + TZ_OFFSET_HOURS * 3_600_000);
}

export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function todayISO(): string {
  return toISODate(nowLocal());
}

export function tomorrowISO(): string {
  return toISODate(new Date(nowLocal().getTime() + 86_400_000));
}

export function weekdayShort(d: Date = nowLocal()): string {
  return WEEKDAYS[d.getUTCDay()];
}

export function weekdayShortISO(iso: string): string {
  return WEEKDAYS[new Date(`${iso}T00:00:00Z`).getUTCDay()];
}

/** «Пт, 13.06» для заголовка плана дня */
export function todayLabel(): string {
  const d = nowLocal();
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${weekdayShort(d)}, ${dd}.${mm}`;
}

/** «12», «12:00», «19.30» → «12:00» / «19:30», иначе null */
export function normTime(t?: string | null): string | null {
  if (!t) return null;
  const m = t.trim().match(/^(\d{1,2})(?:[:.](\d{2}))?$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = m[2] ?? "00";
  if (h > 23 || Number(min) > 59) return null;
  return `${String(h).padStart(2, "0")}:${min}`;
}
