# Qoldau AI — Current Architecture

> Единая точка входа для разработчика, попавшего в проект.

---

## Wave 0 RC Source Of Truth

Branch baseline: `integration/v1.0rc-pilot-ru` at `48557e4`.

Pilot architecture is per-device + stateless AI proxy:

```text
VoiceObservation
  -> MediaRecorder
  -> POST /api/audio/ingest
  -> STT (OpenAI Whisper)
  -> LLM parser (OpenAI gpt-4o-mini)
  -> stateless response
  -> frontend creates local Event
  -> Event Timeline
```

Backend does not store family events for the Wave 0 path. The app stores pilot data on-device in localStorage/Zustand. Backend runtime is the HTTPS AI proxy only.

### Audio Response Contract

`POST /api/audio/ingest` returns:

```ts
{
  ok: true;
  jobId: string;
  status: 'completed';
  transcript: string;
  events: Array<{
    timestamp?: string;
    title: string;
    description: string;
    type: string;
    sourceRole: string;
  }>;
  insight: string;
  questions: Array<{ id?: string; text: string; options?: string[] }>;
  sttMode: 'whisper' | 'mock' | string;
  aiMode: 'openai' | 'mock' | string;
  aiFallback?: boolean;
  aiError?: string;
  durationSec?: number;
  ai: {
    source: 'openai' | 'mock' | string;
    model: string;
    insight: string;
    fallback?: boolean;
    error?: string;
    clarificationQuestions: Array<{ id?: string; text: string; options?: string[] }>;
  };
}
```

LLM usage is logged server-side only in `apps/api/src/services/llmService.ts`:
`[llm] openai usage { model, promptTokens, completionTokens, totalTokens }`.
The log must not include transcript text, names, audio, or child identifiers.

### Runtime Behaviour

- Real AI success: `sttMode:"whisper"`, `aiMode:"openai"`, `aiFallback:false`, parsed events are inserted locally once.
- AI quota/network/provider error: backend returns `aiMode:"mock"`, `aiFallback:true`, `aiError:"quota" | "rate_limit" | "invalid_json" | "network" | "provider_error"`. Frontend must show an honest unavailable state and offer manual save/retry.
- No key / mock mode: `aiMode:"mock"`, `aiFallback:false`. This is expected for local demo without backend secrets.
- Manual save fallback: VoiceObservation can save/edit transcript manually if AI is unavailable.
- Retry: user can record again after an unavailable state.

### Release Env Model

- Backend/proxy env contains `OPENAI_API_KEY`, optional `WHISPER_API_KEY`, `OPENAI_LLM_MODEL`, `WHISPER_MODEL`, `SENTRY_DSN`, CORS, and rate limits.
- Frontend/APK env contains only `VITE_API_BASE_URL=https://<prod-proxy-url>` plus optional frontend Sentry DSN.
- APK must not contain OpenAI, STT, LLM, keystore, or server secrets.
- Production APK must call HTTPS. LAN/localhost HTTP is debug only.
- `capacitor://localhost` should be allowed in backend `CORS_ORIGIN` for Capacitor requests.

---

## ⚠️ v0.8 — Per-device stateless (актуально, приоритет над деталями ниже)

Пилот-архитектура зафиксирована: **per-device + stateless AI-прокси** (см.
[ROADMAP_V1.md](ROADMAP_V1.md)). Это переопределяет часть деталей ниже, написанных
для v0.7.x:

- **Backend = stateless AI-прокси.** `POST /api/audio/ingest` → Whisper STT →
  OpenAI LLM → возвращает `{ transcript, events[], insight, questions, sttMode,
  aiMode }`. **НЕ пишет в БД, НЕ хранит события, НЕ имеет пользователей.**
- **Routes только:** `/api/health`, `/api/stt`, `/api/ai`, `/api/audio`.
  Убраны `events`/`recordings`/`children`/`auth`/`reset`.
- **Realtime (socket.io) — удалён.** Данные per-device, синк между устройствами
  не нужен. `useRealtimeEvents` убран с фронта; события вставляются локально в
  `useEventStore` (фронт генерит `id`/`childId`/`status`).
- **Prisma/Postgres/auth/multi-tenant — не в пилотном пути.** Данные семьи —
  локально (localStorage).
