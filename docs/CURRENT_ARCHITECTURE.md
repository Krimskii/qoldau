# Qoldau AI — Current Architecture (v0.6.4)

> Единая точка входа для разработчика, попавшего в проект.
> Последнее обновление: 2026-07-02 (v0.6.4)

---

## 1. TL;DR

**Qoldau AI** — voice-first платформа сопровождения детей с РАС.
Монорепо из двух приложений:

- **`apps/prototype/`** — frontend SPA (React 18 + TypeScript + Vite + Tailwind + Zustand)
- **`apps/api/`** — backend API (Express + TypeScript + Prisma + SQLite/Postgres + cache)

**Real integrations (opt-in через env):**
- **STT** — `Web Speech API` в браузере (Chrome/Edge/Safari, free) + `Whisper API` на backend (если `WHISPER_API_KEY` задан)
- **LLM** — `Anthropic Claude claude-3-5-haiku` через `@anthropic-ai/sdk` (если `ANTHROPIC_API_KEY` задан)
- **Auth** — magic-link → HS256 JWT (без SMTP в dev-mode, токен возвращается в ответе)
- **DB** — Prisma + SQLite (dev) / Postgres (prod-ready, swap `provider` в `schema.prisma`)
- **Cache** — in-memory LRU (default) / Redis (если `REDIS_URL` задан)

**Без ключей** — всё работает в demo-mode с mock fallback. Приложение полностью функционально offline (frontend localStorage), backend можно вообще не поднимать.

---

## 2. Project structure

```
qoldau/
├── apps/
│   ├── prototype/                       # Frontend SPA
│   │   ├── public/
│   │   │   ├── manifest.webmanifest    # PWA basics
│   │   │   ├── qoldau-logo.svg
│   │   │   └── assets/icons/           # Soft 3D PNG + 2D child icons
│   │   ├── src/
│   │   │   ├── main.tsx                # Root: ErrorBoundary + App
│   │   │   ├── app/
│   │   │   │   ├── App.tsx
│   │   │   │   └── router.tsx          # 48+ routes, /404, /overview
│   │   │   ├── pages/
│   │   │   │   ├── overview/           # Landing (3 role cards + demo CTA)
│   │   │   │   ├── auth/               # LoginPage, VerifyPage (magic-link)
│   │   │   │   ├── parent/             # 12 страниц
│   │   │   │   ├── child/              # 17 страниц
│   │   │   │   ├── tutor/              # 5 страниц
│   │   │   │   ├── specialist/         # 8 страниц
│   │   │   │   └── errors/NotFoundPage # 404
│   │   │   ├── components/
│   │   │   │   ├── layout/             # AppShell, BottomNav, ChildTopBar, DemoIndicator
│   │   │   │   ├── ui/                 # QoldauCard, Skeleton, EmptyState, ErrorBoundary, HealthCheckBanner
│   │   │   │   └── icons/              # 2D + 3D icon registry
│   │   │   ├── store/                  # 10 Zustand stores
│   │   │   │   ├── useAuthStore.ts     # JWT в localStorage
│   │   │   │   ├── useEventStore.ts    # Events + loading state
│   │   │   │   ├── useVoiceObservationStore.ts
│   │   │   │   └── ...
│   │   │   ├── api/                    # API client + auth client
│   │   │   │   ├── client.ts           # fetch + fallback
│   │   │   │   └── auth.ts             # magic-link client
│   │   │   └── lib/
│   │   │       ├── stt/                # useSpeechRecognition (Web Speech API)
│   │   │       └── ai/                 # aiParser types
│   │   ├── vite.config.ts              # manualChunks для code splitting
│   │   └── index.html                  # PWA meta, theme-color, viewport-fit=cover
│   └── api/                            # Backend API
│       ├── prisma/
│       │   ├── schema.prisma           # Child/Event/Recording/User/MagicToken
│       │   ├── migrations/             # init + auth_user_magic_token
│       │   └── seed.ts                 # 3 детей + 13 demo событий
│       ├── src/
│       │   ├── index.ts                # Express app + Prisma + cache + seed
│       │   ├── routes/                 # health, events, recordings, children, stt, ai, auth
│       │   ├── services/               # llmService (Claude), sttService (Whisper), authService
│       │   ├── repositories/           # eventsRepo, recordingsRepo, childrenRepo
│       │   ├── db/                     # prisma client, cache (MemoryCache + RedisCache)
│       │   └── middleware/             # logger, rateLimit
│       ├── test/                       # vitest smoke tests (16 passed)
│       ├── vitest.config.ts
│       └── .env.example                # DATABASE_URL, REDIS_URL, ANTHROPIC_API_KEY, WHISPER_API_KEY, JWT_SECRET
├── docs/                               # 30 markdown файлов
└── packages/                           # (пусто, planned для shared types)
```

