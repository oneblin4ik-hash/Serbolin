# Serbolin

**Serbolin** — персональная RPG-система трекинга жизни (Flutter Web + Supabase).
Превращает реальные действия (тренировки, контент, финансы) в игровые механики:
уровни, XP, достижения, квесты, босс недели.

## Стек

- **Flutter Web** (Dart, Material 3, dark-only тема)
- **Supabase** (PostgreSQL + Auth + RLS) — синхронизация между устройствами
- Single-user: авторизация нужна только чтобы данные жили в облаке

## Структура

```
lib/
├── main.dart                       # точка входа, AuthGate, MultiProvider
├── config.dart                     # SUPABASE_URL / SUPABASE_ANON_KEY
├── theme/app_theme.dart            # цвета + AppTheme.dark()
├── models/                         # player_stats, quest, workout, body_stat,
│                                   # achievement, client, boss
├── services/                       # supabase_service, xp_service,
│                                   # quest_service, achievement_service
├── widgets/                        # xp_bar, streak, quest_card, avatar,
│                                   # body_stat_bar, achievement_badge,
│                                   # level_up_overlay, achievement_popup
└── screens/                        # dashboard, character, training, stats,
                                    # crm, achievements, login, shell,
                                    # setup_required
supabase/migrations/001_initial.sql # полная схема + RLS политики
```

## Быстрый старт

### 1. Установи Flutter и зависимости

```bash
flutter --version   # нужен stable ≥ 3.19
flutter pub get
```

### 2. Создай Supabase-проект

1. Открой https://supabase.com → **New Project**.
2. Дождись, пока база поднимется.
3. В левом меню: **SQL Editor** → **New query** → вставь содержимое
   `supabase/migrations/001_initial.sql` и нажми **Run**.
4. В **Settings → API** скопируй:
   - `Project URL`  (вида `https://xxxxxx.supabase.co`)
   - `anon public key` (длинный JWT)

### 3. Создай аккаунт

В **Authentication → Users** нажми **Add user** → Email + password.
(По желанию: в **Authentication → Providers → Email** отключи confirmation
email, чтобы не подтверждать почту вручную.)

### 4. Запусти веб-приложение

```bash
flutter run -d chrome \
  --dart-define=SUPABASE_URL=https://xxxxxx.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=eyJhbGciOi...
```

Если ключи не переданы, приложение покажет экран **SETUP REQUIRED**
с этими же инструкциями.

### 5. Билд для продакшена

```bash
flutter build web --release \
  --dart-define=SUPABASE_URL=... \
  --dart-define=SUPABASE_ANON_KEY=...
```

Содержимое `build/web/` можно раскатить на любой статический хостинг
(Netlify, Cloudflare Pages, GitHub Pages, Vercel, Supabase Storage).

## Тема и визуал

| Color         | Hex       | Usage                              |
|---------------|-----------|-------------------------------------|
| Background    | `#0D0D0D` | основной фон (дисциплина)          |
| Surface       | `#1E1E1E` | карточки, диалоги                  |
| Accent Gold   | `#C9A84C` | достижения, XP, акценты            |
| Accent Red    | `#8B1A1A` | опасность, расходы, легенды        |
| Text          | `#F0F0F0` | основной текст                     |
| Subtext       | `#888888` | второстепенный                     |

Шрифт: **Rajdhani** через `google_fonts` (русская кириллица поддерживается).

## Что уже работает

- 🏠 **Dashboard** — уровень/ранг, анимированный XP-бар, streak с пульсом огня,
  дневные квесты (авто-генерация 2 штук + кастомные), босс недели, 4 ветки
  развития → переход в нужную вкладку Stats.
- 🧍 **Character** — аватар-силуэт (3 стадии по уровню), body stats с
  прогресс-барами к целям, 4 атрибута героя. Level-up overlay с confetti.
- 🏋 **Training** — месячный календарь с отметками, полноэкранная форма
  логирования (дата, группы мышц чипами, динамический список упражнений,
  заметки, слайдер восстановления). Автоматический XP + бонус за PR.
- 📊 **Stats** — 4 вкладки с `fl_chart`: XP-линия 30 дней + heatmap,
  график веса и замеров, контент (ручной ввод + график подписчиков),
  финансы (3 карточки + бар по месяцам).
- 💼 **CRM** — 4 вкладки: клиенты (поиск), лиды (со статусом-цветом и
  конвертацией в клиенты), финансы (доход/расход/баланс + группировка
  по дням), задачи с опциональным XP за выполнение.
- 🏆 **Achievements** — сетка бейджей: 10 ачивок + pop-up с confetti и
  анимацией при разблокировке. XP начисляется автоматически.
- 🎁 **Streak-бонусы** (×1.10 / ×1.20 / ×1.40 / ×1.80) и 10% шанс
  случайного `+100 XP` применяются ко всему.
- 🔐 **Auth Gate** с email-паролем, Supabase сессия живёт в IndexedDB.
- 🛡 **RLS** — на всех таблицах политики `auth.uid() = user_id`.

## XP-экономика (дефолты)

```
Действие                   XP
─────────────────────────────
Тренировка                 50
Личный рекорд             150
Новый клиент              100
Диалог с клиентом          25
Финансовая операция        15
Reel / публикация          40
Авто-квест (easy/mid/hard) 30 / 50 / 80
+1 кг веса                100
+1 см бицепс              120
+2 см грудь               150
+2 см бедро               150
```

Уровни: `500 · 1000 · 2000 · 3000 · 4500 · 6000 · 8000 · 10000 · 15000`.
Ранги:
`Novice` (1-2) → `Warrior` (3-4) → `Champion` (5-6) →
`Architect of Discipline` (7-8) → `Legend` (9-10).

## Дальнейшие улучшения

- Реальные PNG-ассеты аватара (`assets/avatar/level_{1,2,3}.png`).
  Сейчас вместо них — сгенерированный силуэт, меняющий пропорции с уровнем.
- Звук разблокировки ачивки (положи файл в `assets/audio/`
  и подключи `audioplayers`).
- Web-push для ежедневного напоминания (через Service Worker).

---

## Claude Code on the web / mobile

Этот репозиторий также настроен для работы с **Claude Code** (CLI, web,
mobile). Всё в `.claude/`: `settings.json`, `hooks/session-start.sh`.