- **Провайдеры (v1.0):** LLM = **OpenAI** `gpt-4o-mini` (`aiMode: openai|mock`);
  STT = **OpenAI Whisper** `whisper-1` (`sttMode: whisper|mock`). Один ключ
  `OPENAI_API_KEY` на оба (STT берёт `WHISPER_API_KEY || OPENAI_API_KEY`).
  Anthropic Claude больше не используется (мигрировано в v1.0).

Разделы ниже (Realtime WebSocket, auth-routes, DB-write pipeline) — исторические
для v0.7.x; в пилоте v1.0 они не используются.

---

## 1. TL;DR

**Qoldau AI** — voice-first платформа сопровождения детей с РАС.
Монорепо из двух приложений:

- **`apps/prototype/`** — frontend SPA (React 18 + TypeScript + Vite + Tailwind + Zustand)
- **`apps/api/`** — backend API (Express + TypeScript + Prisma + SQLite/Postgres + cache)

**Stage 1 demo MVP (v0.7.4) — готов к демонстрации.**

**Real integrations (opt-in через env):**
- **STT**: Web Speech API в браузере (Chrome/Edge/Safari) + `Whisper API` на backend (если `WHISPER_API_KEY`)
- **LLM**: `OpenAI gpt-4o-mini` (если `OPENAI_API_KEY`) — мигрировано с Claude в v1.0
- **Auth**: magic-link → HS256 JWT (без SMTP в dev, devMagicUrl в response)
- **DB**: Prisma + SQLite (dev) / Postgres (prod-ready, swap `provider` в `schema.prisma`)
- **Cache**: in-memory LRU (default) / Redis (если `REDIS_URL`)
- **Realtime**: socket.io (broadcast events на /api/events) + JWT auth middleware
- **Sentry**: opt-in error tracking (frontend + backend, через `SENTRY_DSN` / `VITE_SENTRY_DSN`)
- **PWA**: vite-plugin-pwa + Workbox runtime caching, offline-capable

**Без ключей** — всё работает в demo-mode с mock fallback. Приложение полностью функционально offline (frontend localStorage), backend можно вообще не поднимать.

---

## 2. Project structure

```
qoldau/
├── apps/
│   ├── prototype/                       # Frontend SPA
│   │   ├── public/
│   │   │   ├── manifest.webmanifest     # PWA basics
│   │   │   ├── qoldau-logo.svg
│   │   │   └── assets/icons/             # Soft 3D PNG + 2D child icons
│   │   ├── src/
│   │   │   ├── main.tsx                 # Root: Sentry init + auth + PWA + ErrorBoundary
│   │   │   ├── app/
│   │   │   │   ├── App.tsx              # OfflineBanner + AppRoutes + Capacitor backButton
│   │   │   │   └── router.tsx           # 50+ routes, /overview, /404
│   │   │   ├── pages/
│   │   │   │   ├── overview/            # Landing (3 role cards + demo CTA + i18n)
│   │   │   │   ├── auth/                # LoginPage, VerifyPage (magic-link)
│   │   │   │   ├── parent/              # 12 страниц
│   │   │   │   ├── child/               # 17 страниц (incl. NeedCard utility)
│   │   │   │   ├── tutor/               # 5 страниц
│   │   │   │   ├── specialist/          # 8 страниц
│   │   │   │   └── errors/NotFoundPage  # 404 экран
│   │   │   ├── components/
│   │   │   │   ├── layout/              # AppShell, BottomNav, ChildTopBar, DemoIndicator
│   │   │   │   ├── ui/                  # QoldauCard, Skeleton, EmptyState, ErrorBoundary, HealthCheckBanner, LanguageSwitcher, ThemeToggle, DemoControlsCard, OfflineBanner, PageLoader
│   │   │   │   └── icons/               # 2D + 3D icon registry
│   │   │   ├── store/                   # 11 Zustand stores
│   │   │   ├── api/                     # API client + auth client
│   │   │   ├── hooks/                   # useRealtimeEvents, useElapsedTimer
│   │   │   ├── i18n/                    # ru/kk/en (~250 ключей)
│   │   │   ├── lib/stt/                 # useSpeechRecognition (Web Speech API)
│   │   │   ├── lib/ai/                  # aiParser types/mock/future
│   │   │   ├── utils/                   # dateFormat, theme, cache, sentry
│   │   │   └── styles/                  # tokens.ts + animations.css + globals.css
│   │   ├── test/                        # 3 test файла (vitest+RTL)
│   │   ├── vite.config.ts               # react + PWA + manualChunks
│   │   ├── index.html                   # PWA meta, theme-color, viewport-fit=cover, OG
│   │   ├── .env.example                 # VITE_API_BASE_URL, VITE_SENTRY_DSN
│   │   └── package.json                 # version 0.7.4
│   └── api/                            # Backend API
│       ├── prisma/
│       │   ├── schema.prisma            # Child/Event/Recording/User/MagicToken
│       │   ├── migrations/              # init + add_auth
│       │   └── seed.ts                  # 3 demo ребёнка (synthetic) + 13 events
│       ├── src/
│       │   ├── index.ts                 # Express + Sentry + Prisma + cache + seed + socket.io
│       │   ├── routes/                  # health, events, recordings, children, stt, ai, auth
│       │   ├── services/                # llmService, sttService, authService, realtimeService, sentry
│       │   ├── repositories/            # eventsRepo, recordingsRepo, childrenRepo
│       │   ├── db/                      # prisma.ts, cache.ts, seed.ts
│       │   └── middleware/              # logger, rateLimit
│       ├── test/                        # 3 vitest тест-файла (16/16 passed)
│       ├── vitest.config.ts
│       ├── .env.example                 # DATABASE_URL, REDIS_URL, ANTHROPIC_API_KEY, WHISPER_API_KEY, SENTRY_DSN, JWT_SECRET
│       └── package.json                 # version 0.7.4
├── docs/                                # 30+ markdown файлов
│   ├── CURRENT_ARCHITECTURE.md          # этот файл
│   ├── DEMO_FLOW_QA.md                  # QA отчёт v0.7.4
│   ├── PHASE_2_BACKLOG.md               # production roadmap
│   ├── API.md                           # 21 endpoint
│   ├── SECURITY.md                      # threat model
│   └── DEPLOYMENT.md                    # 3 варианта
└── packages/                            # (пусто, planned для shared types)
```

