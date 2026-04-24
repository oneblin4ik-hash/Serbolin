// ─── Quest branches ──────────────────────────────────────────────────────────
export const BRANCHES = {
  HEALTH:   { key: 'HEALTH',   label: 'Здоровье',      emoji: '❤️', color: '#E53935', stat: 'energy' },
  BRAND:    { key: 'BRAND',    label: 'Контент',        emoji: '📈', color: '#D4A843', stat: 'discipline' },
  WEALTH:   { key: 'WEALTH',   label: 'Доход',          emoji: '💰', color: '#43A047', stat: 'strength' },
  MIND:     { key: 'MIND',     label: 'Саморазвитие',   emoji: '🧠', color: '#1E88E5', stat: 'endurance' },
  CUSTOM:   { key: 'CUSTOM',   label: 'Своё',           emoji: '✨', color: '#9C27B0', stat: null },
};

export const BRANCH_LIST = Object.values(BRANCHES);

// ─── Daily quest pools (NO workouts — workouts are tracked separately) ────────
export const QUEST_POOLS = {
  HEALTH: [
    { title: 'Выпить 2 литра воды', xp: 20, difficulty: 'easy' },
    { title: 'Лечь спать до 23:00', xp: 25, difficulty: 'easy' },
    { title: 'Принять контрастный душ', xp: 20, difficulty: 'easy' },
    { title: 'Медитация или дыхательные практики 10 мин', xp: 25, difficulty: 'easy' },
    { title: 'Отдых без телефона 30 мин', xp: 20, difficulty: 'easy' },
    { title: 'Прогулка на свежем воздухе 30+ мин', xp: 30, difficulty: 'medium' },
  ],
  BRAND: [
    { title: 'Опубликовать пост в Telegram', xp: 30, difficulty: 'medium' },
    { title: 'Снять и смонтировать Reel', xp: 50, difficulty: 'hard' },
    { title: 'Ответить на все комментарии', xp: 20, difficulty: 'easy' },
    { title: 'Записать stories (3+ шт.)', xp: 30, difficulty: 'medium' },
    { title: 'Написать скрипт для видео', xp: 40, difficulty: 'medium' },
    { title: 'Провести прямой эфир', xp: 60, difficulty: 'hard' },
  ],
  WEALTH: [
    { title: 'Записать все доходы и расходы за день', xp: 20, difficulty: 'easy' },
    { title: 'Обработать входящую заявку клиента', xp: 30, difficulty: 'medium' },
    { title: 'Выставить счёт / закрыть сделку', xp: 50, difficulty: 'hard' },
    { title: 'Связаться с 3 потенциальными клиентами', xp: 40, difficulty: 'medium' },
    { title: 'Создать новый оффер или продукт', xp: 50, difficulty: 'hard' },
    { title: 'Просмотреть финансовые показатели недели', xp: 25, difficulty: 'easy' },
  ],
  MIND: [
    { title: 'Прочитать 30 страниц книги', xp: 30, difficulty: 'medium' },
    { title: 'Записать 5+ идей для контента или бизнеса', xp: 20, difficulty: 'easy' },
    { title: 'Пройти онлайн-урок или мастер-класс', xp: 35, difficulty: 'medium' },
    { title: 'Написать план и цели на неделю', xp: 30, difficulty: 'medium' },
    { title: 'Просмотреть и проанализировать конкурентов', xp: 30, difficulty: 'medium' },
    { title: 'Проработать личную стратегию роста', xp: 40, difficulty: 'medium' },
  ],
};

// ─── Weekly boss templates ────────────────────────────────────────────────────
export const BOSS_TEMPLATES = [
  { title: 'Неделя железной дисциплины', description: 'Выполни 7 квестов за 7 дней', xpReward: 500, targets: { quests: 7 } },
  { title: 'Контент-марафон', description: 'Опубликуй 5 постов или Reels за неделю', xpReward: 400, targets: { posts: 5 } },
  { title: 'Неделя здоровья', description: 'Выполни 6 квестов категории «Здоровье»', xpReward: 350, targets: { health: 6 } },
  { title: 'Неделя продаж', description: 'Закрой 3 сделки или обработай 5 заявок', xpReward: 450, targets: { deals: 3 } },
];

