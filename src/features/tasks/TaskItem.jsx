import { Check, Trash2, Repeat, Zap } from 'lucide-react';
import { useTasksStore } from '../../store/useTasksStore';
import { STAT_MAP } from '../../lib/constants';

export default function TaskItem({ task }) {
  const toggleTask = useTasksStore((s) => s.toggleTask);
  const deleteTask = useTasksStore((s) => s.deleteTask);
  const done = !!task.completedAt;
  const cat = STAT_MAP[task.category];

  return (
    <div
      className={`group flex items-start gap-3 rounded-2xl border p-3.5 transition ${
        done
          ? 'border-bg-border bg-bg-soft/50 opacity-60'
          : 'border-bg-border bg-bg-card hover:border-brand/30 hover:bg-bg-hover/50'
      }`}
    >
      <button
        onClick={() => toggleTask(task.id)}
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
          done
            ? 'border-brand bg-brand text-white'
            : 'border-bg-border hover:border-brand'
        }`}
        aria-label="Выполнить"
      >
        {done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </button>

      <div className="min-w-0 flex-1">
        <div className={`font-medium leading-snug ${done ? 'line-through text-text-muted' : ''}`}>
          {task.title}
        </div>
        {task.note && (
          <div className="mt-0.5 text-xs text-text-muted">{task.note}</div>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {cat && (
            <span
              className="chip"
              style={{ color: cat.color, borderColor: `${cat.color}33`, background: `${cat.color}14` }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: cat.color }} />
              {cat.label}
            </span>
          )}
          <span className="chip text-accent-gold" style={{ borderColor: '#f5c45133', background: '#f5c45114' }}>
            <Zap className="h-3 w-3" />
            {task.xp} XP
          </span>
          {task.recurring === 'daily' && (
            <span className="chip text-accent-cyan" style={{ borderColor: '#06b6d433', background: '#06b6d414' }}>
              <Repeat className="h-3 w-3" />
              каждый день
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() => deleteTask(task.id)}
        className="btn-ghost !p-2 opacity-0 transition group-hover:opacity-100"
        aria-label="Удалить"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
