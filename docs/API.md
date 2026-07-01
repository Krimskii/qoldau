# Qoldau AI — API Reference (v0.4.0)

Backend API для Qoldau AI frontend. In-memory store, mock STT/AI.

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

- **v0.4.0 (текущая)** — in-memory store, mock STT/AI, Express + TS.
- **v0.5.0** — PostgreSQL/Prisma, real Whisper API, real LLM API.
- **v0.6.0** — Auth (OAuth magic link), multi-user.
- **v0.7.0** — WebSocket realtime, push notifications.
- **v1.0.0** — Production-ready, SaaS billing.