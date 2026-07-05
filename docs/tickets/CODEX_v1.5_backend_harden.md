# Ticket — Codex — укрепление и устойчивость бэкенда (v1.5 hardening)

## Зачем
Бэкенд работает и покрыт тестами, но это прод-прокси на реальном ключе OpenAI —
его надо постоянно укреплять по надёжности/безопасности/стоимости. Ниже — конкретные
слабые места, найденные по коду (не абстракция). Контракт ответов НЕ менять,
поведение для клиента — то же, меняем только устойчивость.

> Зона: **только `apps/api/**`.** Никаких изменений схемы ответов существующих
> эндпоинтов (frontend на них завязан). Всё новое — за флагами/дефолтами, безопасными
> для прода.

```
# в worktree qoldau-be (Codex):
git fetch origin
git switch -c feature/v1.5-backend-harden origin/integration/v1.5
```

---

## P0 — надёжность upstream и защита от дорогих вызовов

### 1. Таймаут и ретраи на OpenAI-клиенте
[llmService.ts:127](../../apps/api/src/services/llmService.ts) — сейчас `new OpenAI({ apiKey })`
без таймаута (дефолт SDK = **600 сек**) и с дефолтными ретраями.
- Задать явно: `new OpenAI({ apiKey, timeout: Number(process.env.OPENAI_TIMEOUT_MS ?? 30000), maxRetries: Number(process.env.OPENAI_MAX_RETRIES ?? 2) })`.
- Убедиться, что таймаут-ошибка классифицируется как `network` (уже есть на
  [llmService.ts:423](../../apps/api/src/services/llmService.ts)) → graceful fallback на mock,
  а не 500. Тест: замокать таймаут → ответ `aiFallback:true`, `aiError:'network'`, 200.

### 2. Cap на длину входа `/api/ai/parse`
[ai.ts:42](../../apps/api/src/routes/ai.ts) — валидируется только наличие `transcript`.
При `JSON_BODY_LIMIT=35mb` можно прислать гигантский текст → дорогой LLM-вызов.
- Ввести `MAX_TRANSCRIPT_CHARS` (env, дефолт **4000**). `trim()`; если пусто после trim
  или длиннее лимита → `400 { ok:false, error:'transcript too long' | 'transcript required' }`.
- Аналогично защитить `/api/ai/digest`: cap на размеры `notes[]`/`topTypes[]`/кол-во ключей
  `eventCounts` (напр. ≤50 записей, строки ≤500 симв.).

### 3. Разнести body-лимиты по типу роута
[index.ts:61](../../apps/api/src/index.ts) — `express.json({ limit: '35mb' })` глобально.
Большой боди нужен только audio (base64-аудио). Для ai/stt/health текстовый JSON.
- Глобально понизить до **256kb** (`JSON_BODY_LIMIT_DEFAULT`), а `35mb` (`JSON_BODY_LIMIT_AUDIO`)
  применить **точечно** только на `/api/audio` (в его роутере `express.json({limit})`).
- Проверить, что audio-ingest всё ещё принимает свой боди, а `/api/ai/parse` с боди >256kb
  отвечает 413, не доходя до LLM.

---

## P1 — единообразная валидация и наблюдаемость

### 4. Runtime-валидация входов через zod
Добавить `zod` (dep) и схемы запросов для `/api/ai/parse`, `/api/ai/digest`, `/api/stt`,
`/api/audio/ingest`. Тонкий middleware `validateBody(schema)` → при ошибке единый
`400 { ok:false, error, issues }`. Централизовать сюда PII-guard из digest
([ai.ts:16-40](../../apps/api/src/routes/ai.ts) `FORBIDDEN_DIGEST_FIELDS`) — оставить
поведение (reject transcript/childName), но декларативно в схеме.

### 5. Request-id и структурные логи
- Middleware: на каждый запрос генерировать `x-request-id` (nanoid, уже в deps), класть в
  `req` и в response-заголовок; логгер ([logger.ts](../../apps/api/src/middleware/logger.ts))
  и error-handler ([index.ts:84](../../apps/api/src/index.ts)) — включать `requestId`.
- Error-response 500 — добавить `requestId` в тело (для сопоставления с логами/Sentry),
  тело ошибки НЕ раскрывает stack/detail.

### 6. Валидация env на старте
`loadEnv`/новый `assertEnv()` при boot: если `NODE_ENV=production` и нет `OPENAI_API_KEY` —
явный `console.warn` «AI работает в mock-режиме» (не падать); если задан кривой
`OPENAI_TIMEOUT_MS`/`PORT` (NaN) — предупредить и использовать дефолт. Health уже отдаёт
`enabled/source` — не ломать.

---

## P2 — эксплуатация

### 7. Graceful shutdown с форс-таймером
[index.ts:99](../../apps/api/src/index.ts) — `httpServer.close()` без таймаута: зависшие
keep-alive соединения не дадут процессу выйти.
- Добавить force-exit таймер (`SHUTDOWN_TIMEOUT_MS` дефолт 10000): если `close` не завершился —
  `process.exit(1)`. Игнорировать повторный SIGTERM.

### 8. `.env` в репозитории — проверить и убрать из индекса
В `apps/api/` лежит `.env` (и `dev.log`, `dev-err.log`, `dev.db`, `test.db`). Проверить,
что `.env` **не** содержит реального ключа и **не** в git-индексе; при необходимости
`git rm --cached apps/api/.env` + дополнить `.gitignore` (`*.log`, `prisma/prisma/*.db`).
**Ключи не коммитить.**

---

## Границы (не делать)
- Не менять форму ответов существующих эндпоинтов, промпт (`parse-ru.v3`), eval-набор.
- Не трогать frontend. Не подключать в index.ts DB-роуты (auth/events/children/recordings),
  если они не были смонтированы — это отдельная задача, вне hardening.

## Проверки / отправка
```
cd apps/api && npm run typecheck && npm test && npm run eval   # всё зелёное; тесты не убыли
git push -u origin feature/v1.5-backend-harden
```
> Если push падает (TLS/SNI) — `git bundle create qoldau-backend-harden.bundle feature/v1.5-backend-harden` в Downloads.

## Отчёт
- SHA ветки; по каждому пункту P0–P2 — сделано/пропущено (почему);
- вывод typecheck/test/eval (число тестов ↑, % евала не упал);
- новые env-переменные (имена+дефолты) — списком, чтобы обновить Railway и `.env.example`;
- подтверждение: контракт ответов не изменился (frontend не ломается).

После этого Claude вливает `feature/v1.5-backend-harden` в `integration/v1.5` и передеплоит
Railway. Новые env — прописать в Railway перед деплоем.
