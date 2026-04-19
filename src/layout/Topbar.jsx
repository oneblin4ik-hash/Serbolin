import { useEffect, useState } from 'react';
import { Menu, Plus, Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useUiStore } from '../store/useUiStore';
import { formatLongDate } from '../lib/dates';
import QuickAddModal from '../features/tasks/QuickAddModal';

const CRUMBS = {
  '/tasks': 'Задачи и Цели',
  '/character': 'Персонаж',
  '/dashboard': 'Главная',
  '/finance': 'Личный кабинет',
  '/crm': 'CRM / Лиды',
  '/content': 'Контент-план',
};

export default function Topbar() {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const openModal = useUiStore((s) => s.openModal);
  const location = useLocation();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const crumb = CRUMBS[location.pathname] || 'SSS';

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-bg-border/60 bg-bg-base/70 px-4 backdrop-blur-xl sm:px-8">
      <button
        onClick={toggleSidebar}
        className="btn-ghost !px-2 lg:hidden"
        aria-label="Меню"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        <div className="text-[11px] uppercase tracking-[0.14em] text-text-muted">
          {formatLongDate(now)}
        </div>
        <div className="truncate text-[15px] font-semibold tracking-tight">
          {crumb}
        </div>
      </div>

      <button
        onClick={() => openModal('Быстрое добавление', <QuickAddModal />)}
        className="btn-primary hidden sm:inline-flex"
      >
        <Plus className="h-4 w-4" />
        <span>Добавить</span>
      </button>
      <button
        onClick={() => openModal('Быстрое добавление', <QuickAddModal />)}
        className="btn-primary !px-3 sm:hidden"
        aria-label="Добавить"
      >
        <Plus className="h-5 w-5" />
      </button>

      <button className="btn-ghost !px-2.5 relative" aria-label="Уведомления">
        <Bell className="h-5 w-5" />
        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent-red" />
      </button>
    </header>
  );
}
