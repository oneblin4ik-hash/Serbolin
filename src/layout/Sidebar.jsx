import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldHalf,
  Wallet,
  Users,
  CalendarDays,
  ListChecks,
  Sparkles,
} from 'lucide-react';
import { useCharacterStore } from '../store/useCharacterStore';
import { useTasksStore } from '../store/useTasksStore';
import { useUiStore } from '../store/useUiStore';
import { getProgressToNextLevel } from '../lib/xp';
import Avatar from '../components/Avatar';

const NAV = [
  { to: '/dashboard', label: 'Главная', icon: LayoutDashboard },
  { to: '/character', label: 'Персонаж', icon: ShieldHalf, showLevel: true },
  { to: '/finance', label: 'Личный кабинет', icon: Wallet },
  { to: '/crm', label: 'CRM / Лиды', icon: Users },
  { to: '/content', label: 'Контент-план', icon: CalendarDays },
  { to: '/tasks', label: 'Задачи и Цели', icon: ListChecks, showActive: true },
];

export default function Sidebar() {
  const totalXp = useCharacterStore((s) => s.totalXp);
  const name = useCharacterStore((s) => s.name);
  const avatar = useCharacterStore((s) => s.avatar);
  const activeCount = useTasksStore((s) =>
    s.tasks.filter((t) => !t.completedAt).length
  );
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const closeSidebar = useUiStore((s) => s.closeSidebar);
  const progress = getProgressToNextLevel(totalXp);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-bg-border/60 bg-bg-soft/80 backdrop-blur-xl transition-transform duration-200 lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-5">
        <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-deep shadow-glow">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-bold tracking-tight">SSS</div>
          <div className="truncate text-xs text-text-secondary">
            Супер Система Серболина
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3">
        {NAV.map(({ to, label, icon: Icon, showLevel, showActive }) => (
          <NavLink
            key={to}
            to={to}
            onClick={closeSidebar}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-gradient-to-r from-brand/20 via-brand/10 to-transparent text-white shadow-[inset_0_0_0_1px_rgba(139,92,246,0.25)]'
                  : 'text-text-secondary hover:bg-bg-hover hover:text-white'
              }`
            }
          >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            <span className="flex-1 truncate">{label}</span>
            {showLevel && (
              <span className="rounded-md bg-brand/15 px-1.5 py-0.5 text-[10px] font-semibold text-brand-soft">
                Ур. {progress.level}
              </span>
            )}
            {showActive && activeCount > 0 && (
              <span className="rounded-md bg-bg-hover px-1.5 py-0.5 text-[10px] font-semibold text-text-primary">
                {activeCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Character mini card */}
      <div className="m-3 rounded-2xl border border-bg-border bg-bg-card/80 p-3">
        <div className="flex items-center gap-3">
          <Avatar name={name} src={avatar} size={40} />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-sm font-semibold">{name}</span>
              <span className="text-xs font-bold text-brand-soft">
                {progress.level}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-bg-border">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand to-accent-cyan transition-all duration-500"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <div className="mt-1 text-[10px] text-text-muted">
              {progress.current} / {progress.needed} XP
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