// ─── Achievements ─────────────────────────────────────────────────────────────
export const ACHIEVEMENTS = [
  { key: 'first_quest',     emoji: '🎯', title: 'Первый квест',         description: 'Выполни первый квест',               xpReward: 50   },
  { key: 'streak_3',        emoji: '🔥', title: '3 дня подряд',         description: 'Страйк 3 дня без пропусков',         xpReward: 75   },
  { key: 'streak_7',        emoji: '🔥', title: 'Неделя без пропусков', description: 'Страйк 7 дней подряд',               xpReward: 150  },
  { key: 'streak_30',       emoji: '⚡', title: 'Месяц дисциплины',     description: 'Страйк 30 дней подряд',             xpReward: 500  },
  { key: 'iron_discipline', emoji: '🏆', title: 'Железная дисциплина',  description: 'Выполни 50 квестов',                xpReward: 300  },
  { key: 'content_machine', emoji: '📱', title: 'Контент-машина',       description: 'Опубликуй 20 постов',               xpReward: 200  },
  { key: 'first_post',      emoji: '📝', title: 'Первый пост',          description: 'Опубликуй первый контент',          xpReward: 50   },
  { key: 'perfect_week',    emoji: '💎', title: 'Идеальная неделя',     description: '7 квестов за 7 дней',               xpReward: 250  },
  { key: 'level_5',         emoji: '⭐', title: 'Чемпион',              description: 'Достигни 5-го уровня',              xpReward: 200  },
  { key: 'level_10',        emoji: '👑', title: 'Легенда',              description: 'Достигни 10-го уровня',             xpReward: 1000 },
  // Body / Mass-gain achievements
  { key: 'weight_80',       emoji: '💪', title: '+5 кг к массе',        description: 'Набрал 5+ кг от стартового веса',   xpReward: 200  },
  { key: 'weight_85',       emoji: '💪', title: '+10 кг к массе',       description: 'Набрал 10+ кг от стартового веса',  xpReward: 400  },
  { key: 'bicep_plus3',     emoji: '🦾', title: 'Бицепс растёт',        description: 'Бицепс вырос на 3+ см',             xpReward: 150  },
  { key: 'bicep_plus5',     emoji: '🦾', title: 'Бицепс +5 см',         description: 'Бицепс вырос на 5+ см',             xpReward: 300  },
  { key: 'chest_plus5',     emoji: '🫀', title: 'Грудь растёт',         description: 'Грудь выросла на 5+ см',            xpReward: 200  },
  { key: 'first_workout',   emoji: '🏋️', title: 'Первая тренировка',    description: 'Запиши первую тренировку',          xpReward: 50   },
  { key: 'workouts_50',     emoji: '🏅', title: '50 тренировок',        description: '50 записанных тренировок',          xpReward: 500  },
  { key: 'first_project',   emoji: '🚀', title: 'Первый проект',        description: 'Создай первый проект',              xpReward: 50   },
];

// ─── XP rewards ───────────────────────────────────────────────────────────────
export const XP_REWARDS = {
  QUEST_EASY:    30,
  QUEST_MEDIUM:  50,
  QUEST_HARD:    80,
  GOAL_STEP:     25,
  POST_TELEGRAM: 15,
  POST_REEL:     40,
  POST_STORY:    10,
  TASK_DEFAULT:  20,
  BODY_MEAS:     25, // XP per body measurement log
  BODY_PROGRESS: 50, // XP for positive mass-gain progress
};

export const DEFAULT_XP_OPTIONS = [10, 20, 30, 50, 75, 100, 150, 200];

// ─── Stat categories ─────────────────────────────────────────────────────────
export const STATS = [
  { key: 'strength',  label: 'Сила',       icon: 'Dumbbell', color: '#E53935', description: 'Физическая сила и мощь' },
  { key: 'discipline',label: 'Дисциплина', icon: 'Target',   color: '#D4A843', description: 'Регулярность и системность' },
  { key: 'energy',    label: 'Здоровье',   icon: 'Heart',    color: '#43A047', description: 'Самочувствие и восстановление' },
  { key: 'endurance', label: 'Интеллект',  icon: 'Brain',    color: '#1E88E5', description: 'Учёба, творчество, рост' },
];

// ─── Avatar evolution frames by level ────────────────────────────────────────
export const AVATAR_FRAMES = [
  { minLevel: 1,  label: 'Новичок',   ring: 'ring-bg-border',           glow: '',                              badge: '' },
  { minLevel: 3,  label: 'Воин',      ring: 'ring-brand-gold/40',        glow: '',                              badge: '⚔️' },
  { minLevel: 5,  label: 'Чемпион',   ring: 'ring-brand-gold',           glow: 'shadow-glow-gold',              badge: '🏆' },
  { minLevel: 8,  label: 'Архитект',  ring: 'ring-brand-gold',           glow: 'shadow-glow-gold animate-pulse-gold', badge: '🔱' },
  { minLevel: 10, label: 'Легенда',   ring: 'ring-2 ring-brand-gold-soft', glow: 'shadow-[0_0_30px_rgba(212,168,67,0.7)] animate-pulse-gold', badge: '👑' },
];

export function getAvatarFrame(level) {
  for (let i = AVATAR_FRAMES.length - 1; i >= 0; i--) {
    if (level >= AVATAR_FRAMES[i].minLevel) return AVATAR_FRAMES[i];
  }
  return AVATAR_FRAMES[0];
}

// ─── Brand settings ───────────────────────────────────────────────────────────
export const DEFAULT_BRAND = {
  niche:    'онлайн-фитнес тренер',
  audience: 'люди 25-45 лет, хотят результат без лишних сложностей',
  tone:     'дружески, прямо, с юмором, на «ты»',
  topics:   ['тренировки', 'питание', 'дисциплина', 'трансформация тела', 'онлайн-коучинг', 'бодибилдинг', 'пауэрлифтинг'],
  slogan:   'Терпение + Дисциплина = Результат',
  name:     'Эдуард Серболин',
  handle:   '@mr_serbolin',
};

