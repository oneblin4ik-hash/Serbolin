# 🦝 Енот Лютик — Telegram-бот v1

Личный ИИ-ассистент Эдуарда Серболина. Принимает задачи и отчёты в Telegram (@MrSerbolinbot), ведёт систему жизни в Notion через Anthropic API. Один Cloudflare Worker, без своей БД.

```
Telegram → webhook → Cloudflare Worker → Anthropic API (мозг)
                                       → Notion API (базы системы)
                                       → Telegram Bot API (ответы)
```

## Что умеет

| Сообщение | Действие |
|---|---|
| «сегодня: снять рилс, тренировка в 12, ответить клиентам» | создаёт задачи в Notion (Сегодня ✓, дата, день недели, сфера) |
| «добавь / надо / не забыть…» | добавляет задачу |
| «Аня из инсты хочет консультацию в субботу» | запись в Лидах (Новая заявка, источник, дата) |
| «тренировку сделал, рилс снял…» или `/done <отчёт>` | отмечает задачи Готово, пишет привычки в журнал, спрашивает про невыполненные |
| «перенеси» / «сними» (после отчёта) | переносит на завтра / ставит Отложено |
| `/today` | план дня по приоритетам + привычки |
| `/week` | обзор недели по статусам |
| всё остальное | заметка в Базу знаний или человеческий ответ |

Сообщения с чужих chat_id игнорируются (заглушка «Я личный ассистент Эдуарда 🦝»).

## Деплой

```bash
cd lutik-bot
npm install

# Секреты (4 шт.)
npx wrangler secret put TELEGRAM_BOT_TOKEN       # от BotFather
npx wrangler secret put TELEGRAM_WEBHOOK_SECRET  # случайная строка: openssl rand -hex 32
npx wrangler secret put ANTHROPIC_API_KEY        # console.anthropic.com
npx wrangler secret put NOTION_TOKEN             # notion.so/my-integrations

npx wrangler deploy
```

Интеграции Notion нужно выдать доступ к странице-хабу «Система жизни — Эдуард» (все базы внутри неё): Share → пригласить интеграцию.

Зарегистрировать webhook (подставить токен, секрет и URL воркера из вывода deploy):

```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -d "url=https://lutik-bot.<account>.workers.dev/webhook" \
  -d "secret_token=<TELEGRAM_WEBHOOK_SECRET>"
```

### Опционально: KV-контекст диалога

Без KV бот stateless (вопрос «перенести/снять» работает через запрос открытых задач). С KV — помнит последние 6 пар сообщений и точный список невыполненных задач:

```bash
npx wrangler kv namespace create LUTIK_CONTEXT
# раскомментировать блок [[kv_namespaces]] в wrangler.toml, вставить id
npx wrangler deploy
```

## Приёмочные тесты

1. «сегодня: снять рилс, тренировка в 12, ответить клиентам» → 3 задачи в Notion с галочкой Сегодня
2. `/today` → список этих задач
3. «Аня из инстаграма, хочет ведение, созвон завтра» → запись в Лидах
4. «тренировку сделал, рилс снял, клиентам не ответил» → 2 задачи Готово, привычка «силовая» в журнале, вопрос про перенос третьей
5. сообщение с чужого аккаунта → заглушка, никаких действий

## Логи

```bash
npx wrangler tail
```

Любая ошибка Notion/Anthropic не роняет воркер: пользователю уходит «🦝 Споткнулся: …», детали — в логах.

## Структура

```
src/
  index.ts     — webhook: проверка секрета, ранний ответ 200, ctx.waitUntil
  handlers.ts  — маршрутизация, интенты, /today, /week, вечерний отчёт, KV
  brain.ts     — Anthropic API: классификация + сопоставление отчёта
  notion.ts    — все операции с базами Notion
  telegram.ts  — sendMessage
  config.ts    — ID баз, сферы, константы, Env
  dates.ts     — даты в UTC+5
```

v2 (заложено, не реализовано): голосовые, cron-брифы, недельные метрики, автопостинг в канал, Google Calendar.
