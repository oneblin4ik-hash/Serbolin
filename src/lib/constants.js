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

// ─── Achievements (30 total, tier: bronze/silver/gold, cat: strength/discipline/content/business/mental/hidden) ──
export const ACHIEVEMENTS = [
  // ── ДИСЦИПЛИНА ──
  { key: 'first_quest',     tier: 'bronze', cat: 'discipline', title: 'Первый шаг',           description: 'Выполни первый квест',                xpReward: 75   },
  { key: 'streak_3',        tier: 'bronze', cat: 'discipline', title: 'Первый рассвет',        description: '3 дня стрика подряд',                 xpReward: 75   },
  { key: 'streak_7',        tier: 'silver', cat: 'discipline', title: 'Неделя без пропусков',  description: '7 дней стрика подряд',                xpReward: 150  },
  { key: 'streak_30',       tier: 'gold',   cat: 'discipline', title: 'Месяц дисциплины',      description: '30 дней стрика подряд',               xpReward: 500  },
  { key: 'perfect_week',    tier: 'silver', cat: 'discipline', title: 'Идеальная неделя',      description: 'Выполни все квесты за 7 дней',        xpReward: 250  },
  { key: 'iron_discipline', tier: 'gold',   cat: 'discipline', title: 'Железная дисциплина',   description: 'Выполни 50 квестов',                  xpReward: 300  },
  // ── СИЛА ──
  { key: 'first_workout',   tier: 'bronze', cat: 'strength',   title: 'Первая тренировка',     description: 'Запиши первую тренировку',            xpReward: 50   },
  { key: 'workouts_10',     tier: 'silver', cat: 'strength',   title: 'Входит в привычку',     description: '10 записанных тренировок',            xpReward: 150  },
  { key: 'workouts_50',     tier: 'gold',   cat: 'strength',   title: '50 в зале',             description: '50 записанных тренировок',            xpReward: 500  },
  { key: 'weight_80',       tier: 'silver', cat: 'strength',   title: '+5 кг к массе',         description: 'Набрал 5+ кг от стартового веса',     xpReward: 200  },
  { key: 'weight_85',       tier: 'gold',   cat: 'strength',   title: '+10 кг к массе',        description: 'Набрал 10+ кг от стартового веса',    xpReward: 400  },
  { key: 'chest_plus5',     tier: 'bronze', cat: 'strength',   title: 'Грудь растёт',          description: 'Грудь выросла на 5+ см',              xpReward: 150  },
  { key: 'bicep_plus3',     tier: 'silver', cat: 'strength',   title: 'Бицепс растёт',         description: 'Бицепс вырос на 3+ см',               xpReward: 150  },
  { key: 'bicep_plus5',     tier: 'gold',   cat: 'strength',   title: 'Бицепс +5 см',          description: 'Бицепс вырос на 5+ см',               xpReward: 300  },
  // ── КОНТЕНТ ──
  { key: 'first_post',      tier: 'bronze', cat: 'content',    title: 'Первая публичка',       description: 'Опубликуй первый пост',               xpReward: 50   },
  { key: 'reels_10',        tier: 'silver', cat: 'content',    title: 'Я не клоун, я контент', description: '10 опубликованных Reels',             xpReward: 200  },
  { key: 'content_machine', tier: 'gold',   cat: 'content',    title: 'Контент-машина',        description: '30 постов опубликовано',              xpReward: 400  },
  { key: 'posts_streak',    tier: 'silver', cat: 'content',    title: 'Постоянство',           description: '3 поста в течение одной недели',      xpReward: 150  },
  { key: 'ideas_20',        tier: 'bronze', cat: 'content',    title: 'Идейный',               description: '20 идей сгенерировано',               xpReward: 75   },
  // ── БИЗНЕС ──
  { key: 'first_payment',   tier: 'bronze', cat: 'business',   title: 'Первые в очереди',      description: 'Первая оплата от клиента в CRM',      xpReward: 100  },
  { key: 'first_project',   tier: 'bronze', cat: 'business',   title: 'Первый проект',         description: 'Создай первый проект',                xpReward: 50   },
  { key: 'clients_5',       tier: 'silver', cat: 'business',   title: 'База растёт',           description: '5 клиентов добавлено',                xpReward: 200  },
  { key: 'revenue_100k',    tier: 'gold',   cat: 'business',   title: 'Шесть нулей',           description: '100 000 ₽ оборота в кошельке',        xpReward: 500  },
  // ── МЕНТАЛ ──
  { key: 'first_body',      tier: 'bronze', cat: 'mental',     title: 'Осознанность',          description: 'Первый замер тела',                   xpReward: 50   },
  { key: 'level_3',         tier: 'bronze', cat: 'mental',     title: 'Набирает силу',         description: 'Достигни 3-го уровня',                xpReward: 100  },
  { key: 'level_5',         tier: 'silver', cat: 'mental',     title: 'Чемпион',               description: 'Достигни 5-го уровня',                xpReward: 200  },
  { key: 'level_8',         tier: 'gold',   cat: 'mental',     title: 'Архитектор',            description: 'Достигни 8-го уровня',                xpReward: 500  },
  { key: 'level_10',        tier: 'gold',   cat: 'mental',     title: 'Легенда',               description: 'Достигни 10-го уровня',               xpReward: 1000 },
  // ── СКРЫТЫЕ ──
  { key: 'all_branches',    tier: 'gold',   cat: 'hidden',     title: 'Мастер всех путей',     description: '???',                                 xpReward: 300  },
  { key: 'boss_win',        tier: 'gold',   cat: 'hidden',     title: 'Охотник за боссами',    description: '???',                                 xpReward: 300  },
  { key: 'night_owl',       tier: 'silver', cat: 'hidden',     title: 'Ночная смена',          description: '???',                                 xpReward: 150  },
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
  { key: 'strength',  label: 'Сила',       icon: 'Dumbbell', color: '#E53935', description: 'Физические тренировки, тренажёрный зал, активность' },
  { key: 'discipline',label: 'Дисциплина', icon: 'Target',   color: '#D4A843', description: 'Регулярность, системность, соблюдение графика' },
  { key: 'energy',    label: 'Энергия',    icon: 'Heart',    color: '#43A047', description: 'Восстановление, сон, питание, шаги' },
  { key: 'endurance', label: 'Ментал',     icon: 'Brain',    color: '#7C3AED', description: 'Обучение, контент, творчество, рефлексия' },
];