---

## 3. Frontend

### Routing
- `HashRouter` (для совместимости с Capacitor / GH Pages)
- `/` → `/overview` (landing)
- `*` → `NotFoundPage` (не редирект)
- 48+ route'ов в `src/app/router.tsx`

### State management
10 Zustand stores:
- **`useAuthStore`** — JWT, login/logout, init from localStorage
- **`useEventStore`** — events + loading state + apiMode + optimistic writes
- **`useVoiceObservationStore`** — recording state machine
- **`useRoleStore`** — current role (parent/child/tutor/specialist/overview)
- **`useDemoStore`** — guided demo steps (18 шагов)
- **`useDemoControlsStore`** — сброс demo данных
- **`useAssetStore`** — lazy asset loading
- **`useChildSettingsStore`** — child UI personalization (font/contrast/calm)
- **`useRecordingsStore`** — voice recordings
- **`useToastStore`** — глобальные уведомления

### Real STT (v0.6.0)
`useSpeechRecognition` hook — browser-native Web Speech API.
- ru-RU по умолчанию, interim results, silence timeout
- Mock fallback если браузер не поддерживает (Chrome/Edge/Safari — да, Firefox — нет)

### Code splitting (v0.6.3)
`vite.config.ts` manualChunks:
- `react-vendor` (179kB): react, react-dom, scheduler
- `icons-vendor`: lucide-react
- `app-vendor`: react-router, zustand
- `vendor`: остальное
- Главный chunk: 524kB → 329kB (gzip 83kB)

### Mobile & PWA
- `viewport-fit=cover` + `env(safe-area-inset-*)` в AppShell, ChildTopBar, BottomNav
- `manifest.webmanifest` — standalone, theme-color #009688
- Capacitor Android scaffold (`apps/prototype/android/`) — готово к native build

---

## 4. Backend

### Stack
- Express 4 + TypeScript + ESM
- Prisma 5 (SQLite dev / Postgres prod)
- helmet (security headers), cors, morgan (logging)
- express-rate-limit на /auth/, /ai/, /stt/

### Endpoints (18)
```
GET  /                          # service info + AI/STT status
GET  /api/health                # db status, AI/STT mode
GET  /api/stats                 # events + recordings count
POST /api/reset                 # clear all data (dev only)
GET  /api/children
GET  /api/children/:id
GET  /api/events?childId=...
GET  /api/events/:id
POST /api/events
PATCH /api/events/:id
DELETE /api/events/:id
GET  /api/recordings
POST /api/recordings
DELETE /api/recordings/:id
POST /api/stt/transcribe        # Whisper/mock
GET  /api/stt/health
POST /api/ai/parse              # Claude/mock
GET  /api/ai/health
POST /api/auth/request-magic-link
POST /api/auth/verify
GET  /api/auth/me
```

### Real LLM (v0.6.0)
`llmService.parseTranscript()` через `@anthropic-ai/sdk`:
- Model: `claude-3-5-haiku-20241022` (default, cheap)
- Structured output через `tool_use` (parse_observation tool с JSON schema)
- System prompt: осторожные формулировки, отказ от диагнозов, whitelist event types
- Mock fallback на keyword matcher при отсутствии ключа или ошибке

### Real STT backend (v0.6.3)
`sttService.transcribe()` через OpenAI Whisper API:
- Multipart upload (audio.webm → Whisper)
- Model: `whisper-1` (default)
- Mock fallback (фиксированный transcript) при отсутствии ключа

