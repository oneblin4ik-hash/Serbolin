import { useState } from 'react';
import { Pencil, Dumbbell, Target, Heart, Brain } from 'lucide-react';
import { useCharacterStore } from '../store/useCharacterStore';
import { useUiStore } from '../store/useUiStore';
import { useAchievementsStore } from '../store/useAchievementsStore';
import { getProgressToNextLevel, getRank } from '../lib/xp';
import { STATS, ACHIEVEMENTS, DEFAULT_BRAND, AVATAR_FRAMES, getStatTier } from '../lib/constants';
import Avatar from '../components/Avatar';
import StreakBadge from '../components/StreakBadge';

const STAT_ICONS = { strength: Dumbbell, discipline: Target, energy: Heart, endurance: Brain };

const TIER_COLOR = { bronze: '#CD7F32', silver: '#A8A9AD', gold: '#D4A843' };
const TIER_LABEL = { bronze: 'Bronze', silver: 'Silver', gold: 'Gold' };

const ACH_CATS = [
  { key: 'all',        label: 'Все Пути' },
  { key: 'strength',   label: 'Сила' },
  { key: 'discipline', label: 'Дисциплина' },
  { key: 'content',    label: 'Контент' },
  { key: 'business',   label: 'Бизнес' },
  { key: 'mental',     label: 'Ментал' },
  { key: 'hidden',     label: 'Скрытые' },
];

function EditForm({ initialName, onSave, onCancel }) {
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

function BrandForm({ initial, onSave, onClose }) {
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
      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1 justify-center">Сохранить</button>
        <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">Отмена</button>
      </div>
    </form>
  );
}

function AchievementCard({ ach, unlocked }) {
  const isUnlocked = unlocked.includes(ach.key);
  const tierColor = TIER_COLOR[ach.tier] || '#666';
  return (
    <div className={`rounded-2xl border p-4 transition-all ${isUnlocked ? 'border-brand-gold/30 bg-brand-gold/5' : 'border-bg-border bg-bg-soft opacity-60'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-[9px] uppercase tracking-[0.15em] font-semibold" style={{ color: tierColor }}>
          {TIER_LABEL[ach.tier]} · {ach.cat === 'strength' ? 'СИЛА' : ach.cat === 'discipline' ? 'ДИСЦИПЛИНА' : ach.cat === 'content' ? 'КОНТЕНТ' : ach.cat === 'business' ? 'БИЗНЕС' : ach.cat === 'mental' ? 'МЕНТАЛ' : 'СКРЫТЫЕ'}
        </div>
        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center`} style={{ borderColor: isUnlocked ? tierColor : '#333', background: isUnlocked ? `${tierColor}20` : 'transparent' }}>
          {isUnlocked ? <span style={{ color: tierColor }} className="text-[10px]">✦</span> : <span className="text-[10px] text-text-muted">✦</span>}
        </div>
      </div>
      <div className="font-semibold text-xs leading-tight mt-1">
        {isUnlocked ? ach.title : ach.cat === 'hidden' ? '???' : ach.title}
      </div>
      <div className="text-[10px] text-text-muted mt-1 leading-tight">
        {isUnlocked ? ach.description : ach.cat === 'hidden' ? '???' : ach.description}
      </div>
      {isUnlocked && (
        <div className="text-[10px] text-brand-gold font-mono mt-2">+{ach.xpReward} XP</div>
      )}
    </div>
  );
}

