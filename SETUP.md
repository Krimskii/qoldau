# Qoldau AI — Setup Guide

> **Status:** Stage 1 demo-ready · v0.7.5
> **Branch:** `v0.7.5-stage1-demo` (эта ветка — source of truth для Stage 1)
> **Stack:** React 18 + Vite + Zustand + Tailwind + i18next (ru/kk/en) + Express + TS + Prisma (SQLite) + Sentry + WebSocket

---

## 1. Clone

```bash
# Клонируем конкретную ветку (Stage 1 demo-ready)
git clone -b v0.7.5-stage1-demo git@github.com:Krimskii/qoldau.git
cd qoldau

# Альтернатива: full clone + checkout
git clone git@github.com:Krimskii/qoldau.git
cd qoldau
git checkout v0.7.5-stage1-demo
```

> **SSH key** должен быть в `~/.ssh/id_ed25519` (или `id_rsa`) и добавлен в GitHub.
> Проверить: `ssh -T git@github.com` → "Hi Krimskii!"

---

## 2. Install dependencies

```bash
# Backend
cd apps/api
npm install
npx prisma migrate deploy     # применить миграции (создаст prisma/dev.db)
npx prisma generate           # сгенерировать Prisma Client

# Frontend
cd ../prototype
npm install

# Вернуться в корень
cd ../..
```

> ⚠️ **Если `npm install` падает на `npm ci`-like ошибках** (esbuild/netbsd-arm64 и т.п.):
> Это известный npm bug с cross-platform optional deps. Используй `npm install` вместо `npm ci`.

---

## 3. Environment variables

```bash
# Backend
cp apps/api/.env.example apps/api/.env
cp apps/prototype/.env.example apps/prototype/.env
```

**По умолчанию всё mock** (AI, STT, Sentry, auth magic-link). Для реальных интеграций:

| Env | Default | Effect |
|---|---|---|
| `OPENAI_API_KEY` | (empty) | Включает real AI: OpenAI `gpt-4o-mini` (LLM) + Whisper (STT). Один ключ на оба |
| `OPENAI_LLM_MODEL` | `gpt-4o-mini` | Override модели LLM |
| `WHISPER_API_KEY` | (empty) | (опц.) отдельный ключ для STT; иначе берётся `OPENAI_API_KEY` |
| `SENTRY_DSN` | (empty) | Включает backend error tracking |
| `VITE_SENTRY_DSN` | (empty) | Включает frontend error tracking |
| `JWT_SECRET` | dev-secret | **Обязательно сменить в проде** |
| `REDIS_URL` | (empty) | Включает Redis кэш (иначе in-memory) |
| `DATABASE_URL` | `file:./prisma/dev.db` | SQLite по умолчанию |
| `CORS_ORIGIN` | localhost:5173 | Для прод-деплоя |

---

## 4. Run dev servers

**Открой 2 терминала:**

```bash
# Terminal 1 — Backend (http://localhost:4000)
cd apps/api
npm run dev
# → Qoldau API v0.7.2 listening on http://localhost:4000
# → health: http://localhost:4000/api/health
```

```bash
# Terminal 2 — Frontend (http://localhost:5173)
cd apps/prototype
npm run dev
# → Local: http://localhost:5173/
```

Открой http://localhost:5173 — должен открыться landing page (Overview).

---

## 5. Verify work

```bash
# Backend health
curl http://localhost:4000/api/health

# Real voice pipeline health (v0.7.6) — поле mode показывает real vs mock:
curl http://localhost:4000/api/ai/health      # → mode:"openai"  (real) или "mock"
curl http://localhost:4000/api/stt/health     # → mode:"whisper" (real) или "mock"
curl http://localhost:4000/api/audio/health   # → {service:"audio-pipeline", mode:"sync", maxAudioMb}

# Backend tests
cd apps/api && npm test
# → 18/18 passing

# Frontend tests
cd apps/prototype && npm test
# → 20/20 passing

# Frontend build
cd apps/prototype && npm run build
# → dist/ (PWA, SW)
```

---

## 6. Demo flow

1. Открой http://localhost:5173 → landing "Qoldau AI"
2. **Parent**: нажми "Открыть приложение" → демо-профили (Демо-профиль 1/2/3)
3. **Child**: переключи роль → child UI (большие кнопки, без тревоги)
4. **Tutor / Specialist**: аналитика, ABC-анализ, события
5. **Theme toggle**: light/dark/system
6. **Language**: ru / kk / en переключение в шапке

### Real voice pipeline (v0.7.6)

