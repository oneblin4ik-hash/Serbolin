import { Sparkles } from 'lucide-react';

export default function ComingSoon({ title, description }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-bg-border bg-bg-card p-8 text-center">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand/20 blur-3xl" />
        <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-deep shadow-glow">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <h2 className="relative mt-4 text-xl font-bold">{title}</h2>
        <p className="relative mt-2 text-sm text-text-secondary">
          {description}
        </p>
        <div className="relative mt-6 inline-flex items-center gap-2 rounded-full border border-bg-border bg-bg-hover px-3 py-1 text-xs text-text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-gold" />
          Раздел в разработке
        </div>
      </div>
    </div>
  );
}
