export const STAT_CATEGORIES = [
  {
    key: 'willpower',
    label: 'Сила воли',
    color: '#ef4444',
    icon: 'Flame',
    description: 'Задачи, которые тяжело начать.',
  },
  {
    key: 'discipline',
    label: 'Дисциплина',
    color: '#3b82f6',
    icon: 'Target',
    description: 'Регулярные, повторяющиеся действия.',
  },
  {
    key: 'focus',
    label: 'Фокус',
    color: '#06b6d4',
    icon: 'Brain',
    description: 'Глубокая работа и учёба.',
  },
  {
    key: 'creativity',
    label: 'Креатив',
    color: '#f5c451',
    icon: 'Sparkles',
    description: 'Новые идеи, контент, творчество.',
  },
];

export const STAT_MAP = Object.fromEntries(
  STAT_CATEGORIES.map((c) => [c.key, c])
);

export const DEFAULT_XP_REWARDS = [10, 20, 30, 50, 75, 100];
