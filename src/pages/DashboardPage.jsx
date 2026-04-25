import { Link } from 'react-router-dom';
import { useCharacterStore } from '../store/useCharacterStore';
import { useQuestStore } from '../store/useQuestStore';
import { useWalletStore } from '../store/useWalletStore';
import { useAchievementsStore } from '../store/useAchievementsStore';
import { useEventLogStore } from '../store/useEventLogStore';
import { getProgressToNextLevel, getRank, getStreakMultiplier, getSeasonDay } from '../lib/xp';
import { STATS, ACHIEVEMENTS, getStatTier } from '../lib/constants';
import { todayKey } from '../lib/dates';
import Avatar from '../components/Avatar';
import StreakBadge from '../components/StreakBadge';
import BossCard from '../features/quests/BossCard';
import QuestCard from '../features/quests/QuestCard';

const QUOTES = [
  'Дисциплина — это мост между целью и результатом.',
  'Маленькие шаги. Каждый день.',
  'Ты строишь не привычку — ты строишь себя.',
  'Сегодня тяжело. Завтра — гордишься.',
  'Терпение + Дисциплина = Результат.',
  'Каждый повтор делает тебя сильнее.',
  'Результат — это накопленная дисциплина.',
];

function StatBar({ stat, value }) {
  const tier = getStatTier(value);
  const pct  = Math.min(100, value);
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-xs text-text-secondary">{stat.label}</span>
        <div className="flex items-center gap-1.5">
          <span className="font-display font-black text-sm" style={{ color: stat.color }}>{value}</span>
          <span className="text-[10px] text-text-muted">{tier}</span>
        </div>
      </div>
      <div className="h-1 rounded-full bg-bg-border overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: stat.color }} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { name, avatar, totalXp, stats, streakDays } = useCharacterStore();
  const quests   = useQuestStore((s) => s.quests);
  const boss     = useQuestStore((s) => s.boss);
  const balance  = useWalletStore((s) => s.balance);
  const goal     = useWalletStore((s) => s.goal);
  const events   = useEventLogStore((s) => s.events);
  const unlocked = useAchievementsStore((s) => s.unlocked);

  const progress    = getProgressToNextLevel(totalXp);
  const rank        = getRank(progress.level);
  const today       = todayKey();
  const seasonDay   = getSeasonDay();
  const mult        = getStreakMultiplier(streakDays);
  const todayQuests = quests.filter((q) => q.dateKey === today);
  const doneToday   = todayQuests.filter((q) => q.completedAt).length;
  const walletPct   = goal > 0 ? Math.min(100, Math.round((balance / goal) * 100)) : 0;
  const todayEvents = events.filter((e) => new Date(e.ts).toDateString() === new Date().toDateString());
  const recentAch   = ACHIEVEMENTS.filter((a) => unlocked.includes(a.key)).slice(-2);
  const quoteIdx    = new Date().getDate() % QUOTES.length;

  return (
    <div className="space-y-5">

      {/* Season eyebrow + greeting */}
      <div>
        <div className="text-[11px] uppercase tracking-widest text-text-muted font-mono">
          ДЕНЬ {seasonDay} · СЕЗОН I «ПЕРЕКОВКА»
        </div>
        <h1 className="font-display text-3xl font-black mt-0.5">Поднимайся, {name}.</h1>
      </div>

      {/* Character hero card */}
      <div className="relative overflow-hidden rounded-3xl border border-bg-border bg-gradient-to-br from-bg-card via-bg-soft to-bg-base p-5">
        <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-brand-gold/10 blur-3xl" />
        <div className="relative flex gap-4 items-center">
          <Avatar name={name} src={avatar} size={72} level={progress.level} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="badge-gold text-[10px]">{rank}</span>
              <StreakBadge days={streakDays} showMultiplier />
              {mult > 1 && <span className="text-xs text-accent-green font-bold">×{mult} XP</span>}
            </div>
            <div className="mt-2.5">
              <div className="flex justify-between text-[11px] text-text-muted mb-1">
                <span>Уровень {progress.level}</span>
                <span>{progress.current.toLocaleString('ru')} / {progress.needed.toLocaleString('ru')} XP</span>
              </div>
              <div className="xp-bar-track h-2">
                <div className="xp-bar-fill h-full" style={{ width: `${progress.percent}%` }} />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 text-[11px] text-text-muted italic text-center border-t border-bg-border pt-3">
          «{QUOTES[quoteIdx]}»
        </div>
      </div>

      {/* Stats grid */}
      <div className="card p-5">
        <div className="text-[10px] uppercase tracking-widest text-text-muted mb-3">Характеристики</div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          {STATS.map((stat) => (
            <StatBar key={stat.key} stat={stat} value={stats[stat.key] || 0} />
          ))}
        </div>
      </div>

      {/* 2-col: quests + хроника */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* Today's quests */}
        <div className="card p-5">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-text-muted">Квесты дня</div>
              <div className="font-display font-black text-lg mt-0.5">
                {doneToday}/{todayQuests.length}
                <span className="text-text-muted font-normal text-sm ml-2">выполнено</span>
              </div>
            </div>
            <Link to="/quests" className="text-[11px] text-brand-gold hover:underline shrink-0">Все →</Link>
          </div>
          {todayQuests.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-6">Квесты генерируются...</p>
          ) : (
            <div className="space-y-2">
              {todayQuests.slice(0, 4).map((q) => <QuestCard key={q.id} quest={q} />)}
            </div>
          )}
        </div>

        {/* Хроника */}
        <div className="card p-5">
          <div className="text-[10px] uppercase tracking-widest text-text-muted mb-3">Хроника дня</div>
          {todayEvents.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-6">Пока тихо. Начни первый квест!</p>
          ) : (
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {todayEvents.map((e) => (
                <div key={e.id} className="flex items-start justify-between gap-2 text-xs">
                  <div className="text-text-secondary leading-relaxed">{e.message}</div>
                  {e.xp != null && <span className="text-brand-gold font-mono shrink-0 text-[11px]">+{e.xp}</span>}
                </div>
              ))}
            </div>
          )}
          {recentAch.length > 0 && (
            <div className="mt-3 pt-3 border-t border-bg-border space-y-1.5">
              <div className="text-[10px] uppercase tracking-widest text-text-muted">Последние ачивки</div>
              {recentAch.map((a) => (
                <div key={a.key} className="flex items-center gap-2 text-xs">
                  <span className="text-brand-gold">✦</span>
                  <span className="text-text-secondary">{a.title}</span>
                  <span className="text-brand-gold font-mono text-[10px] ml-auto">+{a.xpReward}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Boss + Wallet row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {boss && (
          <div>
            <div className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Недельный босс</div>
            <BossCard boss={boss} />
          </div>
        )}
        <div className="card p-5">
          <div className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Кошелёк</div>
          <div className="font-display font-black text-2xl text-brand-gold tabular-nums">
            {balance.toLocaleString('ru')} ₽
          </div>
          <div className="text-xs text-text-muted mt-1">Цель: {goal.toLocaleString('ru')} ₽</div>
          <div className="mt-2.5 h-1.5 rounded-full bg-bg-border overflow-hidden">
            <div className="h-full rounded-full bg-brand-gold transition-all" style={{ width: `${walletPct}%` }} />
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-text-muted">
            <span>{walletPct}% от цели</span>
            <Link to="/wallet" className="text-brand-gold hover:underline">Детали →</Link>
          </div>
        </div>
      </div>

    </div>
  );
}