export default function CharacterPage() {
  const { name, avatar, totalXp, stats, streakDays, brand } = useCharacterStore();
  const rename     = useCharacterStore((s) => s.rename);
  const setBrand   = useCharacterStore((s) => s.setBrand);
  const { openModal, closeModal } = useUiStore();
  const unlocked   = useAchievementsStore((s) => s.unlocked);
  const [achCat, setAchCat] = useState('all');

  const progress = getProgressToNextLevel(totalXp);
  const rank     = getRank(progress.level);
  const maxStat  = Math.max(10, ...Object.values(stats));

  const filteredAch = achCat === 'all' ? ACHIEVEMENTS : ACHIEVEMENTS.filter((a) => a.cat === achCat);

  return (
    <div className="space-y-6">

      {/* Header eyebrow */}
      <div>
        <div className="text-[11px] uppercase tracking-widest text-text-muted">Профиль героя</div>
        <h1 className="font-display text-2xl font-black mt-0.5">Персонаж</h1>
      </div>

      {/* Top: avatar card + stats */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">

        {/* Avatar card */}
        <div className="card p-6 flex flex-col items-center text-center gap-4">
          <div className="relative">
            <Avatar name={name} src={avatar} size={120} level={progress.level} />
            <button onClick={() => openModal('Редактировать',
              <EditForm initialName={name} onSave={(n) => { rename(n); closeModal(); }} />)}
              className="absolute -top-1 -right-1 h-7 w-7 rounded-full bg-bg-card border border-bg-border flex items-center justify-center hover:border-brand-gold transition-colors">
              <Pencil className="h-3 w-3 text-text-muted" />
            </button>
          </div>

          <div>
            <h2 className="font-display text-xl font-black">{name}</h2>
            <div className="text-xs text-text-muted italic mt-0.5">«{rank}»</div>
            <div className="text-[11px] uppercase tracking-widest font-bold text-brand-gold mt-1">{rank}</div>
          </div>

          <div className="w-full">
            <div className="flex justify-between text-[10px] text-text-muted mb-1">
              <span>Уровень {progress.level}</span>
              <span>{progress.level + 1}</span>
            </div>
            <div className="xp-bar-track h-1.5 w-full">
              <div className="xp-bar-fill h-full" style={{ width: `${progress.percent}%` }} />
            </div>
            <div className="text-[10px] font-mono text-text-muted mt-1 tabular-nums">
              {progress.current.toLocaleString('ru')} / {progress.needed.toLocaleString('ru')} XP · всего {totalXp.toLocaleString('ru')}
            </div>
          </div>

          {/* Avatar evolution strip */}
          <div className="w-full border-t border-bg-border pt-4">
            <div className="text-[10px] uppercase tracking-widest text-text-muted mb-3">Эволюция аватара</div>
            <div className="flex justify-center gap-2">
              {AVATAR_FRAMES.map((frame, i) => {
                const isActive = progress.level >= frame.minLevel;
                const isCurrent = i === AVATAR_FRAMES.findLastIndex((f) => progress.level >= f.minLevel);
                return (
                  <div key={i} className={`relative flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all ${isCurrent ? 'border-brand-gold scale-110' : isActive ? 'border-brand-gold/40' : 'border-bg-border opacity-40'}`}>
                    <span className="font-display text-[9px] font-black text-text-muted">
                      {frame.minLevel}
                    </span>
                    {frame.badge && isActive && (
                      <span className="absolute -bottom-1 -right-1 text-[10px] leading-none">{frame.badge}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stats + summary */}
        <div className="space-y-4">
          <div className="card p-5">
            <div className="text-[10px] uppercase tracking-widest text-text-muted mb-4">Характеристики</div>
            <div className="space-y-4">
              {STATS.map((stat) => {
                const Icon  = STAT_ICONS[stat.key] || Target;
                const value = stats[stat.key] || 0;
                const tier  = getStatTier(value);
                const pct   = Math.min(100, Math.round((value / Math.max(maxStat, 10)) * 100));
                return (
                  <div key={stat.key}>
                    <div className="flex items-baseline justify-between mb-1.5">
                      <div>
                        <span className="font-semibold text-sm">{stat.label}</span>
                        <span className="text-[10px] text-text-muted ml-2">{stat.description}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-display text-lg font-black" style={{ color: stat.color }}>{value}</span>
                        <span className="text-[10px] font-bold text-text-muted">{tier.toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-bg-border overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: stat.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary stats */}
          <div className="card p-5">
            <div className="text-[10px] uppercase tracking-widest text-text-muted mb-3">Сводка</div>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { icon: '🔥', value: streakDays, label: 'дней стрик' },
                { icon: '✦',  value: `${unlocked.length}/${ACHIEVEMENTS.length}`, label: 'достижений' },
                { icon: '⚔️',  value: totalXp.toLocaleString('ru'), label: 'всего XP' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-xl mb-1">{s.icon}</div>
                  <div className="font-display font-black text-lg tabular-nums">{s.value}</div>
                  <div className="text-[10px] uppercase tracking-wider text-text-muted mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-text-muted">Витраж славы</div>
            <h2 className="font-display text-xl font-black mt-0.5">Достижения</h2>
            <p className="text-xs text-text-muted mt-0.5">Открыто {unlocked.length} из {ACHIEVEMENTS.length} · каждая даёт XP</p>
          </div>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {ACH_CATS.map((c) => (
            <button key={c.key} onClick={() => setAchCat(c.key)}
              className={`shrink-0 px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                achCat === c.key ? 'bg-brand-gold text-bg-base border-brand-gold' : 'border-bg-border text-text-secondary hover:border-brand-gold/40'
              }`}>
              {c.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filteredAch.map((a) => <AchievementCard key={a.key} ach={a} unlocked={unlocked} />)}
        </div>
      </section>

      {/* Brand */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-text-muted">Мой бренд</div>
          </div>
          <button onClick={() => openModal('Настройки бренда',
            <BrandForm initial={brand} onSave={(b) => { setBrand(b); closeModal(); }} onClose={closeModal} />)}
            className="btn-ghost !py-1 !px-2 text-xs">
            <Pencil className="h-3 w-3" /> Изменить
          </button>
        </div>
        <div className="card p-4 space-y-2">
          {[
            { label: 'Ниша',      value: brand?.niche    || DEFAULT_BRAND.niche },
            { label: 'Аудитория', value: brand?.audience || DEFAULT_BRAND.audience },
            { label: 'Слоган',    value: brand?.slogan   || DEFAULT_BRAND.slogan },
          ].map((row) => (
            <div key={row.label} className="flex gap-3 text-xs">
              <span className="text-text-muted shrink-0 w-24">{row.label}</span>
              <span className="text-text-primary">{row.value}</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
