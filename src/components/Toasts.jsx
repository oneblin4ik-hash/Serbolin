import { CheckCircle2, Info, XCircle } from 'lucide-react';
import { useUiStore } from '../store/useUiStore';

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const COLORS = {
  success: 'text-accent-green',
  error: 'text-accent-red',
  info: 'text-accent-blue',
};

export default function Toasts() {
  const toasts = useUiStore((s) => s.toasts);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => {
        const Icon = ICONS[t.kind] || Info;
        return (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-3 rounded-xl border border-bg-border bg-bg-card/95 px-4 py-3 shadow-card animate-slide-up backdrop-blur-xl"
          >
            <Icon className={`h-5 w-5 shrink-0 ${COLORS[t.kind] || ''}`} />
            <div className="flex-1 text-sm">{t.message}</div>
          </div>
        );
      })}
    </div>
  );
}