### Auth (v0.6.0)
Magic-link flow без SMTP (dev):
- `POST /api/auth/request-magic-link { email }` → `{ token, expiresAt, devMagicUrl }`
- `POST /api/auth/verify { token }` → `{ jwt, user }` (HS256, 8ч TTL)
- `GET /api/auth/me` (Bearer)
- Production: подключить Resend/SES в `authService.requestMagicLink()`

### Cache (v0.5.0)
- `Cache` interface: `get/set/del/clear`
- `MemoryCache` (default, LRU на 1000 keys)
- `RedisCache` (auto-switch если `REDIS_URL` задан)
- TTL 30s для event lists

### Rate limiting (v0.6.3)
- `/api/auth/*` — 10 req / 15 min
- `/api/ai/*` — 30 req / min
- `/api/stt/*` — 20 req / min

### Tests (v0.6.3)
- `vitest` + `supertest`
- 16/16 passed за 3.16s
- `test/health.test.ts`, `test/ai.test.ts`, `test/auth.test.ts`
- `npm test` / `npm run test:watch`

---

## 5. Data flow

### Parent voice flow
1. User → `/parent/voice`
2. Click mic → `useSpeechRecognition.start()` (browser-native STT)
3. Live transcript preview (interim results)
4. Click stop → `speech.stop()` + `transcribeManual(text)` в store
5. Edit transcript → `processWithAI()` → `POST /api/ai/parse`
6. Backend: `llmService.parseTranscript()` → Claude (или mock)
7. Return events + insight + clarification questions
8. → `/parent/ai-review` для подтверждения

### Child AAC flow
1. User → `/child/cards`
2. Tap card → `addEvent({ type: 'aac_card', ... })` в `useEventStore`
3. Optimistic update UI + фоновый sync в API
4. → toast feedback (speak-pulse 280ms)

### Auth flow
1. Landing → «Войти» → `/auth/login`
2. Submit email → `POST /api/auth/request-magic-link`
3. Backend создаёт `User` + `MagicToken` (TTL 15 мин)
4. Returns `{ token, devMagicUrl }` (без SMTP)
5. → `/auth/verify?token=...`
6. `POST /api/auth/verify` → JWT
7. Save в `qoldau-auth-v1` (localStorage) + `useAuthStore` state
8. → landing

---

## 6. Safety & compliance

- Все AI-выводы формулируются: «Похоже…», «Возможно…», «Это гипотеза, не диагноз»
- Запрещены формулировки: «лечит», «диагностирует», «исправляет», «нормализует», «ИИ точно понял причину»
- Disclaimer на landing, в EventDetails, в AI Review
- Детский UI: NO ambient/loop animations, only one-shot feedback ≤300ms (DESIGN_RULES.md)
- AAC tap-zones ≥64px, BottomNav max 3 items
- Personalization: font scale, contrast, calm visual, global pause («Тишина»)

---

## 7. Deployment

`docs/DEPLOYMENT.md` — 3 варианта:
- Vercel (frontend) + Railway/Render (backend)
- VPS + Docker (docker-compose.yml в репо)
- GitHub Pages (frontend only, mock mode)

Env vars (production):
- `DATABASE_URL=postgresql://...`
- `REDIS_URL=redis://...`
- `ANTHROPIC_API_KEY=sk-ant-...`
- `WHISPER_API_KEY=sk-...`
- `JWT_SECRET=<random 32+ chars>`
- `CORS_ORIGIN=https://qoldau.example.com`
- `NODE_ENV=production`

---

## 8. Changelog

- **v0.3.x** — child UI (NeedCard, PhraseBuilder, phrase flow, BottomNav redesign)
- **v0.4.0** — Backend API (Express+TS, 15 endpoints, frontend API client)
- **v0.5.0** — Prisma + SQLite + cache layer
- **v0.5.1** — Child exit + DemoIndicator alignment
- **v0.6.0** — Web Speech API + Anthropic Claude + magic-link auth
- **v0.6.1** — Объединить Тьютор+Специалист, убрать Обзор, safe-area
- **v0.6.2** — Вернуть landing /overview с 3 ролями + демо
- **v0.6.3** — safe-area, PWA, ErrorBoundary, 404, HealthCheck, rate-limit, Whisper
- **v0.6.4** — Skeleton + EmptyState + EventStore loading state
