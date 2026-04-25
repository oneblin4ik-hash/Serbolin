import { Check, Trash2 } from 'lucide-react';
import { useQuestStore } from '../../store/useQuestStore';
import { BRANCHES } from '../../lib/constants';

const DIFF_LABEL = { easy: 'Лёгкий', medium: 'Средний', hard: 'Сложный' };
const DIFF_COLOR = { easy: 'text-accent-green', medium: 'text-brand-gold', hard: 'text-accent-red' };

export default function QuestCard({ quest }) {
  const toggleQuest = useQuestStore((s) => s.toggleQuest);
  const deleteQuest = useQuestStore((s) => s.deleteQuest);
  const branch      = BRANCHES[quest.branch];
  const done        = !!quest.completedAt;

  return (
    <div className={`card-hover flex items-start gap-3 p-4 group ${done ? 'opacity-55' : ''}`}>
      <button
        onClick={() => toggleQuest(quest.id)}
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all ${done ? 'border-brand-gold bg-brand-gold' : 'border-bg-border hover:border-brand-gold/60'}`}
      >
        {done && <Check className="h-4 w-4 text-bg-base" strokeWidth={2.5} />}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${done ? 'line-through text-text-muted' : 'text-text-primary'}`}>
          {quest.title}
        </p>
        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
          <span className="text-base" title={branch?.label}>{branch?.emoji}</span>
          <span className="badge-gold">{quest.xp} XP</span>
          {quest.difficulty && (
            <span className={`text-[11px] font-semibold ${DIFF_COLOR[quest.difficulty] || ''}`}>
              {DIFF_LABEL[quest.difficulty]}
            </span>
          )}
          {quest.isCustom && <span className="text-[10px] text-text-muted">Своё</span>}
        </div>
      </div>

      {quest.isCustom && (
        <button onClick={() => deleteQuest(quest.id)} className="btn-ghost !px-2 opacity-0 group-hover:opacity-100 text-text-muted hover:text-accent-red mt-0.5">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
