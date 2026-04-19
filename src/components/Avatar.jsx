export default function Avatar({ name = '?', src, size = 40 }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('') || '?';

  const style = { width: size, height: size };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={style}
        className="rounded-full object-cover ring-2 ring-brand/30"
      />
    );
  }

  return (
    <div
      style={style}
      className="flex items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-deep text-sm font-bold text-white ring-2 ring-brand/30"
    >
      {initials}
    </div>
  );
}
