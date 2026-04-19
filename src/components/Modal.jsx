import { X } from 'lucide-react';
import { useEffect } from 'react';
import { useUiStore } from '../store/useUiStore';

export default function Modal() {
  const modal = useUiStore((s) => s.modal);
  const close = useUiStore((s) => s.closeModal);

  useEffect(() => {
    if (!modal) return;
    const onKey = (e) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modal, close]);

  if (!modal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-10 backdrop-blur-sm animate-fade-in"
      onClick={close}
    >
      <div
        className="card w-full max-w-lg animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-bg-border px-5 py-4">
          <h3 className="text-base font-semibold">{modal.title}</h3>
          <button onClick={close} className="btn-ghost !p-2" aria-label="Закрыть">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">{modal.content}</div>
      </div>
    </div>
  );
}
