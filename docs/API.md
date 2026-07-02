# Qoldau AI — API Reference (v0.6.0)

Backend API для Qoldau AI frontend. Prisma + SQLite/Postgres, Anthropic Claude (с mock fallback), magic-link auth.

**Base URL (dev):** `http://localhost:4000`
**Base URL (prod):** `https://api.your-domain.com`

Все ответы имеют формат `{ ok: true, ... }` или `{ ok: false, error: string }`.

---

## Health

### `GET /api/health`

```bash
curl http://localhost:4000/api/health
```

```json
{
  "ok": true,
  "service": "qoldau-api",
  "version": "0.4.0",
  "phase": 1,
  "uptime": 12.34,
  "timestamp": "2026-07-01T..."
}
```

### `POST /api/reset`

Полный сброс in-memory store (для demo / tests).

```bash
curl -X POST http://localhost:4000/api/reset
# {"ok":true,"message":"Store cleared"}
```

---

## Children

### `GET /api/children`

```bash
curl http://localhost:4000/api/children
```

```json
{
  "ok": true,
  "count": 3,
  "children": [
    { "id": "child-alikhan", "name": "Алихан", "age": 7, ... }
  ]
}
```

### `GET /api/children/:id`

```bash
curl http://localhost:4000/api/children/child-alikhan
```

---

## Events

### `GET /api/events?childId=xxx`

```bash
curl 'http://localhost:4000/api/events?childId=child-alikhan'
```

Response:
```json
{
  "ok": true,
  "count": 50,
  "events": [
    {
      "id": "evt-abc123",
      "childId": "child-alikhan",
      "type": "water",
      "title": "Выпил воду",
      "description": "~150 мл",
      "timestamp": "2026-07-01T09:00:00.000Z",
      "sourceRole": "parent",
      "status": "confirmed",
      "payload": { "amount": 150 }
    }
  ]
}
```

### `GET /api/events/:id`

```bash
curl http://localhost:4000/api/events/evt-abc123
```

### `POST /api/events`

```bash
curl -X POST http://localhost:4000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "childId": "child-alikhan",
    "type": "water",
    "title": "Выпил воду",
    "description": "~150 мл",
    "sourceRole": "child",
    "status": "confirmed",
    "payload": { "amount": 150 }
  }'
```

Required fields: `childId`, `type`, `title`, `description`, `sourceRole`.
Optional: `timestamp`, `status`, `confidence`, `rawText`, `linkedEventIds`, `payload`.

### `PATCH /api/events/:id`

```bash
curl -X PATCH http://localhost:4000/api/events/evt-abc123 \
  -H "Content-Type: application/json" \
  -d '{ "status": "confirmed", "description": "Подтверждено мамой" }'
```

### `DELETE /api/events/:id`

```bash
curl -X DELETE http://localhost:4000/api/events/evt-abc123
```

---

## Recordings

### `GET /api/recordings?childId=xxx`

```bash
curl 'http://localhost:4000/api/recordings?childId=child-alikhan'
```

### `POST /api/recordings`

```bash
curl -X POST http://localhost:4000/api/recordings \
  -H "Content-Type: application/json" \
  -d '{
    "childId": "child-alikhan",
    "label": "Я хочу пить",
    "durationSec": 8
  }'
```

### `DELETE /api/recordings/:id`

```bash
curl -X DELETE http://localhost:4000/api/recordings/rec-abc
```

---

## STT (mock, Phase 1)

### `POST /api/stt/transcribe`

Имитирует распознавание речи (1.5с задержка, фиксированный результат).
Phase 2: заменяется на Whisper / Web Speech API.

```bash
curl -X POST http://localhost:4000/api/stt/transcribe \
  -H "Content-Type: application/json" \
  -d '{}'
```

Response:
```json
{
  "ok": true,
  "transcript": "Алихан поел кашу с сыром...",
  "confidence": 0.87,
  "durationSec": 18,
  "sttSource": "mock"
}
```

---

## AI Parser (mock, Phase 1)

### `POST /api/ai/parse`

Keyword-matching по русскому тексту (портировано из `aiParser.mock.ts`).
Phase 2: заменяется на Claude/GPT-4 function calling.

```bash
curl -X POST http://localhost:4000/api/ai/parse \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "Алихан поел кашу, потом закрывал уши"
  }'
```

