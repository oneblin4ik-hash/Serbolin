import { useMemo, useState } from 'react';
import { ListChecks, Target, Plus, Inbox } from 'lucide-react';
import { useTasksStore } from '../store/useTasksStore';
import { useUiStore } from '../store/useUiStore';
import TaskItem from '../features/tasks/TaskItem';
import GoalItem from '../features/tasks/GoalItem';
import QuickAddModal from '../features/tasks/QuickAddModal';

const FILTERS = [
  { key: 'active', label: 'Активные' },
  { key: 'done', label: 'Выполненные' },
  { key: 'all', label: 'Все' },
];

export default function TasksPage() {
  const tasks = useTasksStore((s) => s.tasks);
  const goals = useTasksStore((s) => s.goals);
  const openModal = useUiStore((s) => s.openModal);
  const [filter, setFilter] = useState('active');

  const filteredTasks = useMemo(() => {
    if (filter === 'active') return tasks.filter((t) => !t.completedAt);
    if (filter === 'done') return tasks.filter((t) => t.completedAt);
    return tasks;
  }, [tasks, filter]);

  const add = () => openModal('Быстрое добавление', <QuickAddModal />);

  const todayXp = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return tasks
      .filter((t) => t.completedAt && t.completedAt >= start.getTime())
      .reduce((sum, t) => sum + t.xp, 0);
  }, [tasks]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Задачи и Цели
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Маленькие шаги → большие результаты. Сегодня заработано{' '}
            <span className="font-semibold text-brand-soft">{todayXp} XP</span>.
          </p>
        </div>
        <button onClick={add} className="btn-primary self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          Добавить
        </button>
      </div>

      {/* Tasks */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-text-secondary">
            <ListChecks className="h-4 w-4" />
            Задачи
          </h2>
          <div className="inline-flex rounded-xl border border-bg-border bg-bg-soft p-0.5 text-xs">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-lg px-3 py-1 font-medium transition ${
                  filter === f.key
                    ? 'bg-brand/20 text-brand-soft'
                    : 'text-text-secondary hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <EmptyState
            icon={<Inbox className="h-6 w-6" />}
            title={filter === 'active' ? 'Нет активных задач' : 'Пусто'}
            hint="Нажми «Добавить», чтобы создать первую задачу."
            onAdd={add}
          />
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((t) => (
              <TaskItem key={t.id} task={t} />
            ))}
          </div>
        )}
      </section>

      {/* Goals */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-text-secondary">
          <Target className="h-4 w-4" />
          Цели
        </h2>
        {goals.length === 0 ? (
          <EmptyState
            icon={<Target className="h-6 w-6" />}
            title="Пока нет целей"
            hint="Разбей большую задумку на маленькие шаги."
            onAdd={add}
          />
        ) : (
          <div className="space-y-3">
            {goals.map((g) => (
              <GoalItem key={g.id} goal={g} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EmptyState({ icon, title, hint, onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-bg-border bg-bg-soft/40 px-4 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-bg-hover text-text-secondary">
        {icon}
      </div>
      <div className="mt-3 font-semibold">{title}</div>
      <div className="text-sm text-text-muted">{hint}</div>
      <button onClick={onAdd} className="btn-primary mt-4">
        <Plus className="h-4 w-4" />
        Добавить
      </button>
    </div>
  );
}
