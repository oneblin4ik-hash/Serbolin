import { useState } from 'react';
import { useTasksStore } from '../../store/useTasksStore';
import { useUiStore } from '../../store/useUiStore';
import { STATS, DEFAULT_XP_OPTIONS } from '../../lib/constants';

const TABS = [
  { key: 'task', label: 'Задача' },
  { key: 'goal', label: 'Цель' },
];

export default function QuickAddModal() {
  const [tab, setTab]           = useState('task');
  const [title, setTitle]       = useState('');
  const [xp, setXp]             = useState(20);
  const [statKey, setStatKey]   = useState('discipline');
  const [recurring, setRecurring] = useState(false);
  const [steps, setSteps]       = useState('');

  const addTask  = useTasksStore((s) => s.addTask);
  const addGoal  = useTasksStore((s) => s.addGoal);
  const closeModal = useUiStore((s) => s.closeModal);

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (tab === 'task') {
      addTask({ title, xp, statKey, recurring: recurring ? 'daily' : null });
    } else {
      addGoal({ title, steps: steps.split('\n').filter(Boolean) });
    }
    closeModal();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Tabs */}
      <div className="inline-flex rounded-xl border border-bg-border bg-bg-soft p-0.5 text-xs">
        {TABS.map((t) => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)}
            className={`rounded-lg px-4 py-1.5 font-semibold transition ${tab === t.key ? 'bg-brand-gold/20 text-brand-gold' : 'text-text-secondary hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div>
        <label className="label">Название</label>
        <input className="input" placeholder={tab === 'task' ? 'Пробежка 5 км...' : 'Запустить онлайн-курс...'} value={title} onChange={(e) => setTitle(e.target.value)} autoFocus required />
      </div>

      {tab === 'task' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">XP награда</label>
              <select className="select" value={xp} onChange={(e) => setXp(Number(e.target.value))}>
                {DEFAULT_XP_OPTIONS.map((v) => <option key={v} value={v}>{v} XP</option>)}
              </select>
            </div>
            <div>
              <label className="label">Характеристика</label>
              <select className="select" value={statKey} onChange={(e) => setStatKey(e.target.value)}>
                {STATS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} className="rounded border-bg-border accent-brand-gold" />
            Повторять ежедневно
          </label>
        </>
      )}

      {tab === 'goal' && (
        <div>
          <label className="label">Шаги (каждый с новой строки)</label>
          <textarea className="input !h-24 resize-none" placeholder="Составить план питания&#10;Найти клиентов&#10;Запустить рекламу" value={steps} onChange={(e) => setSteps(e.target.value)} />
        </div>
      )}

      <button type="submit" className="btn-primary w-full justify-center">Добавить</button>
    </form>
  );
}
