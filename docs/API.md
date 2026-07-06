# Qoldau AI — API Reference (v0.6.0)

Backend API для Qoldau AI frontend. Prisma + SQLite/Postgres, Anthropic Claude (с mock fallback), magic-link auth.

**Base URL (dev):** `http://localhost:4000`
**Base URL (prod):** `https://api.your-domain.com`

v1.6 P1 authz: in production, `/api/children`, `/api/events`, and
`/api/recordings` require `Authorization: Bearer <jwt>`. The `REQUIRE_AUTH`
env flag defaults to production-on and local-demo-off.

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

The response includes `database.ok` and `database.provider` so deploy checks can see whether persistence is reachable.

### `GET /api/ready`

Readiness probe. Returns `200` when PostgreSQL is reachable and `503` when the database check fails.

```bash
curl http://localhost:4000/api/ready
```

```json
{
  "ok": true,
  "service": "qoldau-ai-proxy",
  "readiness": "ready",
  "database": { "ok": true, "provider": "postgresql", "latencyMs": 12 }
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

v1.6 P1: data routes require `Authorization: Bearer <jwt>` when `REQUIRE_AUTH=true`
(always true in production). In local demo with `REQUIRE_AUTH=false`, requests without
Bearer auth run as the deterministic demo parent.

### `GET /api/children`

```bash
curl http://localhost:4000/api/children \
  -H "Authorization: Bearer <jwt>"
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
curl http://localhost:4000/api/children/child-alikhan \
  -H "Authorization: Bearer <jwt>"
```

### `GET /api/children/:id/access`

Owner-only. Lists active access grants for the child.

```bash
curl http://localhost:4000/api/children/child-alikhan/access \
  -H "Authorization: Bearer <jwt>"
```

### `POST /api/children/:id/access`

Owner-only. Grants access by existing `userId` or by `email` (email creates a user if needed).

```bash
curl -X POST http://localhost:4000/api/children/child-alikhan/access \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{ "email": "tutor@example.com", "role": "tutor" }'
```

### `DELETE /api/children/:id/access/:userId`

Owner-only. Revokes an active access grant.

```bash
curl -X DELETE http://localhost:4000/api/children/child-alikhan/access/user-id \
  -H "Authorization: Bearer <jwt>"
```

---

## Events

### `GET /api/events?childId=xxx`

```bash
curl 'http://localhost:4000/api/events?childId=child-alikhan' \
  -H "Authorization: Bearer <jwt>"
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
curl http://localhost:4000/api/events/evt-abc123 \
  -H "Authorization: Bearer <jwt>"
```

### `POST /api/events`

```bash
curl -X POST http://localhost:4000/api/events \
  -H "Authorization: Bearer <jwt>" \
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
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{ "status": "confirmed", "description": "Подтверждено мамой" }'
```

### `DELETE /api/events/:id`

```bash
curl -X DELETE http://localhost:4000/api/events/evt-abc123 \
  -H "Authorization: Bearer <jwt>"
```

---

## Recordings

### `GET /api/recordings?childId=xxx`

```bash
curl 'http://localhost:4000/api/recordings?childId=child-alikhan' \
  -H "Authorization: Bearer <jwt>"
```

### `POST /api/recordings`

```bash
curl -X POST http://localhost:4000/api/recordings \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "childId": "child-alikhan",
    "label": "Я хочу пить",
    "durationSec": 8
  }'
```

### `DELETE /api/recordings/:id`

```bash
curl -X DELETE http://localhost:4000/api/recordings/rec-abc \
  -H "Authorization: Bearer <jwt>"
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
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh-token",
  "jwt": "same-as-accessToken",
  "user": { "id": "cmr2rnksc00008gdi043zfyif", "email": "parent@example.com", "role": "parent" }
}
```

### `POST /api/auth/refresh`

Rotates a refresh token and returns a new access/refresh pair.

```bash
curl -X POST http://localhost:4000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"refresh-token"}'
```

### `POST /api/auth/logout`

Revokes a refresh token.

```bash
curl -X POST http://localhost:4000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"refresh-token"}'
```

### `GET /api/auth/me`

```bash
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

```json
{
  "ok": true,
  "user": { "id": "...", "email": "parent@example.com", "role": "parent" },
  "childIds": ["child-alikhan"]
}
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

## Sync API (v1.6 P2)

All sync routes require Bearer access tokens. `pull` requires read access to the
child; `push` requires write/owner access depending on entity.

### `GET /api/sync/pull?childId=xxx&since=ISO`

Returns rows with `updatedAt > since`, including tombstones (`deletedAt`).

```json
{
  "ok": true,
  "events": [],
  "recordings": [],
  "children": [],
  "serverTime": "2026-07-06T00:00:00.000Z"
}
```

### `POST /api/sync/push`

Accepts up to 100 `events`, 100 `recordings`, and 100 `children` per request.
Conflict resolution is last-write-wins by `updatedAt`: older client rows are
reported in `conflicts`, equal versions are idempotent duplicates.

```json
{
  "events": [
    {
      "id": "evt-1",
      "childId": "child-1",
      "type": "food",
      "title": "Lunch",
      "description": "Ate lunch",
      "sourceRole": "parent",
      "updatedAt": "2026-07-06T00:00:00.000Z"
    }
  ]
}
```

Response:

```json
{ "ok": true, "applied": 1, "conflicts": [], "serverTime": "2026-07-06T00:00:01.000Z" }
```

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
