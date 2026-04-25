import { useUiStore } from '../store/useUiStore';

const COLORS = {
  info:    'border-bg-border bg-bg-card text-text-primary',
  success: 'border-accent-green/40 bg-accent-green/10 text-accent-green',
  error:   'border-accent-red/40 bg-accent-red/10 text-accent-red',
};

export default function Toasts() {
  const toasts = useUiStore((s) => s.toasts);

  return (
    <div className="pointer-events-none fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2 sm:bottom-8">
      {toasts.map((t) => (
        <div key={t.id} className={`animate-slide-up rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${COLORS[t.kind] || COLORS.info}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
