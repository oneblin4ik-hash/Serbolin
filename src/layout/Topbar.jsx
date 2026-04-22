import { useState, useEffect } from 'react';
import { Menu, Plus } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useUiStore } from '../store/useUiStore';
import { formatLongDate } from '../lib/dates';

const CRUMBS = {
  '/tasks':     'Задачи и Цели',
  '/character': 'Персонаж',
  '/dashboard': 'Главная',
  '/finance':   'Финансы',
  '/crm':       'CRM / Лиды',
  '/content':   'Контент-план',
  '/quests':    'Квесты дня',
};

export default function Topbar() {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const location      = useLocation();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

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
    </header>
  );
}
