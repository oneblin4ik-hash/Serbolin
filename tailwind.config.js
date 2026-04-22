/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette — Mr. Serbolin
        'brand-gold':     '#D4A843',
        'brand-gold-dim': '#B8902E',
        'brand-gold-soft':'#E8C46A',
        'bg-base':        '#111111',
        'bg-soft':        '#1A1A1A',
        'bg-card':        '#1E1E1E',
        'bg-hover':       '#282828',
        'bg-border':      '#2E2E2E',
        'text-primary':   '#FFFFFF',
        'text-secondary': '#E6E6E6',
        'text-muted':     '#A0A0A0',
        'accent-red':     '#E53935',
        'accent-green':   '#43A047',
        'accent-blue':    '#1E88E5',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-gold': '0 0 20px rgba(212,168,67,0.35)',
        'glow-sm':   '0 0 8px rgba(212,168,67,0.2)',
      },
      keyframes: {
        'fade-in':  { from: { opacity: 0 }, to: { opacity: 1 } },
        'slide-up': { from: { transform: 'translateY(12px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
        'xp-float': { '0%': { transform: 'translateY(0)', opacity: 1 }, '100%': { transform: 'translateY(-60px)', opacity: 0 } },
        'pulse-gold': { '0%,100%': { boxShadow: '0 0 8px rgba(212,168,67,0.2)' }, '50%': { boxShadow: '0 0 20px rgba(212,168,67,0.5)' } },
      },
      animation: {
        'fade-in':    'fade-in 0.2s ease-out',
        'slide-up':   'slide-up 0.25s ease-out',
        'xp-float':   'xp-float 1.4s ease-out forwards',
        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
