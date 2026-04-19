# Serbolin — Claude Code Remote Control Setup

Этот репозиторий настроен для работы с **Claude Code** на всех устройствах:
веб, десктоп (CLI), и мобильный телефон.

## Что настроено

- `.claude/settings.json` — общие настройки, права доступа (permissions),
  регистрация SessionStart-хука.
- `.claude/hooks/session-start.sh` — скрипт, который поднимает окружение
  (устанавливает зависимости npm / pip / poetry / cargo / go / bundler,
  если соответствующие манифесты появятся в репозитории).
- `.gitignore` — базовые исключения.

## Как пользоваться

### 1. На компьютере (CLI)

Установи Claude Code один раз:

```bash
npm install -g @anthropic-ai/claude-code
```

Запусти в корне репозитория:

```bash
claude
```

Настройки из `.claude/settings.json` подхватятся автоматически.

### 2. В браузере (Claude Code on the web)

Зайди на **https://claude.ai/code**, подключи этот GitHub-репозиторий.
При старте сессии выполнится `.claude/hooks/session-start.sh`, который
подготовит окружение.

### 3. На телефоне (iOS / Android)

**Вариант А — мобильное приложение Claude (рекомендуется):**

1. Установи приложение:
   - iOS: App Store → «Claude by Anthropic»
     (https://apps.apple.com/app/claude-by-anthropic/id6473753684)
   - Android: Google Play → «Claude by Anthropic»
     (https://play.google.com/store/apps/details?id=com.anthropic.claude)
2. Войди тем же аккаунтом Anthropic, что и на компьютере.
3. В приложении открой раздел **Claude Code** → **Connect GitHub** и выбери
   репозиторий `oneblin4ik-hash/Serbolin` (после мёржа этого PR в `main`).
4. Нажми **New session** — SessionStart-хук из этого репо подхватится
   автоматически, как и на десктопе/вебе.

**Вариант Б — мобильный браузер:**

Открой на телефоне **https://claude.ai/code**, подключи тот же репозиторий —
это та же веб-сессия, те же настройки, тот же хук. Можно добавить страницу
на главный экран («Добавить на экран «Домой»»), чтобы был иконка-ярлык.

**Синхронизация между устройствами:**

Сессии привязаны к аккаунту Anthropic, поэтому то, что ты начал на
компьютере, видно и на телефоне, и наоборот. Настройки из
`.claude/settings.json` едины для всех трёх каналов — менять их нужно
только в репозитории.

## Добавление новых возможностей

- Чтобы добавить автоматические действия (`on save`, `on stop`, и т.д.) —
  правь секцию `hooks` в `.claude/settings.json`.
- Чтобы расширить права без подтверждения — добавляй паттерны в
  `permissions.allow`.
- Локальные (приватные) настройки положи в `.claude/settings.local.json` —
  он уже в `.gitignore`.
