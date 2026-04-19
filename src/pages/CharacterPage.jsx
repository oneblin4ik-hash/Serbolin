import { useState } from 'react';
import { Pencil, Flame, Target, Brain, Sparkles, Trophy } from 'lucide-react';
import { useCharacterStore } from '../store/useCharacterStore';
import { useUiStore } from '../store/useUiStore';
import { getProgressToNextLevel } from '../lib/xp';
import { STAT_CATEGORIES } from '../lib/constants';
import Avatar from '../components/Avatar';

const ICONS = { Flame, Target, Brain, Sparkles };

export default function CharacterPage() {
  const name = useCharacterStore((s) => s.name);
  const avatar = useCharacterStore((s) => s.avatar);
  const totalXp = useCharacterStore((s) => s.totalXp);
  const stats = useCharacterStore((s) => s.stats);
  const rename = useCharacterStore((s) => s.rename);
  const setAvatar = useCharacterStore((s) => s.setAvatar);
  const openModal = useUiStore((s) => s.openModal);
  const closeModal = useUiStore((s) => s.closeModal);

  const progress = getProgressToNextLevel(totalXp);
  const maxStat = Math.max(10, ...Object.values(stats));

  const openEdit = () => {
    openModal(
      'Редактировать персонажа',
      <EditForm
        initialName={name}
        initialAvatar={avatar}
        onSave={({ name, avatar }) => {
          rename(name);
          setAvatar(avatar);
          closeModal();
        }}
      />
    );
  };

  return (
    <div className="space-y-6">
      {/* Hero card */}
      <div className="relative overflow-hidden rounded-3xl border border-bg-border bg-gradient-to-br from-bg-card to-bg-soft p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-brand/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 h-60 w-60 rounded-full bg-accent-cyan/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            <Avatar name={name} src={avatar} size={112} />
            <div className="absolute -bottom-1 -right-1 rounded-full bg-gradient-to-br from-accent-gold to-brand px-2.5 py-1 text-xs font-bold text-bg-base shadow-glow">
              Lv {progress.level}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
                {name}
              </h1>
              <button
                onClick={openEdit}
                className="btn-ghost !p-2"
                aria-label="Редактировать"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-sm text-text-secondary">
              Путь героя продолжается. Выполняй задачи — получай XP.
            </p>

            <div className="mt-5">
              <div className="mb-1.5 flex items-baseline justify-between text-xs text-text-secondary">
                <span>Прогресс до уровня {progress.level + 1}</span>
                <span>
                  <span className="font-semibold text-text-primary">
                    {progress.current}
                  </span>
                  {' / '}
                  {progress.needed} XP
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-bg-border">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand via-brand-soft to-accent-cyan transition-all duration-700"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
                <Trophy className="h-3.5 w-3.5 text-accent-gold" />
                Всего заработано: {totalXp.toLocaleString('ru-RU')} XP
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-secondary">
          Характеристики
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {STAT_CATEGORIES.map((cat) => {
            const Icon = ICONS[cat.icon] || Target;
            const value = stats[cat.key] || 0;
            const percent = Math.round((value / maxStat) * 100);
            return (
              <div
                key={cat.key}
                className="card p-4 transition hover:border-bg-border/80 hover:bg-bg-hover/40"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{
                        background: `${cat.color}1a`,
                        color: cat.color,
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold">{cat.label}</div>
                      <div className="text-xs text-text-muted">
                        {cat.description}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{value}</div>
                    <div className="text-[10px] uppercase tracking-wider text-text-muted">
                      XP
                    </div>
                  </div>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-bg-border">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${percent}%`, background: cat.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function EditForm({ initialName, initialAvatar, onSave }) {
  const [name, setName] = useState(initialName);
  const [avatar, setAvatarState] = useState(initialAvatar || '');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ name, avatar: avatar.trim() || null });
      }}
      className="space-y-4"
    >
      <label className="block">
        <span className="mb-1 block text-sm text-text-secondary">Имя</span>
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm text-text-secondary">
          Ссылка на аватар (необязательно)
        </span>
        <input
          className="input"
          value={avatar}
          placeholder="https://..."
          onChange={(e) => setAvatarState(e.target.value)}
        />
      </label>
      <div className="flex justify-end gap-2 pt-2">
        <button type="submit" className="btn-primary">
          Сохранить
        </button>
      </div>
    </form>
  );
}
