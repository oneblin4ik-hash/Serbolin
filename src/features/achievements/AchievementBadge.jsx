import { ACHIEVEMENTS } from '../../lib/constants';
import { useAchievementsStore } from '../../store/useAchievementsStore';

export default function AchievementBadge({ achievementKey }) {
  const def       = ACHIEVEMENTS.find((a) => a.key === achievementKey);
  const unlocked  = useAchievementsStore((s) => s.isUnlocked(achievementKey));
  if (!def) return null;

  return (
    <div className={`card p-4 flex flex-col items-center gap-2 text-center transition-all ${unlocked ? 'border-brand-gold/30 bg-brand-gold/5' : 'opacity-40 grayscale'}`}>
      <div className="text-3xl">{def.emoji}</div>
      <div className="text-xs font-bold text-text-primary leading-tight">{def.title}</div>
      <div className="text-[10px] text-text-muted leading-tight">{def.description}</div>
      {unlocked && <span className="badge-gold mt-1">+{def.xpReward} XP</span>}
    </div>
  );
}
