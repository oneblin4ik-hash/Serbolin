import { Check, Trash2, RefreshCw } from 'lucide-react';
import { useTasksStore } from '../../store/useTasksStore';
import { STATS } from '../../lib/constants';

export default function TaskItem({ task }) {
  const toggleTask = useTasksStore((s) => s.toggleTask);
  const deleteTask = useTasksStore((s) => s.deleteTask);
  const stat = STATS.find((s) => s.key === task.statKey);
  const done = !!task.completedAt;

  return (
    <div className={`card-hover flex items-center gap-3 p-3.5 ${done ? 'opacity-60' : ''}`}>
      <button
        onClick={() => toggleTask(task.id)}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${done ? 'border-brand-gold bg-brand-gold' : 'border-bg-border hover:border-brand-gold/60'}`}
      >
        {done && <Check className="h-3.5 w-3.5 text-bg-base" strokeWidth={3} />}
      </button>

      <div className="min-w-0 flex-1">
        <div className={`text-sm font-medium ${done ? 'line-through text-text-muted' : 'text-text-primary'}`}>
          {task.title}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-text-muted">
          <span className="badge-gold">{task.xp} XP</span>
          {stat && <span style={{ color: stat.color }} className="font-semibold">{stat.label}</span>}
          {task.recurring === 'daily' && <RefreshCw className="h-3 w-3" title="Ежедневная" />}
        </div>
      </div>

      <button onClick={() => deleteTask(task.id)} className="btn-ghost !px-2 opacity-0 group-hover:opacity-100 text-text-muted hover:text-accent-red">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