---

## 3. Frontend

### Routing
- `HashRouter` (для совместимости с Capacitor / GH Pages)
- `/` → `/overview` (landing с 3 ролями + "Запустить демо")
- `/overview` — landing с role cards + Demo CTA + i18n + ThemeToggle
- `/auth/login`, `/auth/verify` — magic-link flow
- `/404`, `*` → `NotFoundPage` (не redirect, красивый 404 экран)
- **Parent** (12): home, voice, ai-review, clarify, events, events/:id, care, behavior, assistant, analytics, profile, notifications
- **Child** (16): home, cards, favorites, speak, phrase-builder, calm, now-next, choice, interface-guide, call, progress, water, food, toilet, category/:id
- **Tutor** (6): home, voice, ai-review, report, child-profile, events/:id
- **Specialist** (8): dashboard, events, events/:id, abc, communication-profile, care-patterns, support-plan, reports

### State management (11 Zustand stores)
- `useAuthStore` — JWT в localStorage + login/logout/verify
- `useEventStore` (v2) — events + isLoading + error + apiMode + optimistic writes
- `useRecordingsStore` — voice recordings + apiMode
- `useRoleStore` (v3) — currentRole + миграция tutor/overview → specialist
- `useDemoStore` — 18 DEMO_STEPS
- `useDemoControlsStore` — reset demo data
- `useVoiceObservationStore` — recording state machine (idle → recording → transcript_ready → ... → ready_for_review)
- `useChildSettingsStore` — font/contrast/calm/paused персонализация
- `useAppStore` — theme (light/dark/system) + language (ru/kk/en) via localStorage
- `useToastStore` — глобальные уведомления
- `useAssetStore` — lazy asset loading

### Real STT (v0.6.0+)
- `useSpeechRecognition` hook → `window.SpeechRecognition` (browser-native, ru-RU)
- Auto-fallback на побуквенный mock если браузер не поддерживает (Firefox)
- Интегрирован в `VoiceObservation` (parent) + `ChildSpeak` (child)

### Code splitting (v0.6.3)
- `manualChunks`: react-vendor (179kB), icons-vendor, app-vendor, vendor
- Главный chunk: 524kB → **313kB** (gzip 81kB)
- React.lazy для 4 крупных страниц: VoiceObservation, AIReview, ChildCards, PhraseBuilderPage
- PageLoader spinner fallback

