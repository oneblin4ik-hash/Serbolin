import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShieldHalf, Wallet, Users, CalendarDays, ListChecks, Flag, Sparkles, Dumbbell, Rocket, LogOut } from 'lucide-react';
import { useCharacterStore } from '../store/useCharacterStore';
import { useQuestStore } from '../store/useQuestStore';
import { useAuthStore } from '../store/useAuthStore';
import { useUiStore } from '../store/useUiStore';
import { getProgressToNextLevel, getRank } from '../lib/xp';
import Avatar from '../components/Avatar';
import StreakBadge from '../components/StreakBadge';

const NAV = [
  { to: '/dashboard',  label: 'Главная',       icon: LayoutDashboard },
  { to: '/character',  label: 'Персонаж',      icon: ShieldHalf,   showLevel: true },
  { to: '/tasks',      label: 'Задачи и Цели', icon: ListChecks },
  { to: '/quests',     label: 'Квесты',        icon: Flag,         showQuestCount: true },
  { to: '/workouts',   label: 'Тренировки',    icon: Dumbbell },
  { to: '/content',    label: 'Контент-план',  icon: CalendarDays },
  { to: '/projects',   label: 'Проекты',       icon: Rocket },
  { to: '/crm',        label: 'Личная база',   icon: Users },
  { to: '/finance',    label: 'Финансы',       icon: Wallet },
];

export default function Sidebar() {
  const { name, avatar, totalXp, streakDays } = useCharacterStore();
  const quests       = useQuestStore((s) => s.quests);
  const closeSidebar = useUiStore((s) => s.closeSidebar);
  const sidebarOpen  = useUiStore((s) => s.sidebarOpen);
  const logout       = useAuthStore((s) => s.logout);

  const progress       = getProgressToNextLevel(totalXp);
  const pendingQuests  = quests.filter((q) => !q.completedAt && q.dateKey === new Date().toISOString().slice(0, 10)).length;

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-bg-border bg-bg-soft transition-transform duration-200 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-bg-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-gold-dim to-brand-gold shadow-glow-sm">
          <Sparkles className="h-5 w-5 text-bg-base" />
        </div>
        <div>
          <div className="font-display text-sm font-bold tracking-tight text-text-primary">SSS</div>
          <div className="text-[10px] text-text-muted">Система Серболина</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3 py-3 overflow-y-auto">
        {NAV.map(({ to, label, icon: Icon, showLevel, showQuestCount }) => (
          <NavLink
            key={to}
            to={to}
            onClick={closeSidebar}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${isActive ? 'nav-active' : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'}`
            }
          >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            <span className="flex-1 truncate">{label}</span>
            {showLevel && (
              <span className="badge-gold text-[10px]">Lv {progress.level}</span>
            )}
            {showQuestCount && pendingQuests > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-gold/20 text-[10px] font-bold text-brand-gold">
                {pendingQuests}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Character mini card */}
      <div className="m-3 rounded-xl border border-bg-border bg-bg-card p-3">
        <div className="flex items-center gap-2.5">
          <Avatar name={name} src={avatar} size={38} level={progress.level} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="truncate text-sm font-semibold">{name}</span>
              <StreakBadge days={streakDays} />
            </div>
            <div className="mt-1 text-[10px] text-text-muted">{getRank(progress.level)}</div>
            <div className="xp-bar-track mt-1.5">
              <div className="xp-bar-fill" style={{ width: `${progress.percent}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="flex items-center gap-2 px-5 py-3 text-xs text-text-muted hover:text-text-primary border-t border-bg-border transition-colors"
      >
        <LogOut className="h-3.5 w-3.5" />
        Выйти
      </button>
    </aside>
  );
}
