/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#0b0d12',
          soft: '#11141b',
          card: '#171b24',
          hover: '#1d2330',
          border: '#242a38',
        },
        brand: {
          DEFAULT: '#8b5cf6',
          soft: '#a78bfa',
          deep: '#6d28d9',
        },
        accent: {
          gold: '#f5c451',
          green: '#22c55e',
          red: '#ef4444',
          blue: '#3b82f6',
          cyan: '#06b6d4',
        },
        text: {
          primary: '#f3f4f6',
          secondary: '#9ca3af',
          muted: '#6b7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px -4px rgba(139, 92, 246, 0.45)',
        card: '0 4px 16px -4px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'xp-fly': 'xp-fly 1.4s ease-out forwards',
        'level-up': 'level-up 1.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.25s ease-out',
      },
      keyframes: {
        'xp-fly': {
          '0%': { opacity: '0', transform: 'translateY(20px) scale(0.9)' },
          '20%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '80%': { opacity: '1', transform: 'translateY(-12px) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-40px) scale(0.95)' },
        },
        'level-up': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
