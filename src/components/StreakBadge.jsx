import { getStreakMultiplier } from '../lib/xp';

export default function StreakBadge({ days = 0, showMultiplier = false }) {
  if (days === 0) return null;
  const mult = getStreakMultiplier(days);

  return (
    <div className="inline-flex items-center gap-1 rounded-lg bg-accent-red/10 border border-accent-red/20 px-2 py-0.5">
      <span>🔥</span>
      <span className="text-xs font-bold text-accent-red">{days}</span>
      {showMultiplier && mult > 1 && (
        <span className="text-[10px] font-semibold text-text-muted">×{mult}</span>
      )}
    </div>
  );
}
