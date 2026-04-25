import { useMemo } from 'react';
import { addDays, startOfWeek, format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useCharacterStore } from '../store/useCharacterStore';
import { useWorkoutsStore } from '../store/useWorkoutsStore';
import { useContentStore } from '../store/useContentStore';
import { useBodyStore } from '../store/useBodyStore';
import { useEventLogStore } from '../store/useEventLogStore';
import { useAchievementsStore } from '../store/useAchievementsStore';
import { getProgressToNextLevel, getRank, getSeasonDay } from '../lib/xp';
import { STATS, ACHIEVEMENTS, PLATFORMS, POST_STATUSES, getStatTier } from '../lib/constants';
import { todayKey } from '../lib/dates';

// ─── SVG Line Chart ───────────────────────────────────────────────────────────
function LineChart({ data, color = '#D4A843', gradId = 'lc' }) {
  if (!data || data.length < 2) {
    return <div className="h-20 flex items-center justify-center text-xs text-text-muted">Недостаточно данных</div>;
  }
  const W = 280, H = 72, PT = 8, PB = 16, PL = 4, PR = 4;
  const iW = W - PL - PR;
  const iH = H - PT - PB;
  const vals = data.map((d) => d.value);
  const max  = Math.max(...vals, 1);
  const step = iW / (data.length - 1);

  const pts = data.map((d, i) => ({
    x: PL + i * step,
    y: PT + iH - (d.value / max) * iH,
  }));

  const line = pts.map((p) => `${p.x},${p.y}`).join(' ');
  const area = `${PL},${PT + iH} ${line} ${PL + iW},${PT + iH}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full" style={{ height: H }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gradId})`} />
      <polyline points={line} fill="none" stroke={color} strokeWidth="1.8"
        strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => vals[i] > 0 && (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={color} />
      ))}
      {/* X-axis labels — every 3rd day */}
      {data.map((d, i) => i % 3 === 0 && (
        <text key={i} x={pts[i].x} y={H - 2} textAnchor="middle"
          style={{ fontSize: 7, fill: '#666', fontFamily: 'monospace' }}>
          {d.label}
        </text>
      ))}
    </svg>
  );
}

