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

### 3. На телефоне

Используй мобильное приложение **Claude** (iOS / Android) или открой
**claude.ai/code** в мобильном браузере — это та же веб-сессия, что и на
десктопе, поэтому настройки и хуки те же самые.

## Добавление новых возможностей

- Чтобы добавить автоматические действия (`on save`, `on stop`, и т.д.) —
  правь секцию `hooks` в `.claude/settings.json`.
- Чтобы расширить права без подтверждения — добавляй паттерны в
  `permissions.allow`.
- Локальные (приватные) настройки положи в `.claude/settings.local.json` —
  он уже в `.gitignore`.