export function getStatTier(value) {
  if (value >= 90) return 'Легенда';
  if (value >= 70) return 'Ветеран';
  if (value >= 50) return 'Мастер';
  if (value >= 30) return 'Практик';
  return 'Новичок';
}

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
  { key: 'idea',      label: 'Идея',      color: 'text-text-muted',   dot: '#666'    },
  { key: 'draft',     label: 'Черновик',  color: 'text-accent-blue',  dot: '#1E88E5' },
  { key: 'ready',     label: 'Готов',     color: 'text-brand-gold',   dot: '#D4A843' },
  { key: 'published', label: 'Опубликован', color: 'text-accent-green', dot: '#43A047' },
];

export const CONTENT_TONES = [
  { key: 'expert',      label: 'Подруга-эксперт',  desc: 'тёплый, поддерживающий' },
  { key: 'provocation', label: 'Провокация',        desc: 'мотивация на грани' },
  { key: 'humor',       label: 'Лёгкий юмор',       desc: 'самоирония' },
];

// ─── Project statuses ─────────────────────────────────────────────────────────
export const PROJECT_STATUSES = [
  { key: 'active',    label: 'Активный',   color: 'text-accent-green' },
  { key: 'paused',    label: 'На паузе',   color: 'text-brand-gold'   },
  { key: 'completed', label: 'Завершён',   color: 'text-text-muted'   },
];
