import { useState } from 'react';
import { useTasksStore } from '../../store/useTasksStore';
import { useUiStore } from '../../store/useUiStore';
import { STAT_CATEGORIES, DEFAULT_XP_REWARDS } from '../../lib/constants';

export default function QuickAddModal() {
  const [mode, setMode] = useState('task');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [xp, setXp] = useState(20);
  const [category, setCategory] = useState('discipline');
  const [recurring, setRecurring] = useState(false);
  const [stepsText, setStepsText] = useState('');

  const addTask = useTasksStore((s) => s.addTask);
  const addGoal = useTasksStore((s) => s.addGoal);
  const closeModal = useUiStore((s) => s.closeModal);
  const toast = useUiStore((s) => s.toast);

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (mode === 'task') {
      addTask({
        title,
        note,
        xp,
        category,
        recurring: recurring ? 'daily' : null,
      });
      toast('Задача добавлена', 'success');
    } else {
      const steps = stepsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      addGoal({ title, note, steps });
      toast('Цель добавлена', 'success');
    }
    closeModal();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="inline-flex rounded-xl border border-bg-border bg-bg-soft p-1">
        {['task', 'goal'].map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
              mode === m ? 'bg-brand text-white' : 'text-text-secondary hover:text-white'
            }`}
          >
            {m === 'task' ? 'Задача' : 'Цель'}
          </button>
        ))}
      </div>

      <label className="block">
        <span className="mb-1 block text-sm text-text-secondary">Название</span>
        <input
          className="input"
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={mode === 'task' ? 'Напр. Пробежка 3 км' : 'Напр. Запустить курс'}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm text-text-secondary">
          Заметка (необязательно)
        </span>
        <textarea
          className="input resize-none"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>

      {mode === 'task' ? (
        <>
          <div>
            <span className="mb-1 block text-sm text-text-secondary">XP за выполнение</span>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_XP_REWARDS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setXp(v)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                    xp === v
                      ? 'border-brand bg-brand/15 text-brand-soft'
                      : 'border-bg-border bg-bg-soft text-text-secondary hover:text-white'
                  }`}
                >
                  +{v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-1 block text-sm text-text-secondary">Категория</span>
            <div className="grid grid-cols-2 gap-2">
              {STAT_CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setCategory(c.key)}
                  className={`rounded-lg border px-3 py-2 text-left text-sm font-medium transition ${
                    category === c.key
                      ? 'border-brand bg-brand/10 text-white'
                      : 'border-bg-border bg-bg-soft text-text-secondary hover:text-white'
                  }`}
                >
                  <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ background: c.color }} />
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              className="h-4 w-4 accent-brand"
            />
            Повторять каждый день
          </label>
        </>
      ) : (
        <label className="block">
          <span className="mb-1 block text-sm text-text-secondary">
            Шаги (по одному на строку)
          </span>
          <textarea
            className="input resize-none"
            rows={4}
            value={stepsText}
            onChange={(e) => setStepsText(e.target.value)}
            placeholder={`Сделать лендинг\nЗапустить рекламу\nСобрать первые 10 заявок`}
          />
        </label>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={closeModal} className="btn-secondary">
          Отмена
        </button>
        <button type="submit" className="btn-primary">
          Добавить
        </button>
      </div>
    </form>
  );
}
