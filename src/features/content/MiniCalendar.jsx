import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addDays, subDays, format, isToday, isSameDay, parseISO, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useContentStore } from '../../store/useContentStore';
import { PLATFORMS } from '../../lib/constants';

const DAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export default function MiniCalendar({ onDayClick }) {
  const [anchor, setAnchor] = useState(new Date());
  const posts = useContentStore((s) => s.posts);

  const weekStart = startOfWeek(anchor, { weekStartsOn: 1 });
  const weekEnd   = endOfWeek(anchor,   { weekStartsOn: 1 });
  const days      = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const postsOnDay = (day) => posts.filter((p) => isSameDay(parseISO(p.date), day));

  return (
    <div className="card p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setAnchor(subDays(anchor, 7))} className="btn-ghost !px-2 !py-1">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="font-display text-sm font-bold capitalize">
          {format(weekStart, 'LLLL yyyy', { locale: ru })}
        </span>
        <button onClick={() => setAnchor(addDays(anchor, 7))} className="btn-ghost !px-2 !py-1">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold uppercase tracking-wider text-text-muted py-1">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dayPosts = postsOnDay(day);
          const today    = isToday(day);
          return (
            <button
              key={day.toISOString()}
              onClick={() => onDayClick?.(day)}
              className={`flex flex-col items-center rounded-xl p-1.5 min-h-[64px] transition-all hover:bg-bg-hover ${today ? 'bg-brand-gold/10 border border-brand-gold/30' : ''}`}
            >
              <span className={`text-xs font-bold mb-1 ${today ? 'text-brand-gold' : 'text-text-secondary'}`}>
                {format(day, 'd')}
              </span>
              <div className="flex flex-wrap gap-0.5 justify-center">
                {dayPosts.slice(0, 3).map((p) => {
                  const plat = PLATFORMS.find((pl) => pl.key === p.platform);
                  return (
                    <span key={p.id} title={`${plat?.label}: ${p.title || p.format}`} className="text-[10px]">
                      {plat?.icon}
                    </span>
                  );
                })}
                {dayPosts.length > 3 && <span className="text-[9px] text-text-muted">+{dayPosts.length - 3}</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Today button */}
      <div className="mt-3 text-center">
        <button onClick={() => setAnchor(new Date())} className="text-[11px] text-text-muted hover:text-brand-gold transition-colors">
          Сегодня
        </button>
      </div>
    </div>
  );
}
