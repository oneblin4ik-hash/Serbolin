import { useState } from 'react';
import { Plus, Flag } from 'lucide-react';
import { useQuestStore } from '../store/useQuestStore';
import { useUiStore } from '../store/useUiStore';
import { BRANCHES, BRANCH_LIST } from '../lib/constants';
import QuestCard from '../features/quests/QuestCard';
import BossCard from '../features/quests/BossCard';
import { todayKey } from '../lib/dates';

function AddQuestModal() {
  const [title, setTitle] = useState('');
  const [xp, setXp]       = useState(30);
  const [branch, setBranch] = useState('CUSTOM');
  const addCustomQuest    = useQuestStore((s) => s.addCustomQuest);
  const closeModal        = useUiStore((s) => s.closeModal);

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    addCustomQuest({ title, xp, branch });
    closeModal();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label">Задание</label>
        <input className="input" placeholder="Выпить 2 литра воды..." value={title} onChange={(e) => setTitle(e.target.value)} autoFocus required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">XP</label>
          <select className="select" value={xp} onChange={(e) => setXp(Number(e.target.value))}>
            {[20, 30, 50, 80].map((v) => <option key={v} value={v}>{v} XP</option>)}
          </select>
        </div>
        <div>
          <label className="label">Ветка</label>
          <select className="select" value={branch} onChange={(e) => setBranch(e.target.value)}>
            {BRANCH_LIST.map((b) => <option key={b.key} value={b.key}>{b.emoji} {b.label}</option>)}
          </select>
        </div>
      </div>
      <button type="submit" className="btn-primary w-full justify-center">Добавить квест</button>
    </form>
  );
}

export default function QuestsPage() {
  const quests    = useQuestStore((s) => s.quests);
  const boss      = useQuestStore((s) => s.boss);
  const openModal = useUiStore((s) => s.openModal);
  const today     = todayKey();

  const todayQuests  = quests.filter((q) => q.dateKey === today);
  const doneToday    = todayQuests.filter((q) => q.completedAt).length;

  const byBranch = BRANCH_LIST.map((b) => ({
    ...b,
    quests: todayQuests.filter((q) => q.branch === b.key),
  })).filter((b) => b.quests.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-black sm:text-3xl">Квесты дня</h1>
          <p className="mt-1 text-sm text-text-muted">
            Выполнено{' '}
            <span className="font-bold text-brand-gold">{doneToday}/{todayQuests.length}</span>
          </p>
        </div>
        <button onClick={() => openModal('Добавить свой квест', <AddQuestModal />)} className="btn-primary self-start sm:self-auto">
          <Plus className="h-4 w-4" /> Свой квест
        </button>
      </div>

      {/* Boss */}
      {boss && (
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Недельный босс</h2>
          <BossCard boss={boss} />
        </div>
      )}

      {/* Quests by branch */}
      {byBranch.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center text-text-muted">
          <Flag className="h-10 w-10 mb-3 opacity-40" />
          <p className="text-sm">Квесты загружаются...</p>
        </div>
      ) : (
        <div className="space-y-5">
          {byBranch.map((b) => (
            <section key={b.key}>
              <h2 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
                <span className="text-base">{b.emoji}</span>
                {b.label}
              </h2>
              <div className="space-y-2">
                {b.quests.map((q) => <QuestCard key={q.id} quest={q} />)}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
