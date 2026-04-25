import { X } from 'lucide-react';
import { useUiStore } from '../store/useUiStore';

export default function Modal() {
  const modal      = useUiStore((s) => s.modal);
  const closeModal = useUiStore((s) => s.closeModal);

  if (!modal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
      <div className="relative z-10 w-full max-w-md animate-slide-up rounded-2xl border border-bg-border bg-bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-bg-border px-5 py-4">
          <h2 className="font-display text-base font-bold">{modal.title}</h2>
          <button onClick={closeModal} className="btn-ghost !px-2 !py-2">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">{modal.content}</div>
      </div>
    </div>
  );
}
