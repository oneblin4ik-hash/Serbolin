// ─── Quest branches ──────────────────────────────────────────────────────────
export const BRANCHES = {
  BODY:     { key: 'BODY',     label: 'Тело',         emoji: '💪', color: '#E53935', stat: 'strength' },
  BRAND:    { key: 'BRAND',    label: 'Бренд',        emoji: '📈', color: '#D4A843', stat: 'discipline' },
  WEALTH:   { key: 'WEALTH',   label: 'Финансы',      emoji: '💰', color: '#43A047', stat: 'energy' },
  CREATION: { key: 'CREATION', label: 'Творчество',   emoji: '🧠', color: '#1E88E5', stat: 'endurance' },
  CUSTOM:   { key: 'CUSTOM',   label: 'Своё',         emoji: '✨', color: '#9C27B0', stat: null },
};

export const BRANCH_LIST = Object.values(BRANCHES);

// ─── Daily quest pools ───────────────────────────────────────────────────────
export const QUEST_POOLS = {
  BODY: [
    { title: 'Сделать 100 отжиманий', xp: 40, difficulty: 'medium' },
    { title: 'Выпить 2 литра воды', xp: 20, difficulty: 'easy' },
    { title: 'Пройти 10 000 шагов', xp: 30, difficulty: 'medium' },
    { title: 'Тренировка 45+ минут', xp: 60, difficulty: 'hard' },
    { title: 'Лечь спать до 23:00', xp: 25, difficulty: 'easy' },
    { title: 'Растяжка 15 минут', xp: 20, difficulty: 'easy' },
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
    { title: 'Записать все расходы за день', xp: 20, difficulty: 'easy' },
    { title: 'Обработать заявку клиента', xp: 30, difficulty: 'medium' },
    { title: 'Выставить счёт / закрыть сделку', xp: 50, difficulty: 'hard' },
    { title: 'Сделать финансовый отчёт недели', xp: 40, difficulty: 'medium' },
    { title: 'Связаться с 3 потенциальными клиентами', xp: 40, difficulty: 'medium' },
  ],
  CREATION: [
    { title: 'Прочитать 30 страниц книги', xp: 30, difficulty: 'medium' },
    { title: 'Записать идеи для контента (5+)', xp: 20, difficulty: 'easy' },
    { title: 'Изучить новую технику/упражнение', xp: 40, difficulty: 'medium' },
    { title: 'Написать план на неделю', xp: 30, difficulty: 'medium' },
    { title: 'Пройти онлайн-урок', xp: 35, difficulty: 'medium' },
  ],
};

// ─── Weekly boss templates ────────────────────────────────────────────────────
export const BOSS_TEMPLATES = [
  {
    title: 'Неделя железной дисциплины',
    description: 'Выполни 7 квестов за 7 дней подряд',
    xpReward: 500,
    targets: { quests: 7 },
  },
  {
    title: 'Контент-марафон',
    description: 'Опубликуй 5 постов или Reels за неделю',
    xpReward: 400,
    targets: { posts: 5 },
  },
  {
    title: 'Тело как инструмент',
    description: 'Проведи 4 тренировки за неделю',
    xpReward: 350,
    targets: { workouts: 4 },
  },
  {
    title: 'Неделя продаж',
    description: 'Закрой 3 сделки или обработай 5 заявок',
    xpReward: 450,
    targets: { deals: 3 },
  },
];

// ─── Achievements ─────────────────────────────────────────────────────────────
export const ACHIEVEMENTS = [
  { key: 'first_quest',      emoji: '🎯', title: 'Первый квест',         description: 'Выполни первый квест',                 xpReward: 50  },
  { key: 'streak_3',         emoji: '🔥', title: '3 дня подряд',         description: 'Страйк 3 дня без пропусков',           xpReward: 75  },
  { key: 'streak_7',         emoji: '🔥', title: 'Неделя без пропусков', description: 'Страйк 7 дней подряд',                 xpReward: 150 },
  { key: 'streak_30',        emoji: '⚡', title: 'Месяц дисциплины',     description: 'Страйк 30 дней подряд',               xpReward: 500 },
  { key: 'iron_discipline',  emoji: '🏆', title: 'Железная дисциплина',  description: 'Выполни 50 квестов',                  xpReward: 300 },
  { key: 'content_machine',  emoji: '📱', title: 'Контент-машина',       description: 'Опубликуй 20 постов',                 xpReward: 200 },
  { key: 'first_post',       emoji: '📝', title: 'Первый пост',          description: 'Опубликуй первый контент',            xpReward: 50  },
  { key: 'perfect_week',     emoji: '💎', title: 'Идеальная неделя',     description: '7 квестов за 7 дней',                 xpReward: 250 },
  { key: 'level_5',          emoji: '⭐', title: 'Чемпион',              description: 'Достигни 5-го уровня',                xpReward: 200 },
  { key: 'level_10',         emoji: '👑', title: 'Легенда',              description: 'Достигни 10-го уровня — максимум',    xpReward: 1000 },
];

// ─── XP rewards ───────────────────────────────────────────────────────────────
export const XP_REWARDS = {
  QUEST_EASY:   30,
  QUEST_MEDIUM: 50,
  QUEST_HARD:   80,
  GOAL_STEP:    25,
  POST_TELEGRAM:15,
  POST_REEL:    40,
  POST_STORY:   10,
  TASK_DEFAULT: 20,
};

// ─── Default XP options for tasks ────────────────────────────────────────────
export const DEFAULT_XP_OPTIONS = [10, 20, 30, 50, 75, 100];

