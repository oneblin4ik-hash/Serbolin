import { Link } from 'react-router-dom';
import { Trophy, Flame, Flag, CalendarDays, ListChecks } from 'lucide-react';
import { useCharacterStore } from '../store/useCharacterStore';
import { useQuestStore } from '../store/useQuestStore';
import { useTasksStore } from '../store/useTasksStore';
import { useAchievementsStore } from '../store/useAchievementsStore';
import { getProgressToNextLevel, getRank, getStreakMultiplier } from '../lib/xp';
import { todayKey } from '../lib/dates';
import { ACHIEVEMENTS } from '../lib/constants';
import Avatar from '../components/Avatar';
import StreakBadge from '../components/StreakBadge';
import BossCard from '../features/quests/BossCard';

export default function DashboardPage() {
  const { name, avatar, totalXp, streakDays, stats } = useCharacterStore();
  const quests   = useQuestStore((s) => s.quests);
  const boss     = useQuestStore((s) => s.boss);
  const tasks    = useTasksStore((s) => s.tasks);
  const unlocked = useAchievementsStore((s) => s.unlocked);

  const progress   = getProgressToNextLevel(totalXp);
  const rank       = getRank(progress.level);
  const today      = todayKey();
  const todayQuests = quests.filter((q) => q.dateKey === today);
  const doneQuests  = todayQuests.filter((q) => q.completedAt).length;
  const todayXp     = tasks.filter((t) => t.completedAt && t.completedAt > new Date().setHours(0,0,0,0)).reduce((s, t) => s + t.xp, 0);
  const mult        = getStreakMultiplier(streakDays);
  const recentAch   = ACHIEVEMENTS.filter((a) => unlocked.includes(a.key)).slice(-3);

  return (
    <div className="space-y-6">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-bg-border bg-gradient-to-br from-bg-card to-bg-soft p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-gold/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar name={name} src={avatar} size={80} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-2xl font-black text-text-primary">{name}</h1>
              <StreakBadge days={streakDays} showMultiplier />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="badge-gold">{rank}</span>
              <span className="text-xs text-text-muted">Уровень {progress.level}</span>
              {mult > 1 && <span className="text-xs text-accent-green font-semibold">×{mult} XP</span>}
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-[11px] text-text-muted mb-1.5">
                <span>До уровня {progress.level + 1}</span>
                <span>{progress.current} / {progress.needed} XP</span>
              </div>
              <div className="xp-bar-track h-2.5">
                <div className="xp-bar-fill h-full" style={{ width: `${progress.percent}%` }} />
              </div>
              <div className="mt-2 text-[11px] text-text-muted flex items-center gap-1">
                <Trophy className="h-3 w-3 text-brand-gold" />
                Всего заработано: {totalXp.toLocaleString('ru')} XP
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Квестов сегодня', value: `${doneQuests}/${todayQuests.length}`, icon: Flag, color: 'text-brand-gold' },
          { label: 'XP сегодня', value: `+${todayXp}`, icon: Trophy, color: 'text-accent-green' },
          { label: 'Страйк дней', value: streakDays, icon: Flame, color: 'text-accent-red' },
          { label: 'Задач активно', value: tasks.filter((t) => !t.completedAt).length, icon: ListChecks, color: 'text-accent-blue' },
        ].map((item) => (
          <div key={item.label} className="card p-4">
            <item.icon className={`h-4 w-4 mb-2 ${item.color}`} />
            <div className="font-display text-xl font-black text-text-primary">{item.value}</div>
            <div className="text-[11px] text-text-muted mt-0.5">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Boss */}
      {boss && (
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Недельный босс</h2>
          <BossCard boss={boss} />
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { to: '/quests',  label: 'Квесты дня',   emoji: '🎯', desc: `${doneQuests}/${todayQuests.length} выполнено` },
          { to: '/content', label: 'Контент-план',  emoji: '📅', desc: 'Запланировать посты' },
          { to: '/tasks',   label: 'Задачи и Цели', emoji: '✅', desc: `${tasks.filter((t) => !t.completedAt).length} активных` },
          { to: '/character', label: 'Персонаж',    emoji: '⚔️', desc: `Уровень ${progress.level} • ${rank}` },
        ].map((link) => (
          <Link key={link.to} to={link.to} className="card-hover p-4 block">
            <div className="text-2xl mb-2">{link.emoji}</div>
            <div className="font-semibold text-sm text-text-primary">{link.label}</div>
            <div className="text-[11px] text-text-muted mt-0.5">{link.desc}</div>
          </Link>
        ))}
      </div>

      {/* Recent achievements */}
      {recentAch.length > 0 && (
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Последние ачивки</h2>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {recentAch.map((a) => (
              <div key={a.key} className="flex shrink-0 items-center gap-2 rounded-xl border border-brand-gold/20 bg-brand-gold/5 px-3 py-2">
                <span className="text-lg">{a.emoji}</span>
                <div>
                  <div className="text-xs font-bold text-text-primary">{a.title}</div>
                  <div className="text-[10px] text-text-muted">+{a.xpReward} XP</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