### Mobile & PWA (v0.6.3)
- `manifest.webmanifest` (standalone, theme-color #009688, lang=ru)
- `index.html`: viewport-fit=cover, theme-color, apple-touch-icon, OG, CSP meta
- vite-plugin-pwa (autoUpdate SW, 50 entries precache, ~36MB)
- Workbox runtime caching: NetworkFirst для API, NetworkOnly для AI/STT, CacheFirst для images
- Service Worker НЕ в Capacitor (native не нужен)
- Safe-area: `max(env(safe-area-inset-*), 12px)` в AppShell/ChildTopBar/BottomNav

### i18n (v0.6.6)
- i18next + react-i18next + LanguageDetector
- 3 языка: ru (default), kk (казахский), en (English)
- 250 ключей × 3 языка в `src/i18n/locales/{ru,kk,en}.json`
- Persistence в localStorage `qoldau-lang-v1`
- LanguageSwitcher (globe icon + dropdown) в top bar
- i18n locale в dateFormat (Intl.DateTimeFormat)

### Dark mode (v0.6.8)
- ThemeToggle (light/dark/system) с cycle
- Persistence в localStorage `qoldau-theme-v1`
- `html.dark` класс + полный набор CSS variables
- Body background адаптируется (radial gradient темнее)
- Child UI всегда светлый (сенсорная безопасность, force-off в AppShell useEffect)

### Realtime WebSocket (v0.7.2)
- `socket.io-client` подписка в `useRealtimeEvents` hook
- Auto-reconnect с backoff, JWT auth
- `joinChild(childId)` rooms для фильтрации
- Подписки: `event:new/updated/deleted`
- TTL MemoryCache для дедупликации broadcast'ов

### Sentry (v0.7.3)
- `@sentry/react` (opt-in через `VITE_SENTRY_DSN`)
- browserTracingIntegration, replayIntegration (опц.)
- ErrorBoundary → sentry.captureException
- setUser (для auth context)
- sendDefaultPii: false (privacy)

### PWA UX (v0.6.3+)
- `OfflineBanner` (fixed-top на `navigator.onLine === false`)
- `HealthCheckBanner` (poll `/api/health` 30с, показывает API/DB/AI/STT)
- `DemoControlsCard` (reset demo data на landing)
- `PageLoader`, `Skeleton`, `EmptyState` (loading/empty UX)
- LogOut кнопка в AppShell header (parent/tutor) с exit confirm dialog

### Top bar safety (v0.6.10)
- `safeTopStyle`: `max(env(safe-area-inset-top), 12px)` минимум
- Убран `sticky top-0` (relative to scroll parent игнорировал padding обёртки)
- На desktop с env=0 всегда 12px отступ сверху

---

## 4. Backend

### Stack
- Node 20+ (ESM), TypeScript 5.6 strict
- Express 4 + helmet + cors + morgan
- Prisma 5 + SQLite (dev) / Postgres (prod)
- ioredis 5 (опционально)
- @anthropic-ai/sdk 0.32
- openai (через fetch для Whisper, без SDK)
- @sentry/node 8+
- socket.io 4
- express-rate-limit 7
- vitest + supertest

### Endpoints (21)
```
GET  /                          # service info + AI/STT status
GET  /api/health                # db + ai + stt + cache (из package.json version)
GET  /api/stats, POST /api/reset
GET  /api/children, /api/children/:id
GET  /api/events, GET /api/events/:id
POST /api/events, PATCH, DELETE
GET  /api/recordings, POST, DELETE
POST /api/stt/transcribe + /api/stt/health
POST /api/ai/parse + /api/ai/health
POST /api/auth/request-magic-link, /api/auth/verify, GET /api/auth/me
WS   /socket.io                 # realtime broadcast
```

### Real LLM (v0.6.0+)
- `llmService.parseTranscript()` через `@anthropic-ai/sdk`
- Model: `claude-3-5-haiku-20241022` (cheapest, structured output)
- `tool_use` с `parse_observation` tool (JSON schema)
- System prompt: "Похоже…", "Возможно…", "Это гипотеза, не диагноз", whitelist event types
- Mock fallback на keyword-matcher

### Real STT backend (v0.6.3+)
- `sttService.transcribe()` через OpenAI Whisper API
- Multipart upload (audio.webm)
- Model: `whisper-1` (default)
- Mock fallback (фиксированный transcript) при отсутствии ключа

### Auth (v0.6.0)
- Magic-link flow без SMTP в dev: `POST /api/auth/request-magic-link` → token + devMagicUrl
- `POST /api/auth/verify` → JWT (HS256, 8ч TTL)
- `GET /api/auth/me` (Bearer auth)
- JWT_SECRET обязателен в production (минимум 32 chars)
- WebSocket auth: опционально через `socket.handshake.auth.token`

### Cache (v0.5.0)
- `Cache` interface (get/set/del/clear)
- `MemoryCache` (LRU, 1000 keys, 30s TTL)
- `RedisCache` (auto-switch если `REDIS_URL`)
- Repository pattern: eventsRepo, recordingsRepo, childrenRepo

### Rate limiting (v0.6.3)
- `/api/auth/*` — 10/15min
- `/api/ai/*` — 30/min
- `/api/stt/*` — 20/min

### Realtime WebSocket (v0.7.2)
- `realtimeService.init(httpServer)` — socket.io + JWT auth
- `broadcastEvent/Update/Delete` → emit в комнату `child:{id}` + общий broadcast
- Клиент: `joinChild(childId)` / `leaveChild(childId)`

### Sentry (v0.7.3)
- `@sentry/node` (opt-in через `SENTRY_DSN`)
- `setupExpressErrorHandler` (Sentry v8+ API)
- sampleRate: 0.1 prod / 1.0 dev
- sendDefaultPii: false

### Tests (v0.6.3)
- vitest + supertest
- 16/16 smoke tests за 2.81s:
  - `test/health.test.ts` (5): health endpoint, db, ai, stt, cache
  - `test/ai.test.ts` (6): parse flow, mock fallback, empty transcript, clarification questions
  - `test/auth.test.ts` (7): magic-link, JWT verify, double-use rejection, /me
- test DB: `file:./prisma/test.db` (в .gitignore)

### Privacy (v0.7.4)
- Demo ребёнка = "Демо-профиль 1/2/3" (synthetic, no real names)
- Privacy migration в seed: "Алихан/Мира/Тимур" → "Демо-профиль 1/2/3"
- Avatars "А/М/Т" → "1/2/3"

---

## 5. Data flow

### Parent voice observation
1. `/parent/voice` → `useSpeechRecognition.start()` (Web Speech API)
2. Live transcript preview (interim results)
3. `speech.stop()` → `transcribeManual(text)` в store
4. User edits → `processWithAI()` → `POST /api/ai/parse`
5. Backend: `llmService.parseTranscript()` → Claude (или mock)
6. Returns events + insight + clarification questions
7. `/parent/ai-review` → confirm
8. `/parent/clarify` (optional) → answer questions → save
9. `addEvents()` → EventTimeline

### Child AAC flow
1. `/child/cards` → tap card
2. `useEventStore.addEvent()` (optimistic local update)
3. Background API sync (if apiMode)

### Auth flow
1. Landing → "Войти" → `/auth/login`
2. Submit email → `POST /api/auth/request-magic-link`
3. Backend creates User + MagicToken (TTL 15min)
4. Returns `{ token, devMagicUrl }` (no SMTP in dev)
5. `/auth/verify?token=...`
6. `POST /api/auth/verify` → JWT
7. Save в `qoldau-auth-v1` (localStorage) + `useAuthStore` state
8. → landing

### Realtime (WebSocket)
1. Component mount → `useRealtimeEvents(childId)`
2. Socket connects to backend `/socket.io`
3. Client emits `joinChild(childId)`
4. Backend broadcasts `event:new/updated/deleted` to room `child:{id}`
5. Client fetches full event → `useEventStore.setEvents/updateEvent`

---

## 6. Privacy & Safety (v0.7.4)

### Privacy
- Demo данные полностью synthetic (Демо-профиль 1/2/3)
- Никаких реальных детских имён в коде/seed
- Avatars "1/2/3" (без буквенных fallback'ов)
- Mock transcripts generic ("Ребёнок поел кашу…")
- Email magic-link dev-mode (без SMTP)

### Safety wording
- "Похоже, …" — везде в AI insights
- "Возможно, …" — в mockEvents, mockAIInsight
- "Это наблюдение, не диагноз" — в disclaimer, EventTypeBadge, mockAIInsight
- "Можно обсудить со специалистом" — в disclaimer
- "Нужно подтвердить" — в summary

**Запрещено:**
- ❌ "лечит аутизм", "диагностирует", "исправляет ребёнка", "нормализует поведение"
- ❌ "ИИ точно понял причину", "поведенческое нарушение"
- ❌ "неадекватное поведение", "ребёнок манипулирует"

### Child UI safety
- NO ambient/loop animations (only one-shot ≤300ms)
- Tap zones ≥64px
- BottomNav max 3 items (vs 5 для parent)
- "Ты в безопасности · Я рядом" (CalmMode)
- Personalization: font scale, calm visual, contrast, global pause ("Тишина")

---

## 7. Frontend ↔ Backend

### Data flow
```
React Component
  → useEventStore (Zustand)
    → localStorage (qoldau-events-v1) [persist]
    → api.events.* (если apiMode=true) [sync]
      → Express routes
        → Prisma → SQLite/Postgres
```

### Stores: hybrid behavior
- `apiMode: false` (default) — только localStorage
- `apiMode: true` — localStorage + оптимистичный API sync
- `isLoading`, `error` поля — для Skeleton/OfflineBanner UX

### Что синхронизируется
- `events` (главная сущность)
- `recordings` (voice от child)

### Что только в localStorage
- `currentRole`, JWT, settings, theme, language, selectedChildId

---

## 8. Deployment (Stage 1)

`docs/DEPLOYMENT.md` — 3 варианта:
- **Vercel** (frontend) + **Railway/Render** (backend)
- **VPS + Docker** (docker-compose.yml в репо)
- **GitHub Pages** (frontend only, mock mode)

### Environment variables (production)
- `DATABASE_URL=postgresql://...`
- `REDIS_URL=redis://...`
- `ANTHROPIC_API_KEY=sk-ant-...`
- `WHISPER_API_KEY=sk-...`
- `JWT_SECRET=<random 32+ chars>`
- `SENTRY_DSN=...`
- `CORS_ORIGIN=https://qoldau.example.com`
- `NODE_ENV=production`

---

## 9. Stage 1 vs Phase 2

**Stage 1 (v0.7.4 — current):**
- Demo MVP, 3 demo ребёнка, magic-link dev, mock fallback для всего
- Полная i18n (3 языка), PWA, dark mode, lazy routes, realtime broadcast (готов но не подключён к UI)
- 20+16 tests passed, CI green, CSP, Sentry opt-in

**Phase 2 (см. `docs/PHASE_2_BACKLOG.md`):**
- Multi-tenant auth (userId scoping) — **P1**
- Magic-link email SMTP — **P1**
- Real Claude + Whisper API keys — **P1**
- Audit log + GDPR endpoints — **P2**
- Production cloud storage (Postgres + S3) — **P0**
- Payment (Stripe) — **P0**
- Push notifications — **P3**
- Capacitor APK + iOS native — **P2/P4**
- Wearable / GPS — **P4** (out of scope для launch)
- Production deployment + monitoring — **P0**

---

## 10. Changelog

- **v0.3.x** — child UI (NeedCard, PhraseBuilder, phrase flow, BottomNav redesign)
- **v0.4.0** — Backend API (Express+TS, 15 endpoints, frontend API client)
- **v0.5.0** — Prisma + SQLite + cache layer
- **v0.5.1** — Child exit + DemoIndicator alignment
- **v0.6.0** — Web Speech API + Anthropic Claude + magic-link auth
- **v0.6.1** — Объединить Тьютор+Специалист, убрать Обзор, safe-area
- **v0.6.2** — Вернуть landing /overview с 3 ролями + демо
- **v0.6.3** — safe-area, PWA, ErrorBoundary, 404, HealthCheck, rate-limit, Whisper
- **v0.6.4** — Skeleton + EmptyState + EventStore loading state
- **v0.6.5** — Frontend tests + GitHub Actions CI + CSP
- **v0.6.6** — i18n (ru/kk/en) + LanguageSwitcher
- **v0.6.7** — PWA + lazy routes + OfflineBanner
- **v0.6.8** — DemoControls + ThemeToggle + dark mode
- **v0.6.9** — useSpeechRecognition в ChildSpeak
- **v0.6.10** — top bar отступ (safe-area 12px min)
- **v0.6.11** — кнопка выхода в AppShell header
- **v0.7.1** — i18n expansion (250 ключей × 3 языка)
- **v0.7.2** — WebSocket realtime (socket.io + useRealtimeEvents)
- **v0.7.3** — Sentry integration (opt-in)
- **v0.7.4** — Privacy hardening (synthetic demo profiles) + health version

v0.7.4 — **Stage 1 demo-ready**. Переход в Phase 2.