// ─── Activity Heatmap (last 8 weeks) ─────────────────────────────────────────
function Heatmap({ activityMap }) {
  const today     = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const gridStart = addDays(weekStart, -7 * 7); // 8 weeks back

  const weeks = useMemo(() => {
    const w = [];
    for (let wi = 0; wi < 8; wi++) {
      const week = [];
      for (let di = 0; di < 7; di++) {
        const d   = addDays(gridStart, wi * 7 + di);
        const key = format(d, 'yyyy-MM-dd');
        week.push({ key, count: activityMap[key] || 0, day: d });
      }
      w.push(week);
    }
    return w;
  }, [activityMap]);

  const cellColor = (c) =>
    c === 0 ? 'bg-bg-border' :
    c <= 1  ? 'bg-brand-gold/25' :
    c <= 3  ? 'bg-brand-gold/55' :
              'bg-brand-gold';

  const DOW = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <div className="flex gap-1.5">
      {/* Day labels */}
      <div className="flex flex-col gap-1 pt-[18px]">
        {DOW.map((d) => (
          <div key={d} className="h-3 text-[8px] text-text-muted leading-3">{d}</div>
        ))}
      </div>
      {/* Weeks */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              <div className="h-4 text-[8px] text-text-muted text-center leading-4 whitespace-nowrap">
                {format(week[0].day, 'd MMM', { locale: ru })}
              </div>
              {week.map((day) => (
                <div
                  key={day.key}
                  title={`${day.key} · ${day.count} событий`}
                  className={`h-3 w-3 rounded-[2px] transition-colors ${cellColor(day.count)}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Horizontal bar ───────────────────────────────────────────────────────────
function HBar({ label, value, max, color, sublabel }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-xs text-text-secondary">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold" style={{ color }}>{value}</span>
          {sublabel && <span className="text-[10px] text-text-muted">{sublabel}</span>}
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-bg-border overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = '#D4A843' }) {
  return (
    <div className="card p-4 text-center">
      <div className="font-display font-black text-2xl tabular-nums" style={{ color }}>{value}</div>
      <div className="text-xs font-semibold text-text-secondary mt-0.5">{label}</div>
      {sub && <div className="text-[10px] text-text-muted mt-0.5">{sub}</div>}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { totalXp, stats, streakDays } = useCharacterStore();
  const workouts     = useWorkoutsStore((s) => s.workouts);
  const posts        = useContentStore((s) => s.posts);
  const measurements = useBodyStore((s) => s.measurements);
  const events       = useEventLogStore((s) => s.events);
  const unlocked     = useAchievementsStore((s) => s.unlocked);

  const progress  = getProgressToNextLevel(totalXp);
  const rank      = getRank(progress.level);
  const seasonDay = getSeasonDay();

  // ── XP by day (last 14 days) ──────────────────────────────────────────────
  const xpByDay = useMemo(() => {
    const map = {};
    events.forEach((e) => {
      if (!e.xp) return;
      const k = new Date(e.ts).toISOString().slice(0, 10);
      map[k] = (map[k] || 0) + e.xp;
    });
    const result = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      result.push({ label: String(d.getDate()), value: map[k] || 0 });
    }
    return result;
  }, [events]);

  const activeDaysCount = useMemo(() => {
    const s = new Set(events.map((e) => new Date(e.ts).toISOString().slice(0, 10)));
    return s.size;
  }, [events]);

  // ── Activity map for heatmap ───────────────────────────────────────────────
  const activityMap = useMemo(() => {
    const map = {};
    events.forEach((e) => {
      const k = new Date(e.ts).toISOString().slice(0, 10);
      map[k] = (map[k] || 0) + 1;
    });
    workouts.forEach((w) => {
      map[w.date] = (map[w.date] || 0) + 2;
    });
    return map;
  }, [events, workouts]);

  // ── Workouts last 4 weeks ─────────────────────────────────────────────────
  const workoutMap = useMemo(() => {
    const s = new Set(workouts.map((w) => w.date));
    return s;
  }, [workouts]);

  const last28 = useMemo(() => {
    const days = [];
    for (let i = 27; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      days.push({ key: k, active: workoutMap.has(k), isToday: i === 0 });
    }
    return days;
  }, [workoutMap]);

  const workoutsLast30 = workouts.filter((w) => {
    const d = new Date(w.date);
    const ago30 = new Date(); ago30.setDate(ago30.getDate() - 30);
    return d >= ago30;
  }).length;

  // ── Content stats ─────────────────────────────────────────────────────────
  const publishedPosts = posts.filter((p) => p.status === 'published').length;
  const contentByPlatform = PLATFORMS.map((pl) => ({
    ...pl,
    count: posts.filter((p) => p.platform === pl.key && p.status === 'published').length,
  }));
  const contentByStatus = POST_STATUSES.map((s) => ({
    ...s,
    count: posts.filter((p) => p.status === s.key).length,
  }));
  const maxByPlatform = Math.max(...contentByPlatform.map((p) => p.count), 1);
  const maxByStatus   = Math.max(...contentByStatus.map((s) => s.count), 1);

  // ── Body weight chart ─────────────────────────────────────────────────────
  const weightData = useMemo(() => {
    return [...measurements]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14)
      .map((m) => ({
        label: m.date.slice(5),
        value: parseFloat(m.weight) || 0,
      }))
      .filter((d) => d.value > 0);
  }, [measurements]);

  // ── Stats tier display ────────────────────────────────────────────────────
  const maxStat = Math.max(10, ...Object.values(stats));

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <div className="text-[11px] uppercase tracking-widest text-text-muted">ДЕНЬ {seasonDay} · СЕЗОН I</div>
        <h1 className="font-display text-2xl font-black mt-0.5 sm:text-3xl">Аналитика</h1>
        <p className="text-xs text-text-muted mt-0.5">{rank} · Уровень {progress.level}</p>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Всего XP"        value={totalXp.toLocaleString('ru')}        color="#D4A843" sub={`Ур. ${progress.level}`} />
        <StatCard label="Активных дней"   value={activeDaysCount}                     color="#43A047" sub="за всё время" />
        <StatCard label="Стрик"           value={`${streakDays}д`}                    color="#E53935" sub="подряд" />
        <StatCard label="Достижений"      value={`${unlocked.length}/${ACHIEVEMENTS.length}`} color="#7C3AED" sub="открыто" />
      </div>

      {/* XP chart */}
      <div className="card p-5">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-text-muted">XP по дням</div>
            <div className="font-display font-black text-lg mt-0.5">
              {xpByDay.reduce((s, d) => s + d.value, 0).toLocaleString('ru')}
              <span className="text-text-muted font-normal text-sm ml-2">за 14 дней</span>
            </div>
          </div>
          <div className="text-[11px] text-text-muted text-right">
            <div className="font-bold text-brand-gold">{xpByDay.filter((d) => d.value > 0).length}</div>
            <div>активных</div>
          </div>
        </div>
        <LineChart data={xpByDay} color="#D4A843" gradId="xp-grad" />
      </div>

      {/* Heatmap */}
      <div className="card p-5">
        <div className="text-[10px] uppercase tracking-widest text-text-muted mb-4">Тепловая карта активности · 8 недель</div>
        <Heatmap activityMap={activityMap} />
        <div className="flex items-center gap-3 mt-3 justify-end">
          <span className="text-[10px] text-text-muted">Меньше</span>
          {['bg-bg-border', 'bg-brand-gold/25', 'bg-brand-gold/55', 'bg-brand-gold'].map((c) => (
            <div key={c} className={`h-3 w-3 rounded-[2px] ${c}`} />
          ))}
          <span className="text-[10px] text-text-muted">Больше</span>
        </div>
      </div>

      {/* Workouts + Content */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* Workouts */}
        <div className="card p-5">
          <div className="text-[10px] uppercase tracking-widest text-text-muted mb-1">Тренировки</div>
          <div className="font-display font-black text-2xl text-brand-gold mb-3">
            {workoutsLast30}
            <span className="text-text-muted font-normal text-sm ml-2">за 30 дней</span>
          </div>
          {/* Mini calendar grid */}
          <div className="text-[10px] text-text-muted mb-2">Последние 4 недели</div>
          <div className="grid grid-cols-7 gap-1">
            {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map((d) => (
              <div key={d} className="text-center text-[8px] text-text-muted">{d}</div>
            ))}
            {last28.map((d) => (
              <div
                key={d.key}
                title={d.key}
                className={`h-5 rounded-md transition-colors ${
                  d.active
                    ? 'bg-accent-red/80 border border-accent-red'
                    : d.isToday
                    ? 'border border-brand-gold/40 bg-transparent'
                    : 'bg-bg-border'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-3 mt-3">
            <div className="h-3 w-3 rounded bg-accent-red/80" />
            <span className="text-[10px] text-text-muted">Тренировка</span>
            <div className="h-3 w-3 rounded bg-bg-border ml-2" />
            <span className="text-[10px] text-text-muted">Отдых</span>
          </div>
        </div>

        {/* Content */}
        <div className="card p-5">
          <div className="text-[10px] uppercase tracking-widest text-text-muted mb-1">Контент</div>
          <div className="font-display font-black text-2xl text-brand-gold mb-3">
            {publishedPosts}
            <span className="text-text-muted font-normal text-sm ml-2">опубликовано</span>
          </div>
          <div className="space-y-2 mb-4">
            <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1">По платформам</div>
            {contentByPlatform.map((pl) => (
              <HBar key={pl.key} label={`${pl.icon} ${pl.label}`} value={pl.count} max={maxByPlatform} color={pl.color} sublabel="публик." />
            ))}
          </div>
          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1">По статусам</div>
            {contentByStatus.map((s) => (
              <HBar key={s.key} label={s.label} value={s.count} max={maxByStatus} color={s.dot} />
            ))}
          </div>
        </div>
      </div>

      {/* Characteristics */}
      <div className="card p-5">
        <div className="text-[10px] uppercase tracking-widest text-text-muted mb-4">Характеристики героя</div>
        <div className="space-y-3">
          {STATS.map((stat) => {
            const value = stats[stat.key] || 0;
            const tier  = getStatTier(value);
            const pct   = Math.min(100, Math.round((value / Math.max(maxStat, 10)) * 100));
            return (
              <div key={stat.key}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold">{stat.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-black text-lg" style={{ color: stat.color }}>{value}</span>
                    <span className="text-[10px] font-bold text-text-muted">{tier.toUpperCase()}</span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-bg-border overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: stat.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Body weight chart */}
      {weightData.length >= 2 && (
        <div className="card p-5">
          <div className="text-[10px] uppercase tracking-widest text-text-muted mb-1">Динамика веса</div>
          <div className="font-display font-black text-lg text-text-primary mb-3">
            {weightData[weightData.length - 1].value} кг
            {weightData.length > 1 && (
              <span className={`text-sm font-normal ml-2 ${
                weightData[weightData.length - 1].value >= weightData[0].value ? 'text-accent-green' : 'text-accent-red'
              }`}>
                {weightData[weightData.length - 1].value >= weightData[0].value ? '+' : ''}
                {(weightData[weightData.length - 1].value - weightData[0].value).toFixed(1)} кг
              </span>
            )}
          </div>
          <LineChart data={weightData} color="#43A047" gradId="weight-grad" />
        </div>
      )}

      {/* Recent workouts list */}
      {workouts.length > 0 && (
        <div className="card p-5">
          <div className="text-[10px] uppercase tracking-widest text-text-muted mb-3">Последние тренировки</div>
          <div className="space-y-2">
            {workouts.slice(0, 5).map((w) => (
              <div key={w.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">{w.title}</span>
                  <span className="text-text-muted text-xs ml-2">{w.date}</span>
                </div>
                <span className="badge-gold text-[10px]">+{w.xp} XP</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