Response:
```json
{
  "ok": true,
  "events": [
    { "timestamp": "10:30", "title": "Поел", "description": "...", "type": "food" },
    { "timestamp": "10:30", "title": "Закрывал уши", "description": "...", "type": "sensory" }
  ],
  "insight": "Похоже, в наблюдении 2 события...",
  "clarificationQuestions": [
    { "id": "water-amount", "question": "Сколько воды выпил?", "options": ["Мало", "Нормально", ...] }
  ],
  "aiSource": "mock"
}
```

---

## Error codes

| Code | Когда |
| ---- | ----- |
| 400 | Не переданы обязательные поля |
| 404 | Ресурс не найден |
| 500 | Внутренняя ошибка сервера |

Все ошибки:
```json
{
  "ok": false,
  "error": "Human-readable message"
}
```

---

## Phase plan

- **v0.4.0** — in-memory store, mock STT/AI, Express + TS.
- **v0.5.0** — Prisma + SQLite, cache layer (in-memory / Redis), seed.
- **v0.6.0 (текущая)** — Anthropic Claude (real LLM с mock fallback), magic-link auth (JWT), Web Speech API на frontend.
- **v0.7.0** — WebSocket realtime, push notifications.
- **v1.0.0** — Production-ready, SaaS billing.

---

## Auth (v0.6.0)

Magic-link flow без SMTP в dev-режиме (токен возвращается в ответе). В production подключи SMTP/Resend.

### `POST /api/auth/request-magic-link`

```bash
curl -X POST http://localhost:4000/api/auth/request-magic-link \
  -H "Content-Type: application/json" \
  -d '{"email":"parent@example.com"}'
```

```json
{
  "ok": true,
  "token": "tVYWharuG3-VMNCM7-ptaVL7i3j4SVqI",
  "expiresAt": "2026-07-02T00:43:35.225Z",
  "devMagicUrl": "http://localhost:5173/auth/verify?token=tVYWharuG3-VMNCM7-ptaVL7i3j4SVqI"
}
```

### `POST /api/auth/verify`

```bash
curl -X POST http://localhost:4000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"token":"tVYWharuG3-VMNCM7-ptaVL7i3j4SVqI"}'
```

```json
{
  "ok": true,
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "cmr2rnksc00008gdi043zfyif", "email": "parent@example.com", "role": "parent" }
}
```

### `GET /api/auth/me`

```bash
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

```json
{ "ok": true, "user": { "id": "...", "email": "parent@example.com", "role": "parent" } }
```

### `GET /api/ai/health`

```bash
curl http://localhost:4000/api/ai/health
```

```json
{ "ok": true, "service": "ai", "enabled": false, "mode": "mock", "model": "claude-3-5-haiku-20241022" }
```

`enabled: true` — если `ANTHROPIC_API_KEY` задан. `mode: "claude"` значит реальный LLM; `mode: "mock"` — keyword-fallback.

---

## AI Parser (v0.6.0)

`POST /api/ai/parse` работает через `llmService`:
- если `ANTHROPIC_API_KEY` задан — Anthropic Claude (claude-3-5-haiku) с structured tool_use output
- если нет — keyword-based mock (как в v0.4.0)

В обоих случаях формат ответа одинаковый:

```json
{
  "ok": true,
  "events": [{ "timestamp": "12:30", "title": "Поел", "description": "...", "type": "food" }],
  "insight": "Похоже, в наблюдении 4 событий. Это гипотеза, не диагноз. Можно обсудить со специалистом.",
  "clarificationQuestions": [...],
  "aiSource": "claude" | "mock",
  "model": "claude-3-5-haiku-20241022"
}
```

---

## Environment variables (v0.6.0)

| Variable | Default | Описание |
| -------- | ------- | -------- |
| `DATABASE_URL` | `file:./prisma/dev.db` | Prisma connection (SQLite/Postgres) |
| `REDIS_URL` | пусто | Если задан — Redis cache. Иначе in-memory |
| `PORT` | `4000` | HTTP port |
| `NODE_ENV` | `development` | production / development |
| `CORS_ORIGIN` | `http://localhost:5173,http://localhost:4173` | Comma-separated allowed origins |
| `ANTHROPIC_API_KEY` | пусто | Real Claude LLM. Без ключа — mock fallback |
| `ANTHROPIC_MODEL` | `claude-3-5-haiku-20241022` | Override модели |
| `JWT_SECRET` | dev-secret | Обязателен в production |