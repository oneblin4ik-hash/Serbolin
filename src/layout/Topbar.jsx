import { useState, useEffect, useRef, useMemo } from 'react';
import { Menu, Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useUiStore } from '../store/useUiStore';
import { useCharacterStore } from '../store/useCharacterStore';
import { useQuestStore } from '../store/useQuestStore';
import { useContentStore } from '../store/useContentStore';
import { getProgressToNextLevel } from '../lib/xp';
import { formatLongDate, todayKey } from '../lib/dates';

const CRUMBS = {
  '/dashboard':  'Главная',
  '/character':  'Персонаж',
  '/quests':     'Квесты',
  '/workouts':   'Тренировки',
  '/content':    'Контент-план',
  '/crm':        'Личная база',
  '/wallet':     'Кошелёк',
  '/analytics':  'Аналитика',
};

function useNotifications() {
  const { streakDays, lastQuestDay, totalXp } = useCharacterStore();
  const quests = useQuestStore((s) => s.quests);
  const boss   = useQuestStore((s) => s.boss);
  const posts  = useContentStore((s) => s.posts);

  return useMemo(() => {
    const today  = todayKey();
    const result = [];

    // 🔥 Streak at risk
    if (streakDays > 0 && lastQuestDay !== today) {
      result.push({
        id: 'streak', icon: '🔥', type: 'warning',
        text: `Стрик ${streakDays} ${streakDays === 1 ? 'день' : 'дней'} под угрозой! Выполни квест сегодня.`,
      });
    }

    // 📤 Posts ready to publish
    const readyPosts = posts.filter((p) => p.status === 'ready').length;
    if (readyPosts > 0) {
      result.push({
        id: 'posts', icon: '📤', type: 'info',
        text: `${readyPosts} ${readyPosts === 1 ? 'пост готов' : 'постов готово'} к публикации.`,
      });
    }

    // ⚡ Close to next level (≥ 80%)
    const progress = getProgressToNextLevel(totalXp);
    if (progress.percent >= 80 && progress.level < 10) {
      const left = progress.needed - progress.current;
      result.push({
        id: 'level', icon: '⚡', type: 'success',
        text: `Ещё ${left.toLocaleString('ru')} XP — и ${progress.level + 1}-й уровень!`,
      });
    }

    // 👹 Active boss
    if (boss && !boss.completedAt) {
      const done = quests.filter((q) => q.completedAt).length;
      const need = boss.targets?.quests || 0;
      if (need > 0) {
        result.push({
          id: 'boss', icon: '👹', type: 'info',
          text: `Босс «${boss.title}»: ${Math.min(done, need)}/${need} квестов.`,
        });
      }
    }

    // 🎯 No quests done today
    const todayDone = quests.filter((q) => q.completedAt && q.dateKey === today).length;
    if (todayDone === 0 && quests.filter((q) => q.dateKey === today).length > 0) {
      result.push({
        id: 'noquest', icon: '🎯', type: 'info',
        text: 'Сегодня ещё ни одного выполненного квеста. Начни прямо сейчас!',
      });
    }

    return result;
  }, [streakDays, lastQuestDay, totalXp, quests, boss, posts]);
}

const TYPE_STYLES = {
  warning: 'border-l-2 border-accent-red/60 bg-accent-red/5',
  success: 'border-l-2 border-accent-green/60 bg-accent-green/5',
  info:    'border-l-2 border-brand-gold/40 bg-brand-gold/5',
};

export default function Topbar() {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const location      = useLocation();
  const [now, setNow] = useState(new Date());
  const [open, setOpen]   = useState(false);
  const [seen, setSeen]   = useState(0);
  const bellRef           = useRef(null);
  const notifications     = useNotifications();

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const unread = Math.max(0, notifications.length - seen);

  const handleBell = () => {
    if (!open) setSeen(notifications.length);
    setOpen((v) => !v);
  };

  const crumb = CRUMBS[location.pathname] || 'SSS';

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-bg-border bg-bg-base/80 px-4 backdrop-blur-xl sm:px-6">
      <button onClick={toggleSidebar} className="btn-ghost !px-2 lg:hidden" aria-label="Меню">
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-widest text-text-muted">{formatLongDate(now)}</div>
        <div className="truncate font-display text-sm font-bold">{crumb}</div>
      </div>

      {/* Notifications bell */}
      <div ref={bellRef} className="relative">
        <button
          onClick={handleBell}
          className={`relative btn-ghost !px-2 transition-colors ${open ? 'text-brand-gold' : ''}`}
          aria-label="Уведомления"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent-red text-[9px] font-bold text-white">
              {unread}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-bg-border bg-bg-card shadow-2xl overflow-hidden z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-bg-border">
              <span className="text-sm font-semibold">Уведомления</span>
              <span className="text-[10px] text-text-muted">{notifications.length}</span>
            </div>
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-text-muted">
                Всё в порядке 👌
              </div>
            ) : (
              <div className="divide-y divide-bg-border max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className={`flex gap-3 px-4 py-3 ${TYPE_STYLES[n.type] || ''}`}>
                    <span className="text-lg shrink-0 leading-tight">{n.icon}</span>
                    <p className="text-xs text-text-secondary leading-relaxed">{n.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
