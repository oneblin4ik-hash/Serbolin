import { getAvatarFrame } from '../lib/constants';

export default function Avatar({ name = '', src = null, size = 40, level = 1 }) {
  const initials = name.trim().split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'S';
  const frame    = getAvatarFrame(level);
  const style    = { width: size, height: size, minWidth: size, fontSize: size * 0.38 };

  return (
    <div className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      {/* Glow ring for high levels */}
      {level >= 5 && (
        <div className={`absolute inset-0 rounded-full ${frame.glow}`} style={{ zIndex: 0 }} />
      )}

      {/* Avatar image or initials */}
      {src ? (
        <img src={src} alt={name} style={style}
          className={`rounded-full object-cover ring-2 ${frame.ring} relative z-10`} />
      ) : (
        <div style={style}
          className={`flex items-center justify-center rounded-full bg-gradient-to-br from-brand-gold-dim to-brand-gold font-display font-bold text-bg-base select-none ring-2 ${frame.ring} relative z-10`}>
          {initials}
        </div>
      )}

      {/* Level badge emoji */}
      {frame.badge && (
        <div className="absolute -bottom-1 -right-1 z-20 text-sm leading-none" title={frame.label}>
          {frame.badge}
        </div>
      )}
    </div>
  );
}
