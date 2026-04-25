import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

export function todayKey() {
  return format(new Date(), 'yyyy-MM-dd');
}

export function weekKey() {
  const now = new Date();
  const mon = startOfWeek(now, { weekStartsOn: 1 });
  return format(mon, 'yyyy-ww');
}

export function getWeekDays(referenceDate = new Date()) {
  const start = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const end   = endOfWeek(referenceDate,   { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

export function formatLongDate(date = new Date()) {
  return format(date, 'd MMMM yyyy, EEEE', { locale: ru });
}

export function formatShortDate(date) {
  return format(typeof date === 'string' ? parseISO(date) : date, 'd MMM', { locale: ru });
}

export function formatMonthYear(date = new Date()) {
  return format(date, 'LLLL yyyy', { locale: ru });
}

export { isToday, isSameDay, format, parseISO };