// ─── Stat categories ─────────────────────────────────────────────────────────
export const STATS = [
  { key: 'strength',   label: 'Сила',        icon: 'Dumbbell',  color: '#E53935', description: 'Физическая сила и выносливость' },
  { key: 'discipline', label: 'Дисциплина',  icon: 'Target',    color: '#D4A843', description: 'Регулярность и системность' },
  { key: 'energy',     label: 'Энергия',     icon: 'Zap',       color: '#43A047', description: 'Жизненный тонус и восстановление' },
  { key: 'endurance',  label: 'Ментал',      icon: 'Brain',     color: '#1E88E5', description: 'Учёба, творчество, рост' },
];

// ─── Brand settings (Mr. Serbolin brand book) ─────────────────────────────────
export const DEFAULT_BRAND = {
  niche:    'онлайн-фитнес тренер',
  audience: 'люди 25-45 лет, хотят результат без лишних сложностей',
  tone:     'дружески, прямо, с юмором, на «ты»',
  topics:   ['тренировки', 'питание', 'дисциплина', 'трансформация тела', 'онлайн-коучинг', 'бодибилдинг', 'пауэрлифтинг'],
  slogan:   'Терпение + Дисциплина = Результат',
  name:     'Эдуард Серболин',
  handle:   '@mr_serbolin',
};

// ─── Content idea templates ────────────────────────────────────────────────────
export const TELEGRAM_TEMPLATES = [
  {
    id: 'personal-story',
    title: 'Личная история',
    template: (topic, niche, audience) =>
      `«Я раньше думал, что ${topic} — это сложно. Пока не попробовал сам. Вот что изменилось за [N] недель...»\n\n📌 Подходит для: ${audience}`,
  },
  {
    id: 'myth-bust',
    title: 'Разбор мифа',
    template: (topic) =>
      `«Все говорят, что [${topic}] не работает. Но вот факты:\n\n❌ Миф: ...\n✅ Правда: ...\n\nТерпение + Дисциплина = Результат»`,
  },
  {
    id: 'checklist',
    title: 'Чек-лист',
    template: (topic, niche) =>
      `«5 ошибок в ${topic || niche}, которые мешают результату:\n\n1. ...\n2. ...\n3. ...\n4. ...\n5. ...\n\nПодпишись, чтобы не повторять»`,
  },
  {
    id: 'client-story',
    title: 'История клиента',
    template: (topic) =>
      `«Мой клиент [имя/описание] пришёл с проблемой: [${topic || 'ситуация'}]. Через [N] недель — вот что произошло 👇»`,
  },
  {
    id: 'behind-scenes',
    title: 'За кулисами',
    template: (topic) =>
      `«Вот как выглядит ${topic || 'мой день'} на самом деле — без фильтров и красивых картинок 📸»`,
  },
  {
    id: 'hot-take',
    title: 'Острый взгляд',
    template: (topic, niche) =>
      `«Скажу то, о чём молчат другие тренеры: ${topic || niche} — это не то, что ты думаешь. Объясняю почему 👇»`,
  },
];

export const REELS_TEMPLATES = [
  {
    id: 'transformation',
    title: 'Трансформация (До/После)',
    template: (topic) =>
      `🎬 Сценарий:\n0–3 сек: Хук — «Было вот так...\"\n3–15 сек: Проблема/ситуация — ${topic || '[тема]'}\n15–45 сек: Процесс / что сделал\n45–60 сек: Результат + призыв подписаться\n\n🎵 Музыка: динамичный трек с нарастанием`,
  },
  {
    id: 'top3',
    title: 'Топ-3 совета (быстрый монтаж)',
    template: (topic) =>
      `🎬 Сценарий:\n0–3 сек: «3 вещи о ${topic || '[теме]'}, которые изменят всё»\n3–20 сек: Совет 1 — крупный план + текст на экране\n20–40 сек: Совет 2 — смена ракурса\n40–55 сек: Совет 3 — самый сильный аргумент\n55–60 сек: CTA — подпишись / сохрани\n\n🎵 Музыка: энергичный бит`,
  },
  {
    id: 'myth-reel',
    title: 'Развенчиваю миф',
    template: (topic) =>
      `🎬 Сценарий:\n0–3 сек: «Это НЕПРАВДА о ${topic || '[теме]'}» — резкий хук\n3–25 сек: Показываю миф / что делают неправильно\n25–50 сек: Объясняю правду — чёткий монтаж\n50–60 сек: Вывод + «Сохрани, чтобы не забыть»\n\n🎵 Музыка: драматический переход`,
  },
  {
    id: 'day-in-life',
    title: 'День из жизни тренера',
    template: () =>
      `🎬 Сценарий:\n0–5 сек: Утро — подъём / тренировка\n5–20 сек: Работа с клиентами / созвоны\n20–40 сек: Своя тренировка / питание\n40–55 сек: Результат дня / итог\n55–60 сек: «Вот почему онлайн-формат — это свобода»\n\n🎵 Музыка: лёгкий lifestyle-трек`,
  },
  {
    id: 'client-win',
    title: 'Победа клиента',
    template: (topic) =>
      `🎬 Сценарий:\n0–5 сек: «Посмотри, что случилось с [именем/описанием]»\n5–30 сек: Было: [ситуация до — ${topic || 'проблема'}]\n30–55 сек: Стало: результат + эмоции клиента\n55–60 сек: «Хочешь так же? Ссылка в профиле»\n\n🎵 Музыка: вдохновляющий трек`,
  },
];

// ─── Content platforms & formats ──────────────────────────────────────────────
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
  { key: 'idea',      label: 'Идея',        color: 'text-text-muted'      },
  { key: 'scripted',  label: 'Написано',    color: 'text-accent-blue'     },
  { key: 'filmed',    label: 'Снято',       color: 'text-brand-gold'      },
  { key: 'published', label: 'Опубликовано',color: 'text-accent-green'    },
];