// ─── Content idea templates ───────────────────────────────────────────────────
export const TELEGRAM_TEMPLATES = [
  { id: 'personal-story', title: 'Личная история', template: (topic, niche, audience) => `«Я раньше думал, что ${topic} — это сложно. Пока не попробовал сам. Вот что изменилось за [N] недель...»\n\n📌 Подходит для: ${audience}` },
  { id: 'myth-bust',      title: 'Разбор мифа',    template: (topic) => `«Все говорят, что [${topic}] не работает. Но вот факты:\n\n❌ Миф: ...\n✅ Правда: ...\n\nТерпение + Дисциплина = Результат»` },
  { id: 'checklist',      title: 'Чек-лист',       template: (topic, niche) => `«5 ошибок в ${topic || niche}, которые мешают результату:\n\n1. ...\n2. ...\n3. ...\n4. ...\n5. ...\n\nПодпишись, чтобы не повторять»` },
  { id: 'client-story',   title: 'История клиента',template: (topic) => `«Мой клиент пришёл с проблемой: [${topic || 'ситуация'}]. Через [N] недель — вот что произошло 👇»` },
  { id: 'behind-scenes',  title: 'За кулисами',    template: (topic) => `«Вот как выглядит ${topic || 'мой день'} на самом деле — без фильтров и красивых картинок 📸»` },
  { id: 'hot-take',       title: 'Острый взгляд',  template: (topic, niche) => `«Скажу то, о чём молчат другие тренеры: ${topic || niche} — это не то, что ты думаешь. Объясняю почему 👇»` },
];

export const REELS_TEMPLATES = [
  { id: 'transformation', title: 'Трансформация', template: (topic) => `🎬 Сценарий:\n0–3 сек: Хук — «Было вот так...\"\n3–15 сек: Проблема — ${topic || '[тема]'}\n15–45 сек: Процесс\n45–60 сек: Результат + призыв\n\n🎵 Динамичный трек` },
  { id: 'top3',           title: 'Топ-3 совета',  template: (topic) => `🎬 Сценарий:\n0–3 сек: «3 вещи о ${topic || '[теме]'}, которые изменят всё»\n3–20 сек: Совет 1\n20–40 сек: Совет 2\n40–55 сек: Совет 3\n55–60 сек: CTA\n\n🎵 Энергичный бит` },
  { id: 'myth-reel',      title: 'Развенчиваю миф',template: (topic) => `🎬 Сценарий:\n0–3 сек: «Это НЕПРАВДА о ${topic || '[теме]'}»\n3–25 сек: Показываю миф\n25–50 сек: Правда\n50–60 сек: Вывод\n\n🎵 Драматический переход` },
  { id: 'day-in-life',    title: 'День из жизни', template: () => `🎬 Сценарий:\n0–5 сек: Утро / тренировка\n5–20 сек: Работа с клиентами\n20–40 сек: Своя тренировка\n40–55 сек: Итог дня\n55–60 сек: Вывод\n\n🎵 Lifestyle-трек` },
  { id: 'client-win',     title: 'Победа клиента',template: (topic) => `🎬 Сценарий:\n0–5 сек: «Посмотри, что случилось с [именем]»\n5–30 сек: Было: ${topic || 'проблема'}\n30–55 сек: Стало: результат\n55–60 сек: CTA\n\n🎵 Вдохновляющий трек` },
];

// ─── Content platforms & formats ─────────────────────────────────────────────
export const PLATFORMS = [
  { key: 'telegram',  label: 'Telegram',  icon: '✈️', color: '#0088CC' },
  { key: 'instagram', label: 'Instagram', icon: '📸', color: '#E1306C' },
  { key: 'youtube',   label: 'YouTube',   icon: '▶️',  color: '#FF0000' },
];

export const FORMATS = {
  telegram:  [{ key: 'post', label: 'Пост' }, { key: 'story', label: 'Story' }],
  instagram: [{ key: 'post', label: 'Пост' }, { key: 'reel', label: 'Reel' }, { key: 'story', label: 'Story' }],
  youtube:   [{ key: 'video', label: 'Видео' }, { key: 'short', label: 'Short' }],
};

export const POST_STATUSES = [
  { key: 'idea',      label: 'Идея',         color: 'text-text-muted'   },
  { key: 'scripted',  label: 'Написано',     color: 'text-accent-blue'  },
  { key: 'filmed',    label: 'Снято',        color: 'text-brand-gold'   },
  { key: 'published', label: 'Опубликовано', color: 'text-accent-green' },
];

// ─── Project statuses ─────────────────────────────────────────────────────────
export const PROJECT_STATUSES = [
  { key: 'active',    label: 'Активный',   color: 'text-accent-green' },
  { key: 'paused',    label: 'На паузе',   color: 'text-brand-gold'   },
  { key: 'completed', label: 'Завершён',   color: 'text-text-muted'   },
];
