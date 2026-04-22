import { useState } from 'react';
import { Pencil, Trophy, Dumbbell, Target, Zap, Brain } from 'lucide-react';
import { useCharacterStore } from '../store/useCharacterStore';
import { useUiStore } from '../store/useUiStore';
import { useAchievementsStore } from '../store/useAchievementsStore';
import { getProgressToNextLevel, getRank } from '../lib/xp';
import { STATS, ACHIEVEMENTS, DEFAULT_BRAND } from '../lib/constants';
import Avatar from '../components/Avatar';
import StreakBadge from '../components/StreakBadge';
import AchievementBadge from '../features/achievements/AchievementBadge';

const STAT_ICONS = { strength: Dumbbell, discipline: Target, energy: Zap, endurance: Brain };

function EditForm({ initialName, onSave }) {
  const [name, setName] = useState(initialName);
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(name); }} className="space-y-4">
      <div>
        <label className="label">Имя</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus required />
      </div>
      <button type="submit" className="btn-primary w-full justify-center">Сохранить</button>
    </form>
  );
}

function BrandForm({ initial, onSave }) {
  const [form, setForm] = useState(initial || DEFAULT_BRAND);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-3">
      {[
        { k: 'niche',    label: 'Ниша',      ph: 'онлайн-фитнес тренер' },
        { k: 'audience', label: 'Аудитория', ph: 'мужчины/женщины 25-45' },
        { k: 'tone',     label: 'Тон',       ph: 'дружески, на «ты»' },
        { k: 'slogan',   label: 'Слоган',    ph: 'Терпение + Дисциплина = Результат' },
      ].map(({ k, label, ph }) => (
        <div key={k}>
          <label className="label">{label}</label>
          <input className="input" placeholder={ph} value={form[k] || ''} onChange={(e) => set(k, e.target.value)} />
        </div>
      ))}
      <div>
        <label className="label">Темы (через запятую)</label>
        <input className="input" value={(form.topics || []).join(', ')} onChange={(e) => set('topics', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} />
      </div>
      <button type="submit" className="btn-primary w-full justify-center">Сохранить</button>
    </form>
  );
}

export default function CharacterPage() {
  const { name, avatar, totalXp, stats, streakDays, brand } = useCharacterStore();
  const rename     = useCharacterStore((s) => s.rename);
  const setBrand   = useCharacterStore((s) => s.setBrand);
  const { openModal, closeModal } = useUiStore();
  const unlocked   = useAchievementsStore((s) => s.unlocked);

  const progress = getProgressToNextLevel(totalXp);
  const rank     = getRank(progress.level);
  const maxStat  = Math.max(10, ...Object.values(stats));

  return (
    <div className="space-y-6">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-bg-border bg-gradient-to-br from-bg-card to-bg-soft p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-gold/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            <Avatar name={name} src={avatar} size={100} />
            <div className="absolute -bottom-1 -right-1 rounded-full bg-brand-gold px-2.5 py-0.5 font-display text-xs font-black text-bg-base shadow-glow-gold">
              Lv {progress.level}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-2xl font-black">{name}</h1>
              <button onClick={() => openModal('Редактировать', <EditForm initialName={name} onSave={(n) => { rename(n); closeModal(); }} />)}
                className="btn-ghost !p-1.5"><Pencil className="h-3.5 w-3.5" /></button>
              <StreakBadge days={streakDays} showMultiplier />
            </div>
            <div className="mt-1">
              <span className="badge-gold">{rank}</span>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-[11px] text-text-muted mb-1">
                <span>До уровня {progress.level + 1}</span>
                <span>{progress.current} / {progress.needed} XP</span>
              </div>
              <div className="xp-bar-track h-2.5">
                <div className="xp-bar-fill h-full" style={{ width: `${progress.percent}%` }} />
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-text-muted">
                <Trophy className="h-3 w-3 text-brand-gold" />
                Всего: {totalXp.toLocaleString('ru')} XP
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Характеристики</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {STATS.map((stat) => {
            const Icon    = STAT_ICONS[stat.key] || Target;
            const value   = stats[stat.key] || 0;
            const percent = Math.round((value / maxStat) * 100);
            return (
              <div key={stat.key} className="card-hover p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${stat.color}20`, color: stat.color }}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{stat.label}</div>
                    <div className="text-[10px] text-text-muted">{stat.description}</div>
                  </div>
                  <div className="ml-auto font-display text-lg font-black" style={{ color: stat.color }}>{value}</div>
                </div>
                <div className="h-1.5 rounded-full bg-bg-border overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${percent}%`, background: stat.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Achievements */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Достижения</h2>
          <span className="text-xs text-text-muted">{unlocked.length}/{ACHIEVEMENTS.length}</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {ACHIEVEMENTS.map((a) => <AchievementBadge key={a.key} achievementKey={a.key} />)}
        </div>
      </section>

      {/* Brand settings */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Мой бренд</h2>
          <button onClick={() => openModal('Настройки бренда', <BrandForm initial={brand} onSave={(b) => { setBrand(b); closeModal(); }} />)} className="btn-ghost !py-1 !px-2 text-xs">
            <Pencil className="h-3 w-3" /> Изменить
          </button>
        </div>
        <div className="card p-4 space-y-2 text-sm">
          {[
            { label: 'Ниша',      value: brand?.niche    || DEFAULT_BRAND.niche },
            { label: 'Аудитория', value: brand?.audience || DEFAULT_BRAND.audience },
            { label: 'Слоган',    value: brand?.slogan   || DEFAULT_BRAND.slogan },
          ].map((row) => (
            <div key={row.label} className="flex gap-2">
              <span className="text-text-muted shrink-0 w-24 text-xs">{row.label}</span>
              <span className="text-text-primary text-xs">{row.value}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
