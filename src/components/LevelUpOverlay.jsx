import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useUiStore } from '../store/useUiStore';

export default function LevelUpOverlay() {
  const levelUpData = useUiStore((s) => s.levelUpData);

  useEffect(() => {
    if (!levelUpData) return;
    const end = Date.now() + 2000;
    const colors = ['#D4A843', '#E8C46A', '#FFFFFF', '#B8902E'];
    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [levelUpData]);

  if (!levelUpData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <div className="relative z-10 flex flex-col items-center gap-4 px-8 text-center animate-slide-up">
        <div className="font-display text-7xl font-black text-brand-gold drop-shadow-lg">
          {levelUpData.level}
        </div>
        <div className="font-display text-2xl font-bold text-text-primary">Новый уровень!</div>
        <div className="rounded-full border border-brand-gold/40 bg-brand-gold/10 px-6 py-2 font-display text-lg text-brand-gold">
          {levelUpData.rank}
        </div>
        <p className="text-sm text-text-muted max-w-xs">Терпение + Дисциплина = Результат</p>
      </div>
    </div>
  );
}
