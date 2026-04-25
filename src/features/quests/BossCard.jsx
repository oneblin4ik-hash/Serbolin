import { Shield } from 'lucide-react';

export default function BossCard({ boss }) {
  if (!boss) return null;

  const targets   = boss.targets || {};
  const progress  = boss.progress || {};
  const done      = !!boss.completedAt;

  const totalTargets = Object.values(targets).reduce((a, b) => a + b, 0);
  const totalDone    = Object.entries(targets).reduce((a, [k, v]) => a + Math.min(progress[k] || 0, v), 0);
  const percent      = totalTargets ? Math.round((totalDone / totalTargets) * 100) : 0;

  return (
    <div className={`rounded-2xl border p-5 ${done ? 'border-accent-green/30 bg-accent-green/5' : 'border-brand-gold/30 bg-brand-gold/5 animate-pulse-gold'}`}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gold/10 text-brand-gold">
          <Shield className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-display font-bold text-text-primary">{boss.title}</h3>
            <span className="badge-gold shrink-0">+{boss.xpReward} XP</span>
          </div>
          <p className="mt-0.5 text-xs text-text-muted">{boss.description}</p>

          <div className="mt-3">
            <div className="mb-1 flex justify-between text-[11px] text-text-muted">
              <span>Прогресс</span>
              <span>{percent}%</span>
            </div>
            <div className="xp-bar-track">
              <div className="xp-bar-fill" style={{ width: `${percent}%` }} />
            </div>
          </div>

          {done && (
            <div className="mt-2 text-xs font-semibold text-accent-green">✓ Босс побеждён!</div>
          )}
        </div>
      </div>
    </div>
  );
}
