import { Construction } from 'lucide-react';

export default function ComingSoon({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-bg-border bg-bg-card text-text-muted mb-4">
        <Construction className="h-7 w-7" />
      </div>
      <h1 className="font-display text-2xl font-bold">{title}</h1>
      <p className="mt-2 max-w-sm text-sm text-text-muted">{description}</p>
      <div className="mt-6 badge-gold">В разработке</div>
    </div>
  );
}
