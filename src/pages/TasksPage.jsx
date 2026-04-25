import { useMemo, useState } from 'react';
import { ListChecks, Target, Plus, Inbox } from 'lucide-react';
import { useTasksStore } from '../store/useTasksStore';
import { useUiStore } from '../store/useUiStore';
import TaskItem from '../features/tasks/TaskItem';
import GoalItem from '../features/tasks/GoalItem';
import QuickAddModal from '../features/tasks/QuickAddModal';

const FILTERS = [
  { key: 'active', label: 'Активные' },
  { key: 'done',   label: 'Выполненные' },
  { key: 'all',    label: 'Все' },
];

export default function TasksPage() {
  const tasks    = useTasksStore((s) => s.tasks);
  const goals    = useTasksStore((s) => s.goals);
  const openModal = useUiStore((s) => s.openModal);
  const [filter, setFilter] = useState('active');

  const filtered = useMemo(() => {
    if (filter === 'active') return tasks.filter((t) => !t.completedAt);
    if (filter === 'done')   return tasks.filter((t) =>  t.completedAt);
    return tasks;
  }, [tasks, filter]);

  const todayXp = useMemo(() => {
    const start = new Date(); start.setHours(0,0,0,0);
    return tasks.filter((t) => t.completedAt && t.completedAt >= start.getTime()).reduce((s, t) => s + t.xp, 0);
  }, [tasks]);

  const add = () => openModal('Добавить', <QuickAddModal />);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-black sm:text-3xl">Задачи и Цели</h1>
          <p className="mt-1 text-sm text-text-muted">
            Сегодня заработано{' '}
            <span className="font-bold text-brand-gold">{todayXp} XP</span>
          </p>
        </div>
        <button onClick={add} className="btn-primary self-start sm:self-auto">
          <Plus className="h-4 w-4" /> Добавить
        </button>
      </div>

      {/* Tasks */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
            <ListChecks className="h-4 w-4" /> Задачи
          </h2>
          <div className="inline-flex rounded-xl border border-bg-border bg-bg-soft p-0.5 text-xs">
            {FILTERS.map((f) => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`rounded-lg px-3 py-1 font-semibold transition ${filter === f.key ? 'bg-brand-gold/20 text-brand-gold' : 'text-text-secondary hover:text-white'}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0
          ? <Empty icon={<Inbox className="h-6 w-6" />} title="Нет задач" hint="Нажми «Добавить»" onAdd={add} />
          : <div className="space-y-2">{filtered.map((t) => <TaskItem key={t.id} task={t} />)}</div>
        }
      </section>

      {/* Goals */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
          <Target className="h-4 w-4" /> Цели
        </h2>
        {goals.length === 0
          ? <Empty icon={<Target className="h-6 w-6" />} title="Нет целей" hint="Разбей большую задачу на шаги" onAdd={add} />
          : <div className="space-y-3">{goals.map((g) => <GoalItem key={g.id} goal={g} />)}</div>
        }
      </section>
    </div>
  );
}

function Empty({ icon, title, hint, onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-bg-border bg-bg-soft/40 px-4 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-bg-hover text-text-muted mb-3">{icon}</div>
      <div className="font-semibold text-sm">{title}</div>
      <div className="text-xs text-text-muted mt-1">{hint}</div>
      <button onClick={onAdd} className="btn-primary mt-4">
        <Plus className="h-4 w-4" /> Добавить
      </button>
    </div>
  );
}
