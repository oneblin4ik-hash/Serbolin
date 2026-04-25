import { useState } from 'react';
import { ChevronDown, ChevronRight, Check, Trash2, Plus } from 'lucide-react';
import { useTasksStore } from '../../store/useTasksStore';

export default function GoalItem({ goal }) {
  const [open, setOpen]         = useState(true);
  const [newStep, setNewStep]   = useState('');
  const toggleGoalStep          = useTasksStore((s) => s.toggleGoalStep);
  const addGoalStep             = useTasksStore((s) => s.addGoalStep);
  const deleteGoal              = useTasksStore((s) => s.deleteGoal);

  const total    = goal.steps.length;
  const done     = goal.steps.filter((s) => s.completedAt).length;
  const percent  = total ? Math.round((done / total) * 100) : 0;

  const submitStep = (e) => {
    e.preventDefault();
    if (!newStep.trim()) return;
    addGoalStep(goal.id, newStep);
    setNewStep('');
  };

  return (
    <div className="card p-4">
      <div className="flex items-start gap-3">
        <button onClick={() => setOpen(!open)} className="mt-0.5 text-text-muted hover:text-text-primary">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-sm">{goal.title}</h3>
            <button onClick={() => deleteGoal(goal.id)} className="btn-ghost !px-1.5 text-text-muted hover:text-accent-red">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Progress */}
          <div className="mt-2 flex items-center gap-2">
            <div className="xp-bar-track flex-1">
              <div className="xp-bar-fill" style={{ width: `${percent}%` }} />
            </div>
            <span className="text-[11px] text-text-muted shrink-0">{done}/{total}</span>
          </div>
        </div>
      </div>

      {open && (
        <div className="mt-3 space-y-1.5 pl-7">
          {goal.steps.map((step) => (
            <div key={step.id} className="flex items-center gap-2.5">
              <button
                onClick={() => toggleGoalStep(goal.id, step.id)}
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${step.completedAt ? 'border-brand-gold bg-brand-gold' : 'border-bg-border hover:border-brand-gold/60'}`}
              >
                {step.completedAt && <Check className="h-3 w-3 text-bg-base" strokeWidth={3} />}
              </button>
              <span className={`text-sm ${step.completedAt ? 'line-through text-text-muted' : ''}`}>{step.title}</span>
              <span className="ml-auto text-[10px] text-text-muted">{step.xp} XP</span>
            </div>
          ))}

          {/* Add step */}
          <form onSubmit={submitStep} className="flex items-center gap-2 pt-1">
            <input
              value={newStep}
              onChange={(e) => setNewStep(e.target.value)}
              placeholder="Добавить шаг..."
              className="input !py-1.5 !text-xs flex-1"
            />
            <button type="submit" className="btn-ghost !px-2 !py-1.5">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