Полный голосовой flow: `Parent → VoiceObservation → запись (MediaRecorder) →
POST /api/audio/ingest → STT (Whisper) → LLM (OpenAI gpt-4o-mini) → Event → Timeline`.

- `VoiceObservation.tsx` использует `MediaRecorder`, если он доступен в браузере;
  иначе (или при недоступном backend) — fallback на Web Speech / demo-flow, demo
  не ломается.
- Провайдеры opt-in: без `OPENAI_API_KEY` STT и LLM работают в mock-режиме
  (штатный fallback). Один ключ включает и распознавание, и структуризацию.
- Детали, режимы (full/STT-only/LLM-only/mock), контракт client/hook и
  smoke-test — в [docs/HANDOFF_PC_SETUP.md](docs/HANDOFF_PC_SETUP.md) и
  [docs/AGENT_WORKFLOW.md](docs/AGENT_WORKFLOW.md).

---

## Sync between devices (multi-device workflow)

| Что | Где | Как синхронизировать |
|---|---|---|
| **Код** | `v0.7.5-stage1-demo` на GitHub | `git pull` на каждом устройстве |
| **.env файлы** | локально, **не в Git** | Не коммитить. Копировать из `.env.example` вручную или через `setup.sh` |
| **База данных** | `apps/api/prisma/dev.db` | **Не синхронизировать** (у каждого своя). `prisma migrate deploy` создаст заново |
| **Recordings** | `apps/api/uploads/` (если используется) | **Не синхронизировать** |
| **node_modules** | локально | `npm install` на каждом устройстве |

### Типичный цикл
```bash
# На устройстве A: написал код
git add -A
git commit -m "..."
git push origin v0.7.5-stage1-demo

# На устройстве B: подтянуть
git checkout v0.7.5-stage1-demo
git pull
npm install      # если были новые deps
```

---

## Sync between AI sessions (Mavis / mavis)

Каждая Mavis session имеет свой контекст. Чтобы не терять знания о проекте:

1. **Project memory** — `C:\Users\user\qoldau\AGENTS.md` (создаётся при bootstrap)
   - Описывает архитектуру, conventions, design rules
2. **Agent memory** — `C:\Users\user\.mavis\agents\mavis\memory\MEMORY.md`
   - Knowledge specific to this agent across all Qoldau sessions
3. **User profile** — `C:\Users\user\.mavis\agents\mavis\memory\user_profile.md`
   - Как пользователь предпочитает работать

Mavis автоматически читает memory при старте session. Дополнительная настройка не нужна — просто работай, и важные знания сохранятся.

---

## Troubleshooting

| Проблема | Решение |
|---|---|
| `npm ci` падает с `EBADPLATFORM` (netbsd-arm64 etc.) | Используй `npm install` (cross-platform). Lock содержит `extraneous: true` маркеры — это known issue npm/cli#4828 |
| `prisma migrate deploy` не находит миграции | Убедись, что `apps/api/prisma/migrations/` содержит `*_init/migration.sql`. Если пусто — `npx prisma migrate dev --name init` |
| `Port 4000 already in use` | `Get-NetTCPConnection -LocalPort 4000` → kill PID. Или сменить `PORT` в `.env` |
| Frontend показывает ошибку Web Speech | Это ок — браузер без поддержки (Firefox) автоматически fallback на mock |
| Sentry шлёт ошибки хотя DSN не задан | Sentry opt-in, без `SENTRY_DSN` ничего не отправляет |
| CORS ошибка в браузере | Проверь `CORS_ORIGIN` в `apps/api/.env` — должен включать `http://localhost:5173` |

---

## Production deployment (Phase 2)

Stage 1 = demo. Production deployment требует:

- **PostgreSQL** вместо SQLite (multi-tenant)
- **Redis** для кэша
- **S3 / R2** для recordings storage
- **Stripe / CloudPayments** для подписок
- **Resend / SES** для magic-link emails
- **Capacitor APK** signing keystore
- **Vercel / Railway / Render** для хостинга

Все эти задачи в `docs/PHASE_2_BACKLOG.md` (16 задач P0–P4).

---

## Useful links

- **Live demo** (после deploy): TBD
- **GitHub**: https://github.com/Krimskii/qoldau
- **PR #1** (v0.7.4 + v0.7.5 → master, blocked на 39 conflicts): https://github.com/Krimskii/qoldau/pull/1
- **Stage 1 docs**: `docs/DEMO_FLOW_QA.md`, `docs/CURRENT_ARCHITECTURE.md`
- **Phase 2 backlog**: `docs/PHASE_2_BACKLOG.md`