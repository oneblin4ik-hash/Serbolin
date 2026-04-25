import { useUiStore } from '../store/useUiStore';

export default function XpPopup() {
  const xpPopup = useUiStore((s) => s.xpPopup);
  if (!xpPopup) return null;

  return (
    <div
      key={xpPopup.id}
      className="pointer-events-none fixed bottom-32 left-1/2 z-50 -translate-x-1/2 animate-xp-float"
    >
      <div className="flex items-center gap-1 rounded-full border border-brand-gold/40 bg-brand-gold/10 px-4 py-2 font-display text-lg font-bold text-brand-gold shadow-glow-gold">
        +{xpPopup.amount} XP
        {xpPopup.multiplier > 1 && (
          <span className="ml-1 text-xs font-normal text-brand-gold-soft">×{xpPopup.multiplier}</span>
        )}
      </div>
    </div>
  );
}
