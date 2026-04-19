import { useState } from 'react';
import { Check, Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useTasksStore } from '../../store/useTasksStore';

export default function GoalItem({ goal }) {
  const toggleStep = useTasksStore((s) => s.toggleGoalStep);
  const addStep = useTasksStore((s) => s.addGoalStep);
  const deleteGoal = useTasksStore((s) => s.deleteGoal);
  const [open, setOpen] = useState(true);
  const [newStep, setNewStep] = useState('');

  const doneCount = goal.steps.filter((s) => s.completedAt).length;
  const total = goal.steps.length;
  const percent = total ? Math.round((doneCount / total) * 100) : 0;
  const done = total > 0 && doneCount === total;

  return (
    <div className="rounded-2xl border border-bg-border bg-bg-card">
      <div className="flex items-start gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-brand-soft">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold ${done ? 'line-through text-text-muted' : ''}`}>
              {goal.title}
            </h3>
            {done && <span className="chip text-accent-green" style={{ borderColor: '#22c55e33', background: '#22c55e14' }}>готово</span>}
          </div>
          {goal.note && <p className="mt-0.5 text-sm text-text-secondary">{goal.note}</p>}

          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-xs text-text-secondary">
              <span>{doneCount} / {total} шагов</span>
              <span>{percent}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-bg-border">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand to-accent-cyan transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="btn-ghost !p-2"
          aria-label="Развернуть"
        >
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        <button
          onClick={() => deleteGoal(goal.id)}
          className="btn-ghost !p-2"
          aria-label="Удалить"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {open && (
        <div className="border-t border-bg-border px-4 py-3 space-y-2">
          {goal.steps.map((step) => {
            const sdone = !!step.completedAt;
            return (
              <div key={step.id} className="flex items-center gap-3">
                <button
                  onClick={() => toggleStep(goal.id, step.id)}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                    sdone
                      ? 'border-brand bg-brand text-white'
                      : 'border-bg-border hover:border-brand'
                  }`}
                >
                  {sdone && <Check className="h-3 w-3" strokeWidth={3} />}
                </button>
                <span className={`flex-1 text-sm ${sdone ? 'line-through text-text-muted' : ''}`}>
                  {step.title}
                </span>
                <span className="text-xs text-text-muted">+{step.xp}</span>
              </div>
            );
          })}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newStep.trim()) return;
              addStep(goal.id, newStep);
              setNewStep('');
            }}
            className="flex items-center gap-2 pt-2"
          >
            <input
              value={newStep}
              onChange={(e) => setNewStep(e.target.value)}
              className="input !py-1.5 text-sm"
              placeholder="Добавить шаг…"
            />
            <button type="submit" className="btn-secondary !px-3 !py-1.5" aria-label="Добавить шаг">
              <Plus className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
