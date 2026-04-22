export default function Avatar({ name = '', src = null, size = 40 }) {
  const initials = name.trim().split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'S';
  const style = { width: size, height: size, minWidth: size, fontSize: size * 0.38 };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={style}
        className="rounded-full object-cover border-2 border-brand-gold/40"
      />
    );
  }

  return (
    <div
      style={style}
      className="flex items-center justify-center rounded-full bg-gradient-to-br from-brand-gold-dim to-brand-gold font-display font-bold text-bg-base select-none"
    >
      {initials}
    </div>
  );
}
