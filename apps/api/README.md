# Qoldau AI backend API (v0.4.0)

Минимальный Express + TypeScript сервер для Qoldau AI.
Phase 1: in-memory store, mock STT/AI endpoints.

## Запуск (локально)

```bash
cd apps/api
npm install
npm run dev          # запускает tsx watch на порту 4000
```

или в продакшен-режиме:

```bash
npm run build
npm start            # node dist/index.js на PORT=4000
```

## Переменные окружения

| Name | Default | Описание |
| ---- | ------- | -------- |
| `PORT` | `4000` | HTTP port |
| `CORS_ORIGIN` | `http://localhost:5173` | CORS allowlist (comma-separated) |
| `NODE_ENV` | (dev) | `production` для prod-режима (combined log) |

## API Endpoints

Полная документация: [`docs/API.md`](../../docs/API.md).

```
GET  /api/health
GET  /api/children
GET  /api/children/:id
GET  /api/events?childId=
GET  /api/events/:id
POST /api/events
PATCH /api/events/:id
DELETE /api/events/:id
GET  /api/recordings?childId=
POST /api/recordings
DELETE /api/recordings/:id
POST /api/stt/transcribe   (mock STT)
GET  /api/stt/health
POST /api/ai/parse         (mock AI)
GET  /api/ai/health
POST /api/reset            (полный сброс)
```

## Docker

```bash
docker build -t qoldau-api apps/api
docker run -p 4000:4000 qoldau-api
```

## Roadmap

- **Phase 1 (v0.4.0, текущая)** — Express + in-memory + mock STT/AI.
- **Phase 2** — PostgreSQL/Prisma + Redis cache.
- **Phase 3** — Real Whisper API (замена mock STT).
- **Phase 4** — Claude/GPT-4 function calling (замена mock AI).
- **Phase 5** — Auth (OAuth magic link).
- **Phase 6** — WebSocket realtime + push notifications.