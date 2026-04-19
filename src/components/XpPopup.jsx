import { Zap } from 'lucide-react';
import { useUiStore } from '../store/useUiStore';

export default function XpPopup() {
  const xpPopup = useUiStore((s) => s.xpPopup);
  if (!xpPopup) return null;

  return (
    <div
      key={xpPopup.id}
      className="pointer-events-none fixed right-6 top-24 z-[70] flex items-center gap-2 rounded-full border border-brand/40 bg-gradient-to-r from-brand/90 to-brand-deep/90 px-4 py-2 text-sm font-bold text-white shadow-glow backdrop-blur animate-xp-fly"
    >
      <Zap className="h-4 w-4 fill-current" />
      <span>+{xpPopup.amount} XP</span>
    </div>
  );
}
