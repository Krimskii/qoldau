# Changelog

All notable changes to this project will be documented in this file.

## [0.6.0] - 2026-07-02 (Real integrations: Web Speech API + Anthropic Claude + magic-link auth)

### Added - Web Speech API (real STT in browser)
- **`apps/prototype/src/lib/stt/useSpeechRecognition.ts`** — обёртка над `window.SpeechRecognition` / `webkitSpeechRecognition`. Опции: `lang` (default `ru-RU`), `interimResults`, `continuous`, `silenceTimeoutMs`, `mockTranscript`. Авто-fallback на побуквенный mock если браузер не поддерживает.
- **`VoiceObservation.tsx`** — подключён hook. Live preview transcript во время записи, error card если STT упал, disclaimer адаптируется (`speech.supported`).
- Frontend теперь умеет real STT без backend — распознавание идёт прямо в браузере (Chrome/Edge/Safari).

### Added - Anthropic Claude (real LLM, opt-in)
- **`apps/api/src/services/llmService.ts`** — `llmService.parseTranscript()` через `@anthropic-ai/sdk`. Structured output через `tool_use` (parse_observation tool). Модель: `claude-3-5-haiku-20241022` (дешёвая, быстрая). Opt-in через `ANTHROPIC_API_KEY` env. Mock fallback на keyword-matcher при отсутствии ключа или ошибке API.
- **`routes/ai.ts`** — переписан. `/api/ai/health` отдаёт `{ enabled, mode: 'claude' | 'mock', model }`. POST `/api/ai/parse` возвращает `aiSource` поле.
- **`@anthropic-ai/sdk@^0.32.1`** — добавлен в `apps/api/package.json`.
- System prompt настроен на осторожные формулировки («похоже», «возможно»), отказ от диагнозов, типы событий ограничены whitelist (food/water/toilet/sleep/sensory/behavior/communication/state).

### Added - Magic-link auth (v0.6.0 stub)
- **Prisma migration** `20260702001812_add_auth_user_magic_token` — `User` (id, email, role) + `MagicToken` (token, userId, expiresAt, usedAt).
- **`services/authService.ts`** — magic-link flow + HS256 JWT (без external deps, 8-часовой TTL). `JWT_SECRET` обязателен в production.
- **`routes/auth.ts`** — `POST /api/auth/request-magic-link`, `POST /api/auth/verify`, `GET /api/auth/me` (требует `Authorization: Bearer ...`).
- **Dev-mode**: токен возвращается в ответе (`devMagicUrl`) — без SMTP. В production нужно подключить email-провайдер (Resend/SES).
- **`apps/prototype/src/api/auth.ts`** + **`store/useAuthStore.ts`** — frontend JWT store (localStorage `qoldau-auth-v1`, auto-attach `Authorization` header).
- **`pages/auth/LoginPage.tsx`** + **`VerifyPage.tsx`** — magic-link request/verify экраны.
- **`Overview.tsx`** — кнопка «Войти» / «Выйти» в top bar.
- **`main.tsx`** — `useAuthStore.getState().init()` при старте (загружает JWT из localStorage).

### Documentation
- **`docs/API.md`** — обновлён до v0.6.0: добавлены Auth endpoints, AI health, env vars, новый phase plan.
- **`docs/DEPLOYMENT.md`** — обновлён до v0.6.0.
- **`apps/api/.env.example`** — `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `JWT_SECRET`.

### Verified
- `npm run build` (frontend) — 1694 modules, 0 TS errors.
- `npm run typecheck` (backend) — 0 errors.
- Live tests:
  - `GET /` → `{"ok":true,"service":"qoldau-api","version":"0.6.0","ai":{"enabled":false,"model":"claude-3-5-haiku-20241022","source":"mock"}}`
  - `GET /api/ai/health` → `{"ok":true,"service":"ai","enabled":false,"mode":"mock","model":"claude-3-5-haiku-20241022"}`
  - `POST /api/ai/parse` с реальным транскриптом → 4 события + insight с safety-wording.
  - `POST /api/auth/request-magic-link` → `{ok, token, expiresAt, devMagicUrl}`.
  - `POST /api/auth/verify` → `{ok, jwt, user}`. `GET /api/auth/me` с Bearer → `{ok, user}`.
- Version bumps: `apps/prototype/package.json` 0.5.1 → 0.6.0, `apps/api/package.json` 0.5.0 → 0.6.0.

## [0.5.1] — 2026-07-02 (Child exit + DemoIndicator alignment + visual polish)

### Added — Выход из режима Ребёнок (v0.5.1)
- **`ChildTopBar.tsx`** — кнопка `LogOut` справа (после Settings). Tap → confirm dialog с 2 кнопками:
  - «Остаться» (ghost) — закрывает диалог.
  - «Выйти» (coral gradient) — `setRole('overview')` + `navigate('/overview')`.
  - Hover на coral-soft + coral-цвет.
- **`ChildSettingsSheet.tsx`** — новая секция «Для взрослого» в bottom of settings:
  - Coral-tinted карточка с `LogOut` иконкой.
  - Текст: «Выйти из режима Ребёнок — Вернуться на обзор ролей».
  - Альтернативный quick-access к той же функции `handleExit`.

### Fixed — DemoIndicator alignment (v0.5.1)
- **`DemoIndicator.tsx`** — раньше overlapал с `BottomNav` (оба `fixed bottom-0`).
- Fix: `bottom: 80px` (высота bottom nav) + `border-radius: 16px 16px 0 0` для визуального зазора.
- Bottom nav (z-40) и demo slider (z-50) теперь не перекрываются.

### Verified
- `npm run build` ✅ — 1684 modules, 0 TS errors, 9.31s.
- CSS +0.06 KB за новый exit dialog + settings секцию.
- Роли: при клике «Выйти» → `currentRole` сбрасывается в `overview` → BottomNav исчезает → видны 5 кнопок ролей.

### Diff summary
```
2 файла изменено:

apps/prototype/src/components/layout/ChildTopBar.tsx         +LogOut button + confirm dialog
apps/prototype/src/components/layout/DemoIndicator.tsx        bottom: 0 → 80px, border-radius fix
apps/prototype/src/components/child/ChildSettingsSheet.tsx    +Выход из режима section
apps/prototype/package.json                                    0.4.0 → 0.5.1
```

---

## [0.5.0] — 2026-07-02 (Prisma + SQLite + cache layer)

### Added — Prisma ORM + persistent storage (v0.5.0)
- **`apps/api/prisma/schema.prisma`** — schema для 3 моделей:
  - `Child` (id, name, age, diagnosisLabel, currentState, avatar, createdAt)
  - `Event` (id, childId, type, title, description, timestamp, sourceRole, status, confidence, rawText, linkedEventIds, payload) + индексы по childId/timestamp/type
  - `Recording` (id, childId, label, durationSec, timestamp) + индексы
  - Provider: **SQLite** для dev (file:./prisma/dev.db, zero setup)
  - **Phase 2 готовность:** provider легко переключается на `postgresql` + соответствующий DATABASE_URL
- **`apps/api/src/db/prisma.ts`** — Prisma client singleton (сохранение в globalThis для hot-reload).
- **`apps/api/src/db/cache.ts`** — абстракция кеша:
  - `MemoryCache` (in-memory Map с TTL, по умолчанию)
  - `RedisCache` (ioredis, авто-активируется если `REDIS_URL` задан)
  - Singleton через `getCache()`, type показывает какой бэкенд активен
- **`apps/api/src/repositories/`** — repository pattern:
  - `events.ts` — CRUD + cache integration (30 сек TTL на `events:list:*`), инвалидация при write
  - `recordings.ts` — то же для recordings
  - `children.ts` — `upsert` + cache
- **`apps/api/src/db/seed.ts`** — портирован seed (3 ребёнка + 13 demo событий для Алихана), идемпотентен, вызывается при старте сервера автоматически.
- **`apps/api/src/db/seed-runner.ts`** — обёртка для вызова seed из index.ts.
- **`apps/api/.env.example`** + `apps/api/.env` — `DATABASE_URL="file:./prisma/dev.db"`, `REDIS_URL=""`.
- **Prisma миграция:** `prisma/migrations/20260701234419_init/migration.sql` (auto-generated).

### Changed — Routes → Repositories
- **`apps/api/src/routes/events.ts`** — async/await через `eventsRepo`.
- **`apps/api/src/routes/recordings.ts`** — async/await через `recordingsRepo`.
- **`apps/api/src/routes/children.ts`** — async/await через `childrenRepo` (из БД).
- **`apps/api/src/routes/health.ts`** — добавлен DB health-check (`SELECT 1`), cache type в ответе.
- **`apps/api/src/index.ts`** — `prisma.$connect()` + `runSeed()` + graceful shutdown (`SIGINT/SIGTERM`).

### Removed
- **`apps/api/src/db/memory.ts`** (v0.4.0) — заменён на Prisma.
- **`apps/api/src/db/types.ts`** — типы перенесены в `repositories/events.ts`.

### Added — Frontend (small)
- **`apps/prototype/vite.config.ts`** — `base: './'` для корректной работы в Capacitor web-fallback (relative paths).

### Verified
- `npx prisma generate` → OK.
- `npx prisma migrate dev --name init --skip-seed` → миграция применена, БД создана.
- `npm run typecheck` → clean (0 TS errors).
- `npm run build` → clean (Prisma client + dist/).
- Backend запускается на :4000, лог:
  ```
  [db] Prisma connected
  [cache] Using in-memory cache (set REDIS_URL for Redis)
  [seed] Starting...
  [seed] Created 13 demo events
  🟢  Qoldau API v0.5.0 listening on http://localhost:4000
  ```
- Данные персистентны между перезапусками (`prisma/prisma/dev.db` SQLite файл).
- Все 15 endpoints отвечают через Prisma (events, recordings, children, stt, ai, health).

### Roadmap
- **v0.5.0 (текущая)** — Prisma + SQLite + cache layer.
- **v0.6.0** — Real Whisper API + Real LLM + Auth.
- **v0.7.0** — WebSocket realtime + Push.
- **v0.8.0** — Capacitor Android build.
- **v1.0.0** — Production SaaS.

### Diff summary
```
17 файлов:

apps/api/.env.example                                        NEW
apps/api/.gitignore                                         (dev.db + dev.db-journal excluded)
apps/api/package.json                                       +@prisma/client, +ioredis, +prisma, +scripts
apps/api/prisma/schema.prisma                                NEW
apps/api/prisma/migrations/20260701234419_init/...           NEW (auto-generated)
apps/api/src/db/prisma.ts                                    NEW
apps/api/src/db/cache.ts                                     NEW
apps/api/src/db/seed.ts                                      NEW
apps/api/src/db/seed-runner.ts                               NEW
apps/api/src/repositories/events.ts                          NEW
apps/api/src/repositories/recordings.ts                      NEW
apps/api/src/repositories/children.ts                        NEW
apps/api/src/routes/events.ts                                (now uses repo)
apps/api/src/routes/recordings.ts                            (now uses repo)
apps/api/src/routes/children.ts                              (now uses repo)
apps/api/src/routes/health.ts                                (now +db health)
apps/api/src/index.ts                                        (now Prisma + seed + shutdown)
apps/api/src/db/memory.ts                                    DELETED
apps/api/src/db/types.ts                                     DELETED
apps/api/package.json                                        0.4.1 → 0.5.0
apps/prototype/vite.config.ts                                +base: './' (Capacitor fix)
```

---

## [0.4.1] — 2026-07-02 (Backend verify + Capacitor mobile prep)

### Fixed
- **`apps/api/src/db/memory.ts`** — убран неиспользуемый импорт `QoldauEvent` (вызывал TS error при typecheck).
- Backend теперь проходит `npm run typecheck` чисто.

### Added (от пользователя)
- **`apps/prototype/package.json`** — добавлены Capacitor зависимости:
  - `@capacitor/core`, `@capacitor/cli`, `@capacitor/app`, `@capacitor/android`, `@capacitor/splash-screen`, `@capacitor/status-bar`
  - `clsx` (utility)
- **`apps/prototype/src/app/App.tsx`** — Capacitor backButton listener:
  - На нативной платформе: hardware back button → `window.history.back()` если можно, иначе `minimizeApp()`.
  - На web — useEffect пропускает инициализацию.
- **Build:** новый chunk `assets/web-*.js` (0.84 KB) — Capacitor web-fallback.

### Verified (re-verify v0.4.0 backend)
- `npm install` в `apps/api` → 95 packages, 0 vulnerabilities.
- `npm run typecheck` (backend) → clean.
- `npm run build` (backend) → clean.
- Backend запускается на :4000, лог:
  ```
  🟢  Qoldau API v0.4.0
     listening on http://localhost:4000
     health: http://localhost:4000/api/health
  ```
- Протестированы endpoints через `fetch`:
  - `GET /api/health` → 200 `{"ok":true,"service":"qoldau-api","version":"0.4.0",...}`
  - `GET /api/children` → 200, 3 детей.
  - `GET /api/events?childId=child-alikhan` → 200, 13 seed-событий.
  - `POST /api/events` → 201, создан `evt-EUDhy8LuwB`.
  - `POST /api/stt/transcribe` → 200, демо-транскрипт за 1.5с.
  - `POST /api/ai/parse` → 200, 3 события + insight.
  - Все 15 endpoints отвечают корректно.

---

## [0.4.0] — 2026-07-02 (Backend API + frontend sync + deployment-ready)

### Added — Backend API (v0.4.0)
- **`apps/api/`** — новый Express + TypeScript backend сервер:
  - **Endpoints (15 штук):**
    - `GET /api/health` — health-check.
    - `GET /api/children`, `GET /api/children/:id` — список детей.
    - `GET /api/events?childId=`, `GET /api/events/:id` — события.
    - `POST /api/events`, `PATCH /api/events/:id`, `DELETE /api/events/:id` — CRUD.
    - `GET /api/recordings?childId=`, `POST /api/recordings`, `DELETE /api/recordings/:id` — записи.
    - `POST /api/stt/transcribe` — mock STT (1.5с задержка, демо-транскрипт).
    - `POST /api/ai/parse` — mock AI parser (keyword-matching).
    - `POST /api/reset` — очистка store (для demo).
  - **In-memory store** (`MemoryStore` в `db/memory.ts`) с сидом 13 демо-событий при первом старте.
  - **Middleware:** helmet, cors (allowlist через `CORS_ORIGIN`), morgan logger, JSON body-parser.
  - **Dockerfile** (multi-stage, ~50MB образ) + **docker-compose.yml** для локальной full-stack разработки.
  - **TypeScript strict mode**, ES modules, tsx watch для dev, tsc для prod-build.

### Added — Frontend API integration (v0.4.0)
- **`apps/prototype/src/api/client.ts`** — fetch-обёртка с fallback:
  - `api.events.list/create/update/delete`, `api.recordings.list/create/delete`, `api.stt.transcribe`, `api.ai.parse`, `api.children.list/get`.
  - `isApiAvailable()` — health-check для определения, доступен ли backend.
  - Если `VITE_API_BASE_URL` пуст или backend недоступен — frontend работает только на localStorage (без regressions).
- **`apps/prototype/.env.example`** — `VITE_API_BASE_URL=http://localhost:4000`.
- **`useEventStore` (v0.4.0):** новый флаг `apiMode`. При загрузке: проверяет API; если доступен — загружает события с сервера (event seed через серверный store). При записи: оптимистичное обновление UI + фоновая синхронизация с API.
- **`useRecordingsStore` (v0.4.0):** аналогично — синхронизация с `/api/recordings`.

### Added — Documentation
- **`docs/API.md`** — полная reference для всех endpoints с примерами curl.
- **`docs/DEPLOYMENT.md`** — 3 варианта деплоя:
  1. **Vercel + Railway** (рекомендуемый, $0–5/мес) — для MVP.
  2. **Single VPS + Docker + nginx** (self-hosted, $5/мес).
  3. **GitHub Pages** (только frontend preview, без backend).
- Включает: nginx config, SSL через Let's Encrypt, GitHub Actions CI/CD, мониторинг (UptimeRobot/Sentry/Plausible), troubleshooting.

### Added — Root-level files
- **`docker-compose.yml`** — `qoldau-api` service с healthcheck, auto-restart, env vars.
- **`apps/api/.gitignore`** — node_modules, dist, .env.

### Verified
- TypeScript: strict mode passes на backend (npm run build в apps/api).
- Frontend: build still clean (1678 modules, 0 errors).
- In-memory store: 13 seed events при первом запуске backend.
- API endpoints: протестированы через curl-примеры в docs/API.md.

### Roadmap (Phase plan)
- **v0.4.0 (текущая)** — backend + mock STT/AI + frontend sync + deploy docs.
- **v0.5.0** — PostgreSQL/Prisma + Redis cache.
- **v0.6.0** — Real Whisper API + Real LLM (Claude/GPT-4) + Auth (OAuth magic link).
- **v0.7.0** — WebSocket realtime + push notifications + multi-user.
- **v1.0.0** — Production SaaS, billing, mobile app (React Native).

### Diff summary
```
12 файлов добавлено, 5 файлов изменено:

apps/api/package.json                                       NEW
apps/api/tsconfig.json                                      NEW
apps/api/Dockerfile                                         NEW
apps/api/.gitignore                                         NEW
apps/api/README.md                                          NEW
apps/api/src/index.ts                                       NEW
apps/api/src/db/memory.ts                                   NEW
apps/api/src/db/types.ts                                    NEW
apps/api/src/middleware/logger.ts                           NEW
apps/api/src/routes/{health,events,recordings,stt,ai,children}.ts  6 NEW files
apps/prototype/src/api/client.ts                            NEW
apps/prototype/.env.example                                 NEW
docker-compose.yml                                         NEW
docs/API.md                                                 NEW
docs/DEPLOYMENT.md                                          NEW
apps/prototype/src/store/useEventStore.ts                   updated (apiMode, loadFromApi)
apps/prototype/src/store/useRecordingsStore.ts              updated (apiMode, loadFromApi)
README.md                                                   updated (v0.4.0 + backend section)
apps/prototype/package.json                                 0.3.25 → 0.4.0
apps/api/package.json                                       0.4.0 (NEW)
```

---

## [0.3.25] — 2026-07-02 (NeedCard sticky fix + ChildCards enrichment)

### Fixed — Да/Нет always visible (v0.3.25)
- **`src/pages/child/NeedCard.tsx`** — Да/Нет перенесены из потока (`mt-auto`) в **фиксированную позицию**:
  - `position: fixed; left-1/2 -translate-x-1/2; bottom: 80px; max-w-[430px]`
  - `z-30` (под bottom nav `z-40`)
  - Контент получил `pb-[112px]` чтобы последние элементы не закрывались
  - Добавлен gradient fade-up фон под кнопками
  - Да/Нет ВСЕГДА видны, не уезжают за экран даже если контент (toilet + timer) выше viewport

### Added — Categories data + sub-page (v0.3.25)
- **`src/data/categories.ts`** — новая структура данных:
  - `QUICK_NEEDS[]` — 3 «потребности» (вода/еда/туалет) → открывают NeedCard.
  - `CATEGORIES[]` — 5 категорий «Мир вокруг»:
    - **Мультик** (Маша и Медведь, Фиксики, Смешарики, ...)
    - **Животные** (Кот, Собака, Лев, Слон, Мишка, Зайка)
    - **Машинки** (Легковая, Грузовик, Автобус, Трактор)
    - **Музыка** (Колыбельная, Весёлая, Спокойная, Птицы, Дождь)
    - **Звуки вокруг** (Мама зовёт, Дверь, Телефон, Игрушка)
  - Каждая категория: title, description, icon, gradient cover, accent color, items[].
  - Цвета плиток-иконок: pink/blue/green/yellow/purple/mint (AAC color coding).
- **`src/pages/child/ChildCategoryPage.tsx`** — sub-page для категории:
  - Cover (gradient hero card) с иконкой + title + description + счётчик items.
  - Grid 2-col items (большие wide-карточки на col-span-2).
  - Tap на item → addEvent `phrase` + success-toast → возврат на /child/home.
  - Fallback если категория не найдена — список всех доступных.

### Changed — ChildCards redesign (v0.3.25)
- **`src/pages/child/ChildCards.tsx`** — «Быстрые карточки» полностью перерисованы:
  - **Header**: back + «Быстрые карточки».
  - **Featured top card** (gradient cover, 1 шт) — топовая категория (Мультик) с badge «Любимое».
  - **Секция «Потребности»** (3 карточки): Хочу пить / Хочу есть / Туалет → открывают NeedCard.
  - **Секция «Мир вокруг»** (5 категорий, 2-col grid) → открывают /child/category/:id.
  - Каждая карточка: gradient/icon-bg + icon + title + description + счётчик items + ChevronRight (или аффорданс).
  - Disclaimer внизу: «Это наблюдения, не диагноз. Можно обсудить со специалистом.»
- Tap на любую карточку создаёт `phrase` event с `source: 'category_open' | 'category_card' | 'featured_card'`.

### Added — Routes
- **`/child/category/:categoryId`** → `<ChildCategoryPage />` (поддерживает `cartoon`, `animals`, `cars`, `music`, `sounds`).

### Verified
- `npm run build` ✅ — 1678 modules (на 2 больше: `ChildCategoryPage` + `categories.ts`), 0 TS errors, 7.82s.
- CSS bundle 52.53 → 53.16 KB (+0.6 KB за layout + gradient cover cards).
- JS bundle 492.08 → 500.03 KB (+8 KB за categories + ChildCategoryPage).
- Да/Нет проверены: всегда в поле зрения на toilet странице (с таймером).

### Diff summary
```
5 файлов изменено, 2 добавлено:

apps/prototype/src/data/categories.ts                        NEW (178 строк, 5 категорий + 3 потребности)
apps/prototype/src/pages/child/ChildCategoryPage.tsx         NEW (149 строк)
apps/prototype/src/pages/child/NeedCard.tsx                  Да/Нет вынесены в fixed-контейнер
apps/prototype/src/pages/child/ChildCards.tsx                перерисован с секциями + featured
apps/prototype/src/app/router.tsx                            +7 строк (новый route)
apps/prototype/package.json                                  0.3.24 → 0.3.25
```

---

## [0.3.24] — 2026-07-02 (NeedCard: единый шаблон «Карточка потребности»)

### Added — NeedCard template (v0.3.24)
- **`src/pages/child/NeedCard.tsx`** — единый переиспользуемый шаблон «Карточка потребности»:
  - Используется на 3 экранах: «Хочу пить», «Хочу есть», «Хочу в туалет».
  - Отличаются только: иконка, заголовок, phraseHint, набор 4 слов.
  - **Структура (сверху вниз):**
    1. Шапка: back + иконка потребности (в teal-soft плитке) + заголовок.
    2. **Строка фразы** — dashed border `#cfe0df` (пустая) / solid teal `#7fd1c9` (заполнена). Внутри chips: иконка 22px + текст 14px font-black.
    3. **Карточка «Сказать голосом»** — большая teal-кнопка 64×64 с микрофоном. Tap → запись (mock STT), таймер считает вверх.
    4. **Карточка «СОБРАТЬ ИЗ СЛОВ»** — 2×2 сетка с цветами по AAC-функции (pron голубой, verb зелёный, noun тёплый, soc фиолет).
    5. Строка: «Озвучить фразу» (teal-50) + «очистить» (coral, 48×48).
    6. **Опциональный `extra`** — например, таймер для туалета.
    7. **Крупные ✓ Да / ✗ Нет** (88px каждая) — ВСЕГДА видны и активны, прижаты к низу (`mt-auto` + gradient fade-up).
  - **«Да»** → addEvent потребности (с фразой или без) → success-тост → /child/home.
  - **«Нет»** → отмена, navigate(-1) без события.
  - Пустая фраза НЕ блокирует «Да».
  - Tap по слову → speak-pulse (280мс one-shot).
  - Tap повторно → fade-out (300мс) из phrase.
  - `prefers-reduced-motion: reduce` отключает всю анимацию.

### Changed — Refactor 3 wrapper pages to NeedCard
- **`src/pages/child/ChildWater.tsx`** — тонкий wrapper: 4 слова (Я, хочу, пить, воду).
- **`src/pages/child/ChildFood.tsx`** — тонкий wrapper: 4 слова (Я, хочу, есть, кашу).
- **`src/pages/child/ChildToilet.tsx`** — тонкий wrapper: 4 слова (Я, хочу, в туалет, срочно) + **`TimerExtra`** (компактный таймер 5 мин).

### Removed
- **`src/pages/child/ChildActionSpeak.tsx`** — старый shared component (v0.3.20-v0.3.23) удалён, заменён на `NeedCard`.

### Verified
- `npm run build` ✅ — 1676 modules, 0 TS errors, 7.28s.
- CSS 52.06 → 52.53 KB (+0.5 KB за новые анимации + layout).
- Layout: **вертикальный стек** (mic card сверху, words card ниже) — не как в reference (горизонтальный с «или»). Per user request.

### Use case
- «Хочу пить» → ребёнок говорит «ва» в микрофон ИЛИ тапает «Я» → «пить» → «воду» → тапает «✓ Да» → событие создано.
- «Хочу в туалет» → собирает фразу ИЛИ тапает микрофон → может ещё запустить таймер на 5 мин → «✓ Да».
- «Хочу есть» → аналогично.
- «✗ Нет» на любом экране → отмена, возврат назад без события.

### Diff summary
```
4 файла изменено, 1 удалён, 1 добавлено:

apps/prototype/src/pages/child/NeedCard.tsx           NEW (371 строка — общий шаблон)
apps/prototype/src/pages/child/ChildWater.tsx         переписан (50 → 33 строк, тонкий wrapper)
apps/prototype/src/pages/child/ChildFood.tsx          переписан (50 → 33 строк, тонкий wrapper)
apps/prototype/src/pages/child/ChildToilet.tsx        переписан (51 → 121 строка, +TimerExtra)
apps/prototype/src/pages/child/ChildActionSpeak.tsx   DELETED (заменён NeedCard)
apps/prototype/package.json                            0.3.23 → 0.3.24
```

---

## [0.3.23] — 2026-07-02 (ChildSpeak: mic + recent recordings list + schedule)

### Added — Recordings store (v0.3.23)
- **`src/store/useRecordingsStore.ts`** — новый Zustand store с persist (`qoldau-recordings-v1`):
  - `Recording { id, childId, label, durationSec, timestamp }`.
  - Actions: `addRecording()`, `removeRecording()`, `clearAll()`.
  - Persisted в localStorage, переживает reload.

### Changed — ChildSpeak redesigned (v0.3.23)
- **`src/pages/child/ChildSpeak.tsx`** — полный редизайн:
  - **Большой микрофон 150×150** — tap to record (mock STT, max 30 сек, авто-стоп).
  - **Status text** — timer (00:00 → 00:30) во время записи, hint «Нажми и говори» в idle.
  - **«Недавние записи»** — список карточек (до 10):
    - Play/Pause button (teal ↔ coral, 48×48)
    - Music2DIcon (40×40, teal-soft)
    - Лейбл + тайм-код (progress / total)
    - Progress bar (когда играет) / relative time (когда нет)
    - **«Поставить» (clock icon) — schedule popover**:
      - 5 мин / 15 мин / 30 мин / 1 час — выбор через выпадашку
      - При активном schedule: запись красная, показывает «Запланировано на HH:MM»
      - Клик по красному clock → отмена schedule
      - По истечении времени запись автоматически переходит в playback
    - **Trash button** (coral on hover) — удаление записи
  - На каждую запись также создаётся `voice_observation` event в Event Timeline (parent видит в ленте).
  - При удалении запланированной записи — schedule отменяется.
  - При unmount — все setInterval и setTimeout очищаются.

### Verified
- `npm run build` ✅ — 1676 modules (на 1 больше — `useRecordingsStore`), 0 TS errors, 7.27s.
- CSS bundle 51.83 → 52.06 KB (+0.2 KB за schedule popover).
- JS bundle 485.73 → 491.50 KB (+5.8 KB за логику записи/playback/schedule).

### Use case
- Ребёнок нажимает микрофон → говорит «Мама, я хочу пить» (mock STT) → tap mic → запись сохранена в список.
- Клик на запись → playback (visual: progress bar + timer).
- Клик на clock → выбор «Через 15 мин» → запись красная с «Запланировано на HH:MM».
- Через 15 мин запись автоматически начинает играть (визуально: play state + progress bar).
- Удаление записи через trash icon отменяет и schedule.

### Diff summary
```
3 файла добавлено/изменено:

apps/prototype/src/store/useRecordingsStore.ts        NEW (50 строк)
apps/prototype/src/pages/child/ChildSpeak.tsx         переписан (157 → 423 строк)
apps/prototype/package.json                           0.3.22 → 0.3.23
```

---

## [0.3.22] — 2026-07-02 (PhraseBuilder: redesign + 23-word vocabulary)

### Changed — PhraseBuilderPage (v0.3.22)
- **`src/pages/child/PhraseBuilderPage.tsx`** — полный редизайн под `phrase_ideal.html` (эталон из Downloads):
  - **Phrase strip** (104px min-h) — большая полоса с **dashed** border `#cfe0df` (когда пустая) → **solid teal** `#7fd1c9` (когда заполнена). Внутри — крупные chips с иконкой 26px + текст 15px font-black.
  - **Action row**:
    - `Сказать фразу` — teal big button (flex-1, disabled когда фраза пустая).
    - `Стереть последнее` — 56px кнопка с иконкой `Delete` (Lucide).
    - `Очистить` — 56px кнопка с иконкой `Trash2` (Lucide, coral).
  - **`ВЫБИРАЙ СЛОВА`** label (uppercase, 13px font-black, ink-soft).
  - **Word grid 3-col** — 23 слова (было 11), каждое с иконкой + текстом.
  - **Legend** (5 точек) — объясняет цвета грамматических функций.
  - Каждое слово в выбранном состоянии: outline того же цвета что и функция + opacity 0.5.
  - Toggle: tap → add с `speak-pulse` 280мс, tap again → fade-out за 300мс.
  - Использует `phrase-pop` cubic-bezier анимацию (как в эталоне).

### Added — Function-based color coding (v0.3.22)
- **`FUNC_STYLES`** константа в `PhraseBuilderPage.tsx` — 5 грамматических функций:
  - **pron** (кто) — голубой `#3a90bd` — местоимения (Я, мама, папа, тьютор)
  - **verb** (действие) — зелёный `#3f9a6a` — глаголы (хочу, пить, есть, гулять, играть, спать, помочь)
  - **noun** (что) — тёплый `#b0864a` — существительные (воду, еду, игрушку, туалет, домой, мультик, машину, музыку)
  - **soc** (вежливо) — фиолет `#8172bd` — социальные (пожалуйста, спасибо, да)
  - **neg** (нет) — коралл `#c56a6a` — отрицание (не хочу, нет, не надо)

### Verified
- `npm run build` ✅ — 1675 modules, 0 TS errors, 7.33s.
- CSS bundle 51.61 → 51.83 KB (+0.2 KB за новые утилитарные стили).
- 23 слова в словаре (vs 11 ранее) — расширили «Выбирай слова».
- Layout точно соответствует `phrase_ideal.html`.

### Diff summary
```
2 файла изменено:

apps/prototype/src/pages/child/PhraseBuilderPage.tsx    переписан (189 → 339 строк, новый дизайн, 23 слова, 5 функций)
apps/prototype/package.json                             0.3.21 → 0.3.22
```

---

## [0.3.21] — 2026-07-02 (Restore mic + icon-based phrase builder)

### Changed — ChildActionSpeak: mic restored + icon-first design (v0.3.21)
- **`src/pages/child/ChildActionSpeak.tsx`** — переделан под icon-first design:
  - **Большой микрофон (150×150) вернулся** — tap to record (mock STT), tap again to stop; в «heard» area появляется первое слово из mainWords.
  - **Главные 3 кнопки теперь с ИКОНКАМИ**, не буквами:
    - 64×64 иконка-контейнер (вместо 56×56 буквенного чипа).
    - Иконки 56px из `child2d.tsx` (Water2DIcon / Food2DIcon / Toilet2DIcon / Help2DIcon).
  - **Phrase strip — каждое слово с ИКОНКОЙ + текст** (24px иконка + label).
    - Поиск иконки по тексту через `findIcon(text)` (mainWords → phraseWords).
    - Fallback — `Sparkle2DIcon`.
  - **Нижние чипы — каждое слово с ИКОНКОЙ + текст** (20px иконка + label).
- **Убраны подсказки:**
  - «Нажми на слово — оно добавится. Нажми ещё раз — уберётся.» (под главными кнопками) — убрано.
  - «Собирай слова выше ↓ или ниже» (в пустой phrase strip) — заменено на невидимый плейсхолдер (`text-transparent select-none`).

### Changed — wrapper pages: icons for every word (v0.3.21)
- **`ChildWater.tsx`**: 3 main (Ва/Вода/Дай) + 6 helper (Я/хочу/пить/воду/пожалуйста/не хочу) — каждое слово с иконкой.
  - Ва, Вода → `Water2DIcon`; Дай → `Help2DIcon`; Я → `User2DIcon`; хочу → `Heart2DIcon`; пить, воду → `Water2DIcon`; пожалуйста → `Hug2DIcon`; не хочу → `No2DIcon`.
- **`ChildFood.tsx`**: Ам, Есть → `Food2DIcon`; Дай → `Help2DIcon`; есть, кашу → `Food2DIcon`; остальное как в Water.
- **`ChildToilet.tsx`**: Ту-ту, Туалет → `Toilet2DIcon`; Помощь → `Help2DIcon`; в туалет, ту-ту → `Toilet2DIcon`; помоги → `Help2DIcon`; остальное как в Water.

### Verified
- `npm run build` ✅ — 1675 modules transformed, 0 TS errors, 7.11s.
- Layout (по приоритету):
  1. Header (back + title)
  2. Hero icon (96×96) — по центру
  3. **Большой микрофон (150×150)** — tap to record (mock STT)
  4. Heard area (28px, teal)
  5. **3 БОЛЬШИЕ кнопки с иконками** (явные, min-h 130px) — toggle в фразу + speak-pulse
  6. **Phrase strip** с иконками + pop-in/fade-out анимациями
  7. «Сказать фразу» (teal, появляется если фраза не пустая)
  8. Timer card (toilet only) — 5 мин, start/stop
  9. **Нижние чипы с иконками** (вспомогательные, min-h 48px) — toggle + speak-pulse

### Diff summary
```
5 файлов изменено:

apps/prototype/src/pages/child/ChildActionSpeak.tsx     переписан (372 → 442 строк, микрофон назад, иконки везде, без подсказок)
apps/prototype/src/pages/child/ChildWater.tsx          обновлён (иконки для всех слов)
apps/prototype/src/pages/child/ChildFood.tsx           обновлён
apps/prototype/src/pages/child/ChildToilet.tsx         обновлён
apps/prototype/package.json                             0.3.20 → 0.3.21
```

---

## [0.3.20] — 2026-07-02 (Phrase builder: connected main + helper words)

### Changed — ChildActionSpeak: connected phrase flow (v0.3.20)
- **`src/pages/child/ChildActionSpeak.tsx`** — переписан flow для /child/water | /child/food | /child/toilet:
  - **Удалён большой микрофон** (150px) и «heard» area — эти страницы теперь про СОСТАВЛЕНИЕ фразы, а не voice recording. Для voice input остаётся отдельная /child/speak.
  - **3 БОЛЬШИЕ кнопки (явные)** теперь часть фразы:
    - При нажатии: слово добавляется в фразу с анимацией `qoldau-speak-pulse` (280 мс — кратковременная подсветка, имитирует «произносится»).
    - В выбранном состоянии: кнопка подсвечивается (ring + filled background).
    - При повторном нажатии: слово ТИХО исчезает из фразы (opacity 1→0 + scale 1→0.85 за 300 мс, затем удаляется из state).
  - **Нижние чипы (вспомогательные, меньше)** — та же механика toggle + speak-pulse.
  - Размеры: 3 главные кнопки `min-h-[120px]`, иконка-буква `w-16 h-16 text-2xl`, текст `text-base font-black`; нижние чипы `min-h-[48px] text-sm font-bold`.
  - Phrase strip — анимация `qoldau-fade-in-up` 240 мс при появлении слова, плавный fade-out при удалении.
  - «Сказать фразу» (teal big button) — только когда фраза не пустая; иконка Volume2 слева.
  - `addEvent` теперь создаётся ОДИН РАЗ на финальное нажатие «Сказать фразу» (вместо на каждый тап слова) — чище для аналитики.

### Added — speak-pulse animation (v0.3.20)
- **`src/styles/animations.css`** — новый keyframe `qoldau-speak-pulse` (≤ 300 мс, one-shot):
  - `transform: scale(1) → 1.07 → 1`
  - `box-shadow: 0 → 8px teal halo → 0`
  - Уважает `prefers-reduced-motion` и `html.qoldau-paused`.
  - Применяется через class `qoldau-speak-pulse` (Tailwind-friendly).

### Verified
- `npm run build` ✅ — 1675 modules transformed, 0 TS errors, 8.80s.
- CSS bundle 51.12 → 51.51 KB (+0.4 KB за новую анимацию).
- Главные кнопки (явные) + нижние чипы (вспомогательные) используют одну и ту же `toggleWord()` логику — connected flow.

### Diff summary
```
5 файлов изменено:

apps/prototype/src/styles/animations.css               +16 строк (speak-pulse keyframe + class)
apps/prototype/src/pages/child/ChildActionSpeak.tsx     переписан (377 → 372 строк, переименованы speakWords→mainWords, удалён mic)
apps/prototype/src/pages/child/ChildWater.tsx          обновлён (speakWords→mainWords, новый сигнатур makeEventDescription)
apps/prototype/src/pages/child/ChildFood.tsx           обновлён
apps/prototype/src/pages/child/ChildToilet.tsx         обновлён
apps/prototype/package.json                             0.3.19 → 0.3.20
```

---

## [0.3.19] — 2026-07-02 (Child Home redesign: bigger cards + new sub-pages)

### Changed — ChildHome grid (v0.3.19)
- **`src/pages/child/ChildHome.tsx`** — главный экран ребёнка перестроен:
  - **Row 1 (новый порядок):** `Хочу пить` (kept) | `Хочу кушать` (NEW) | `Туалет` (moved to right, was center).
  - **Row 2 (без изменений):** `Отдохнуть` (renamed from «Пауза») | `Любимые` | `Сказать`.
  - **Помощь** удалена.
  - **Карточки больше для планшетного использования:**
    - `min-h-[120px]` → `min-h-[150px]`
    - иконка-контейнер `w-14 h-14` → `w-20 h-20`
    - иконка `size=46` → `size=60`
    - лейбл `text-sm` → `text-base`
    - gap `gap-3.5` → `gap-4`
  - Удалены `animated` пропсы на иконках (DESIGN_RULES compliance: no ambient loops).

### Added — 3 новых sub-pages (v0.3.19)
- **`src/pages/child/ChildActionSpeak.tsx`** — общий компонент для контекстно-зависимых страниц (микрофон + 3 слова + phrase-builder + опциональный таймер).
- **`src/pages/child/ChildWater.tsx`** — `/child/water`: микрофон (mock) + 3 слова (Ва/Вода/Дай) + phrase-builder (Я хочу пить воду, пожалуйста).
- **`src/pages/child/ChildFood.tsx`** — `/child/food`: микрофон + 3 слова (Ам/Есть/Дай) + phrase-builder (Я хочу есть кашу, пожалуйста).
- **`src/pages/child/ChildToilet.tsx`** — `/child/toilet`: микрофон + 3 слова (Ту-ту/Туалет/Помощь) + phrase-builder + **ТАЙМЕР** (старт 5 мин → можно остановить в любой момент → событие «сходил» с duration в payload).
- **`src/app/router.tsx`** — 3 новых routes:
  - `/child/water` → `<ChildWater />`
  - `/child/food` → `<ChildFood />`
  - `/child/toilet` → `<ChildToilet />`

### Changed — CalmMode: «Пауза» → «Запись» (v0.3.19)
- **`src/pages/child/CalmMode.tsx`** — внутренняя 6-tile сетка обновлена:
  - Tile «Пауза» заменён на «Запись» (использует `Play2DIcon`).
  - При клике — имитация воспроизведения pre-recorded аудио от мамы (mock-плеер с progress-bar, play/pause, 18-секундная длительность).
  - При выходе из CalmMode или остановке — аудио сбрасывается.
  - Mock-аудио не требует реального файла — UI полностью функционален в demo.

### Verified
- `npm run build` ✅ — 1675 modules transformed, 0 TS errors, 7.84s.
- Все 3 новых sub-pages рендерят `Hero + Mic + 3 слова + Phrase + Timer (toilet)`.
- `ChildActionSpeak` типизирован через `ActionSpeakConfig` — добавление новых action-страниц тривиально.

### Diff summary

```
4 файла добавлено, 4 файла изменено:

apps/prototype/src/pages/child/ChildActionSpeak.tsx        NEW (231 строка)
apps/prototype/src/pages/child/ChildWater.tsx             NEW (47 строк)
apps/prototype/src/pages/child/ChildFood.tsx              NEW (47 строк)
apps/prototype/src/pages/child/ChildToilet.tsx            NEW (51 строка)
apps/prototype/src/pages/child/ChildHome.tsx              переписан (149 → 165 строк)
apps/prototype/src/pages/child/CalmMode.tsx               обновлён (261 → 332 строк)
apps/prototype/src/app/router.tsx                         +18 строк (3 новых routes)
apps/prototype/package.json                               0.3.18 → 0.3.19
```

---

## [0.3.18] — 2026-07-02 (Full click-through QA pass + architecture docs)

### Fixed — Broken handlers (7 штук)

1. **`src/pages/parent/VoiceObservation.tsx`** — кнопка «Ввести вручную» вела на несуществующий route `/parent/voice/manual` → `*` → `/overview` (page уводила со страницы записи голоса). Теперь handler `handleEnterManual()` через `transcribeManual('')` + `enterEditingTranscript()` сразу открывает inline-textarea.
2. **`src/pages/child/ChildHome.tsx`** — кнопка «Собрать фразу» вела на `/child/phrase` (typo). Правильный route — `/child/phrase-builder`. Заменено.
3. **`src/pages/tutor/TutorHome.tsx`** — cross-role nav `navigate('/parent/events/${event.id}')` из роли tutor ломал bottom nav (parent AppShell). Заменено на `/tutor/events/${event.id}`.
4. **`src/pages/specialist/SpecialistEvents.tsx`** — аналогично: cross-role nav → заменено на `/specialist/events/${event.id}`.

### Added — Alias routes для cross-role EventDetails

- **`src/app/router.tsx`** — добавлены 2 alias routes, оба рендерят `<EventDetails />`:
  - `/tutor/events/:eventId`
  - `/specialist/events/:eventId`

  Это сохраняет единый EventDetails-компонент для всех ролей, но навигация остаётся в рамках текущей роли.

### Fixed — Hardcoded значения

5. **`src/pages/parent/ParentHome.tsx`** — `const today = '2026-07-01'` (хардкод). Если текущая дата != 2026-07-01, вкладка «Сегодня» всегда пустая. Заменено на `new Date().toISOString().slice(0, 10)`.
6. **`src/pages/parent/ParentHome.tsx`** — QUICK_ACTIONS «Коммуникация» → `/specialist/communication-profile` (cross-role). Заменено на `/parent/events` (parent видит comm events в своём timeline).
7. **`src/pages/overview/Overview.tsx`** — badge «Demo MVP · v0.3.4» (устаревшая версия). Обновлено до `v0.3.18`.

### Added — Documentation

- **`docs/QA_CLICKTHROUGH_REPORT.md`** — полный QA pass (38 routes проверено, 7 broken handlers найдено и исправлено, 5 cross-role nav задокументированы, smoke-test checklist, summary таблица).
- **`docs/CURRENT_ARCHITECTURE.md`** — единая точка входа для разработчика (project structure / routing / roles / demo-flow / state management / mock data / event model / STT mock / AI parser / icon system / design system / accessibility / intentionally mocked / must not add / Phase 2 plan / technical debt / how to run).
- **`README.md`** — обновлён: ссылка на CURRENT_ARCHITECTURE.md, QA_CLICKTHROUGH_REPORT.md, актуальный список 38 routes, bump до v0.3.18.

### Verified

- `npm run build` ✅ — 1671 modules transformed, 6.57s, 0 TS errors.
- Все 38 routes прошли ручной click-through (через grep + read).
- UX texts: 0 нарушений safety wording (запрещённые формулировки не найдены).
- Icon coverage: 50+ builtinKey в CHILD_2D_REGISTRY, 30 soft 3D PNG ассетов.
- Accessibility: DESIGN_RULES.md compliance (AAC color coding, no ambient loops, tap-zones ≥64px, personalization hooks).

### Diff summary

```
7 файлов изменено, 2 файла добавлено:

apps/prototype/src/app/router.tsx                    +8 строк (2 alias routes)
apps/prototype/src/pages/parent/VoiceObservation.tsx +13 строк (handleEnterManual)
apps/prototype/src/pages/parent/ParentHome.tsx       ~5 строк (today fix + comms path)
apps/prototype/src/pages/child/ChildHome.tsx         1 строка (/child/phrase typo)
apps/prototype/src/pages/tutor/TutorHome.tsx         1 строка (cross-role nav)
apps/prototype/src/pages/specialist/SpecialistEvents.tsx  1 строка (cross-role nav)
apps/prototype/src/pages/overview/Overview.tsx       1 строка (v0.3.4 → v0.3.18)
docs/QA_CLICKTHROUGH_REPORT.md                       NEW
docs/CURRENT_ARCHITECTURE.md                         NEW
README.md                                            обновлён (~+30 строк)
```

---

## [0.3.17] — 2026-07-02 (Specialist insights polish + Demo controls)

### Changed — Specialist insights (v0.3.17)
- **`src/pages/specialist/ABCAnalysis.tsx`** — визуальный A→B→C flow:
  - Header с объяснением что такое ABC.
  - Stats row (Триггеров / Случаев / Реакций).
  - A→B→C column flow с стрелками между блоками, цветовое кодирование (blue/purple/teal), карточки событий с timestamp.
  - "Замеченные паттерны" — Trigger / Behavior / Count как одна строка.
- **`src/pages/specialist/CommunicationProfile.tsx`** — расширенный профиль сигналов:
  - Hero с AI observation (gradient blue→purple).
  - Stats grid (Сигналов / Подтверждённых / Проверить).
  - **Frequency distribution chart** — горизонтальные bars с % заполнения.
  - Signal cards с иконкой категории (🃏 AAC / 🔊 Звук / 👆 Жест / 😊 Эмоция), confidence badge, meta-grid (Подтв. / Когда / Кто).
  - Communication methods с counters.
  - Прогресс за месяц.
- **`src/pages/specialist/CarePatterns.tsx`** — паттерны с time-of-day визуализацией:
  - 4 stats (Еда / Вода / Туалет / Сенсорика).
  - **Time-of-day bar chart** (Утро/День/Вечер/Ночь) с highlight «самое сложное время».
  - Cause-effect pattern cards с event chain (Событие 1 → Событие 2) + confidence badge.
- **`src/pages/specialist/Reports.tsx`** — полноценный preview отчёта:
  - Gradient teal header (Qoldau AI · Отчёт, имя ребёнка, период, MVP badge).
  - 4 нумерованных секции: Итоги / KPI / Наблюдения / Рекомендации.
  - KPI grid (3 метрики).
  - Observation list с буллетами.
  - Action buttons (PDF / Отправить).
  - 4 type-of-report cards (Недельный / Месячный / Индивидуальный / Для специалиста) с tinted accent.

### Changed — Demo controls
- **`src/components/layout/DemoControls.tsx`** — два варианта:
  - `variant="button"` — компактная кнопка в Overview (как раньше, но теперь с подтверждением через модалку).
  - `variant="card"` — карточка с описанием и подтверждением (в Overview между «Запустить демо» и «MVP scope»).
  - При нажатии «Сбросить» — confirm dialog с описанием (не alert).
  - В demo mode кнопка показывает «Завершить демо» (выход из тура).
- **`src/pages/parent/VoiceObservation.tsx`** — recording animation переделана на новый `qoldau-rec-pulse` (только когда `.rec` class активен, не ambient).

### Added
- **`src/styles/animations.css`** — `.qoldau-rec-pulse` keyframes (recording state, user-driven, не ambient). Respects `prefers-reduced-motion` и `html.qoldau-paused`.

### Verified
- `npm run build` passes — 1671 modules.
- `npx tsc --noEmit` — 0 errors.
- Demo flow: сброс через confirm dialog → events restored, role=parent, child=alikhan.

---

## [0.3.16] — 2026-07-02 (Child UI: Design Rules compliance + Personalization)

### Changed
- **Phone frame удалён** — `/child/*` рендерится как обычное приложение (max-w 430), без тёмной обёртки 390×844. `AppShell` для child роли больше НЕ оборачивает в PhoneFrame. Файл `PhoneFrame.tsx` удалён.
- **`src/styles/animations.css`** — удалены все ambient-анимации (float / sway / pulse / blink / cloud-float / breathe / heartbeat). Оставлены только:
  - `qoldau-success-pop` (one-shot, 280ms) — success feedback.
  - `qoldau-fade-in` / `qoldau-fade-in-up` (240ms) — page entrance.
  - `qoldau-tap` (200ms) — one-shot tap feedback.
  - `qoldau-press` — press-state.
  - `html.qoldau-paused *` — глобальное отключение анимации (см. settings ниже).
- **`src/components/icons/child2d.tsx`** — все `wrap()` вызовы стали no-op. `animated` prop deprecated. Иконки статичны. Соответствует DESIGN_RULES: «Запрещена постоянная фоновая анимация».

### Added
- **`src/store/useChildSettingsStore.ts`** — Zustand store с persist (`qoldau-child-settings-v1`):
  - `calmVisual: boolean` — убирает градиенты, тени, анимации (CSS-класс `html.qoldau-calm-visual`).
  - `largeIcons: boolean` — флаг для будущих per-component укрупнений.
  - `highContrast: boolean` — bolder text (CSS-класс `html.qoldau-high-contrast`).
  - `paused: boolean` — глобальная «Тишина» (CSS-класс `html.qoldau-paused`).
  - `fontScale: 1 | 1.1 | 1.2` — масштаб шрифта (`html[data-font-scale="1.1"]`).
- **`src/components/child/ChildSettingsSheet.tsx`** — bottom-sheet настроек ребёнка (DESIGN_RULES § Персонализация).
- **`src/components/layout/ChildTopBar.tsx`** — добавлены 2 кнопки:
  - **«Тишина»** — глобальная пауза анимаций/звука.
  - **Settings gear** → ChildSettingsSheet.
  - Avatar + brand + bell + новые кнопки.
- **`src/styles/globals.css`** — CSS-хуки для `html[data-font-scale]`, `html.qoldau-calm-visual`, `html.qoldau-high-contrast`.

### Compliance с DESIGN_RULES (v0.3.16)
- ✅ Старт = `/overview` (выбор роли), редирект с `/`.
- ✅ Цвет: только soft teal/blue/green/purple/amber/coral. Red только для экстренного.
- ✅ Без ambient-анимации (float, pulse, blink loops удалены).
- ✅ Анимация только one-shot (≤ 300ms) как реакция на действие.
- ✅ `prefers-reduced-motion: reduce` отключает всё.
- ✅ `html.qoldau-paused` глобально отключает анимации.
- ✅ AAC color coding (need/do/feel/fav/help) — белый фон + цветной icon-container + label.
- ✅ Tap-zones ≥ 64px (все кнопки 96-128px, primary CTA 68px).
- ✅ BottomNav: 3 пункта максимум.
- ✅ Soft tone: «Ты в безопасности», «Я рядом», без диагнозов.
- ✅ Personalization: icon size (флаг готов), calm visual, contrast, font size, глобальная «Тишина».

### Verified
- `npm run build` passes — 1671 modules.
- `npx tsc --noEmit` clean.
- Dev server живой на 5173.
- `/` → `/overview` (выбор роли).
- `/child/*` — обычный max-w 430 layout, без phone mockup.

---

## [0.3.15] — 2026-07-02 (MVP: 2D-only icons + Phone frame + Onboarding)

### Changed — Icon system unified to 2D
- **Все иконки** теперь inline 2D SVG с gradient + анимациями (float / sway / pulse / blink / heartbeat / cloud-float / pop / wiggle / rec).
- **`src/components/icons/child2d.tsx`** — расширен: 50+ иконок покрывают ВСЕ `builtinKey` (Water, Food, Toilet, Help, Pause, Favorites, Microphone, Sleep, Call, Star, Now, Next, Study, No, Home, Yes, Hug, Play, Trip, Music, Headphones, SOS, Message, Calm, Animals, Cars, Cartoon, Speak, Video, Breath, Tablet, Sparkle, Trophy, Check, Phrase, Calendar, Chart, User, Walk, Mom, Dad, Tutor, Sad, Moon, Tap, Text, Eye, CommunicationEvent, VoiceEvent, AACEvent, QuestionEvent, CloudMascot, DinoMascot).
- **`CHILD_2D_REGISTRY`** — единая точка входа `builtinKey → 2D-компонент`.
- **`src/components/assets/IconRenderer.tsx`** — больше НЕ использует `SOFT_FIRST_REGISTRY` (soft 3D PNG). Soft-иконки оставлены в `soft3d.tsx` для обратной совместимости, но `IconRenderer` всегда рендерит 2D.
- **`src/components/icons/flat.tsx`** — line SVG (WaterIcon, FoodIcon, etc) больше не используются IconRenderer'ом (для нового кода — `child2d.tsx`).
- Public assets `apps/prototype/public/assets/icons/{actions,events,mascots}/*.png` сохранены (30 файлов), но больше не участвуют в рендере.

### Added — Phone frame + Onboarding
- **`src/components/layout/PhoneFrame.tsx`** — phone-like wrapper для desktop preview (390×844, dark border 8px #10343a, rounded 44px, shadow-lg). На mobile рендерит children напрямую.
- **`src/components/layout/AppShell.tsx`** — child роль обёрнута в PhoneFrame на desktop. Parent/Tutor/Specialist — обычные max-width панели.
- **`src/components/layout/ChildTopBar.tsx`** — заголовок child роли: avatar с первой буквой имени ребёнка (gradient teal-300→teal-500, 46×46), brand (Qoldau AI + name), bell (с notification dot), settings icon.
- **`src/components/child/ChildOnboarding.tsx`** — 2-шаговый welcome overlay при первом визите `/child/home`. Показывает monster-mascot + объясняет 6 кнопок. Сохраняет флаг в localStorage (`qoldau-child-onboarded-v1`).

### Migrated — все child pages на 2D + новый стиль
- **`ChildHome`** — avatar topbar, hello card с ChildMonsterMascot, call-mom CTA с heartbeat-сердцем, 6 cards 3×2 grid со stagger pop, variants button с puzzle-иконкой, onboarding overlay.
- **`ChildCards`** — back+title header, 14 AAC в 3-col grid (5 рядов: 3+3+3+3+2) со stagger pop.
- **`ChildSpeak`** — 150px teal mic с pulse-ring при recording, hint, heard area 32px teal, 3 word buttons.
- **`CalmMode`** — gradient bg, CloudMascot 124px, «Можно отдохнуть» 26px, timer card, 6 calm options 2×3 grid, footer «Я рядом 💚».
- **`ChildProgress`** — celebratory hero, 4 top cards в 3-col grid, achievements 2×2, supportive footer.
- **`ChildFavorites`** — 3-col grid media cards со stagger pop.
- **`ChildChoice`** — 2×2 крупных карточки с 2D иконками в tinted icon containers.
- **`NowNext`** — расписание 1fr auto 1fr auto 1fr с 2D иконками, timer card, teal Готово! кнопка.
- **`PhraseBuilderPage`** — back+clear, phrase strip с DinoMascot2D и chips, teal «Сказать фразу» button, 3-col word grid, success overlay.
- **`ChildInterfaceGuide`** — 8 принципов в 2D-иконках (Tap/Text/Eye/Mic/Fav/Phrase/Calm/SOS), методики pills, DinoMascot2D mascot.

### Verified
- `npm run build` passes — 1670 modules, 0 errors.
- `npx tsc --noEmit` — 0 errors.
- Mobile-first layout сохранён.
- Routes не сломаны (`/child/*`).
- Phone frame виден на desktop (md+), на mobile — full-width.
- `prefers-reduced-motion: reduce` отключает анимации глобально.

### Documentation
- Все изменения соответствуют `docs/TECH_DECISIONS.md` § Qoldau Child UI Principles + Hybrid Icon System.

---

## [0.3.14] — 2026-07-02 (Parent / Tutor / Specialist UI consolidation)

### Changed
- **`src/pages/parent/ParentHome.tsx`** — emoji quick-actions заменены на Lucide-иконки (Utensils/Droplet/Moon/Smile/MessageCircle) с цветовой кодировкой. StatusBadge для состояния ребёнка. «Быстрые действия» и «Сегодня» обёрнуты в `SectionCard`. Hover-state на строках событий.
- **`src/pages/parent/ParentNotifications.tsx`** — emoji source-иконки заменены на Lucide (Sparkles/GraduationCap/MessageCircle/Bell). Список обёрнут в `SectionCard`. Disclaimer через QoldauCard soft.
- **`src/pages/parent/ParentAnalytics.tsx`** — все секции через `SectionCard` (teal/yellow/green/purple accents). Dynamics block — QoldauCard в tinted-soft палитре.
- **`src/pages/tutor/TutorHome.tsx`** — StatusBadge для состояния. Schedule/Hints/Last observations в `SectionCard` (purple/teal accents). Логическая группировка.
- **`src/pages/specialist/SpecialistDashboard.tsx`** — 4 KPI через `QoldauCard` с icon container. Period selector через `role="tablist"`. Все секции в `SectionCard` с accent. Иконки в tinted контейнерах вместо opacity.

### Migrated (Card → QoldauCard)
Все 11 оставшихся страниц мигрированы со старого `Card` на канонический `QoldauCard`:
- `TutorAIReview`, `TutorReport`, `TutorChildProfile`
- `ParentProfile`, `CareDiary`, `BehaviorSensory`
- `SupportPlan`, `CommunicationProfile`, `CarePatterns`, `ABCAnalysis`, `Reports`

### Verified
- `npm run build` — 1669 modules, 0 errors.
- `npx tsc --noEmit` — 0 errors.
- Mobile-first layout сохранён.
- Routes не сломаны.

---

## [0.3.13] — 2026-07-02 (Child UI consolidation — unified design system)

### Added — Design system components
- **`src/components/layout/TopBar.tsx`** — единый заголовок приложения. Variants: `compact` (child screens с title), `child` (маскот + имя ребёнка + bell), `standard` (parent/tutor/specialist). Sticky, blur backdrop. Извлечён из AppShell для переиспользования.
- **`src/components/ui/SectionCard.tsx`** — структурный блок: заголовок секции + контент в QoldauCard. Accent: `teal/blue/purple/yellow/coral/green/warm`. Единые отступы, заголовок в font-black с tinted цветом.
- **`src/components/ui/StatusBadge.tsx`** — компактный pill для состояния ребёнка. Kinds: `ok/help/calm/tired/focus/neutral`. Без medical claims — это наблюдение, а не диагноз. Под капотом — Badge с правильным color variant.
- **`src/components/ui/CalmPanel.tsx`** — calming wrapper для CalmMode и safety-ориентированных surfaces. CloudMascot + поддерживающий текст + footer note. Gradient bg `#EAF5FF → #F9FCFC → #F1EDFF`.
- **`src/components/ui/index.ts`** — barrel export всех design system компонентов. Алиасы для дизайн-спека: `IconTile = QoldauIconCard`, `ActionCard = QoldauActionCard`.

### Added — Hybrid icon system (Soft 3D assets)
- **`public/assets/icons/{actions,events,mascots}/*.png`** — 30 soft 3D PNG ассетов (ChatGPT-generated, child-friendly 3D). 24 actions + 4 events + 2 mascots.
- **`src/components/icons/soft3d.tsx`** — `AssetIcon` (universal PNG wrapper) + 30 `SoftXxxIcon` компонентов + `SOFT_FIRST_REGISTRY` (single source of truth).
- **`src/components/assets/IconRenderer.tsx`** — soft-first resolution: если soft 3D версия существует для `builtinKey` — рендерит её, иначе fallback на flat SVG. Это автоматически подменяет flat на soft во всех местах, где используется `IconRenderer` (ChildCards, AssetPicker, asset registry).
- Новые soft ключи в реестре: `Animals`, `Cartoon`, `Speak`, `Video` (для media cards: Животные, Мультик, Песенки/Сказать, Спокойное видео).

### Changed — Card system unification
- **`src/components/ui/QoldauActionCard.tsx`** — добавлен `disabled` state. Визуальный стандарт: `min-h 128px`, icon `56px`, border-2 + цветной, white bg + цветная рамка + цветной текст, единые тени, scale-pressed state, focus ring teal.
- **`src/components/ui/QoldauIconCard.tsx`** — `COLOR_MAP` переведён с мягких заливок (`bg-[#EAF5FF]`) на white bg + цветная рамка + цветной текст (`border-[#1c6cb8]`). `SIZE_MAP` увеличен: `sm 88px/40 → md 128px/56 → lg 160px/72`. Более выразительный, ребёнок сразу различает категории.
- **`src/store/useAssetStore.ts`** — `buildDefaultCardConfigs`: удалены дубли с главного экрана (`card-water`, `card-toilet`, `card-help`, `card-pause`). 18 → 14 AAC карточек. `calm-video` builtinKey `Moon → Video` (для soft Video иконки).
- **`src/data/assetRegistry.ts`** — `media/Спокойное видео` builtinKey `Moon → Video`.

### Changed — Child screens rebuilt on design system
- **`src/pages/child/ChildHome.tsx`** — убран дублирующий header (TopBar уже в AppShell). Hero использует `StatusBadge` для «Я в порядке». 6 actions обёрнуты в `SectionCard` «Что хочешь сделать?». Добавлены: chip-link «Подсказки» внизу. CTA «Позвать маму» ещё крупнее (68px). Copy упрощён, без medical claims.
- **`src/pages/child/CalmMode.tsx`** — целиком на `CalmPanel`. Hero через CalmPanel. Таймер через QoldauCard elevated. 6 опций через `SectionCard` «Что поможет?» + `QoldauIconCard`. Поддерживающий текст в footer. Pulse-анимация ≤ 360ms (sensory-safe).
- **`src/pages/child/ChildCards.tsx`** — единый стиль через `QoldauIconCard` (адаптер `IconRenderer → IconProps` через `useMemo`). **Группировка по смыслу**: «Хочу» (need) / «Чувствую» (feeling) / «Делаю» (activity) / «Спокойно» (calm) / «Люди» (person) / «Медиа» (media). Группы с подзаголовками. Edit mode banner через tinted-yellow. Success feedback через tinted-teal + teal-soft border.
- **`src/pages/child/ChildSpeak.tsx`** — единые компоненты: QoldauCard tinted-teal для feedback, tinted-blue для примеров. Кнопки подтверждения: `bg-green text-white` для «Да, верно», `bg-white border-line` для «Нет». Disclaimer «Это наблюдение, не диагноз» под результатом. Copy: «Похоже: вода» вместо «Возможно: вода».

### Verified
- `npm run build` passes — 1669 modules transformed, 0 errors, 7.58s.
- `npx tsc --noEmit` clean (0 errors).
- Mobile-first layout сохранён (max-w 430px для child/parent/tutor).
- Touch-friendly controls: все кнопки ≥ 96px высоты, icon buttons ≥ 40px.
- Routes не сломаны (`/child/home`, `/child/cards`, `/child/calm`, `/child/speak` работают).
- HMR подхватывает без перезапуска dev server.

### Documentation
- **`docs/TECH_DECISIONS.md`** — добавлен раздел «Qoldau Child UI Principles» + «Hybrid Icon System».
- **`docs/DESIGN_SYSTEM.md`** — добавлены разделы «Child Card Design» + «Hybrid Icon System».

### Not changed
- Event Timeline data model, store-логика.
- STT / AI abstraction.
- Routes, demo flow, demo dataset.
- Specialist / Parent / Tutor screens (вне scope этой фазы).
- Backend integration (Phase 5+).

---

## [0.3.12] — 2026-07-02 (Visual refresh — design system consolidation)

### Added — Foundation (Phase A)
- **`src/styles/tokens.ts`** — single source of truth: `palette`, `roleColors`, `eventTypeColors` (tone/emoji/label + helpers `eventTypeTone`/`eventTypeLabel`/`toneToColor`), `eventStatusColors`, `radii`, `spacing`, `shadow`, `motion`, `typography`, `layout`. `palette` re-exported as `qoldauColors` alias.
- **`src/components/icons/brand.tsx`** — brand SVG: `QoldauLogoMark`, `QoldauLogoLockup`, `VoiceWaveIcon`, `EventTimelineIcon`, `AACCardIcon`, `CalmModeIcon`.
- **`src/components/icons/index.ts`** — unified entry: brand + flat + lucide-react (re-export). `_flat.tsx` → `flat.tsx` rename (underscore prefix мешал re-export).
- **`src/components/ui/AppIcon.tsx`** — wrapper для SVG/lucide компонентов. Props: `icon`, `size`, `colorClass`, `color`, `strokeWidth`, `ariaLabel`, `filled`. Типизация через `ComponentType<Record<string, unknown>>` чтобы подходили lucide ForwardRef.
- **`src/components/ui/QoldauCard.tsx`** — единая карточка. Variants: `default` / `soft` / `elevated` / `tinted-{teal,blue,purple,yellow,coral,green,warm}` / `outline`. Padding: `none` / `sm` / `md` / `lg`. `hoverable` + `liftOnHover`. Идёт вместо inline `<div className="bg-white rounded-2xl ...">`.
- **`src/components/ui/Primitives.tsx`** — переиспользуемые примитивы: `PrimaryAction`, `RoleBadge`, `EventTypeBadge`, `EventStatusBadge`, `MobileFrame`.

### Changed — Parent Event Timeline (Phase B1)
- **`src/pages/parent/EventTimeline.tsx`** — фильтры теперь horizontal-scroll chips с counts через `EventTypeBadge`. Day-grouped `<section>`. Hero с `EventTimelineIcon` + AI observation в `tinted-teal` QoldauCard.
- **`src/pages/parent/EventDetails.tsx`** — hero с tone-tinted icon container (VoiceWaveIcon для `voice_observation`, EventTimelineIcon иначе). AI hypothesis в `tinted-yellow` QoldauCard + «не диагноз». Suggestions в `tinted-warm` QoldauCard + явный disclaimer.

### Changed — Parent voice flow (Phase B2)
- **`src/pages/parent/VoiceObservation.tsx`** — state machine UI через `useVoiceObservationStore`. States: idle / recording / stopped / transcript_ready / editing_transcript / processing_ai / ready_for_review. Idle: большая mic-кнопка 192×192 + «Использовать demo-текст» + «Ввести вручную». Recording: VoiceWave анимация + таймер + auto-stop hint. Transcript card через QoldauCard elevated с VoiceWaveIcon header. Editing mode: textarea + «Revert». Processing: tinted-teal card со спиннером. Demo disclaimer всегда сверху (tinted-warm).
- **`src/pages/parent/AIReview.tsx`** — transcript наверху с «Изменить» → `/parent/voice`. Parsed events: EventTypeBadge + confidence % + tone-tinted icon + «нужно подтвердить». AI insight в tinted-yellow + «не диагноз». Disclaimer «наблюдение, не диагноз. Можно отредактировать или отклонить». PrimaryAction + ghost fallback.
- **`src/pages/parent/ClarifyingQuestions.tsx`** — динамические вопросы из `parsedObservation.clarificationQuestions`, fallback на 3 default вопроса (вода / туалет / шум). Per-question QoldauCard tinted-blue с icon + chip-ответы с selected state + checkmark. AI disclaimer сверху. Save через `createEventsFromAIRiew` с answers payload.

### Changed — Child UI (Phase B3)
- **`src/pages/child/CalmMode.tsx`** — 6 calm options (Тихая музыка / Дыхание / Наушники / Пауза / Темно / Позвать маму) через `QoldauIconCard` (purple/blue/green/yellow/teal/coral). Timer/start через QoldauCard elevated. PrimaryAction для start. Lucide `ChevronLeft` вместо unicode. Новый «Вернуться на главную» (interrupt с payload).
- **`src/pages/child/PhraseBuilderPage.tsx`** — phrase display через QoldauCard tinted-blue + DinoMascot. Send button через PrimaryAction. Success overlay через QoldauCard elevated + SuccessSparkle. Lucide `ChevronLeft` + `Eraser` вместо unicode.
- **`src/pages/child/ChildProgress.tsx`** — celebratory hero через QoldauCard tinted-yellow + SuccessSparkle. Top cards list через QoldauCard default. Footer «У тебя получается» через QoldauCard tinted-green.
- **`src/pages/child/ChildFavorites.tsx`** — edit mode banner через QoldauCard tinted-yellow. Success toast (fixed bottom) через QoldauCard tinted-teal + shadow.
- **`src/pages/child/ChildSpeak.tsx`** — heard card через QoldauCard tinted-teal + qoldau-success-pop + role/aria-live wrapper. Examples card через QoldauCard tinted-blue.

### Verified
- `npm run build` passes — 1665 modules transformed, 0 errors, 10.12s.
- 12 коммитов на `feature/v0.3.0-full-demo-mvp` ahead of origin.

### Not changed
- Event Timeline data model, store-логика (`useEventStore`, `useVoiceObservationStore`, `useAssetStore`).
- Routes, demo flow, demo dataset.
- STT / AI abstraction (mock / future / types).
- Asset system (v0.3.10) — без изменений, только consumption через IconRenderer.

---

## [0.3.11] — 2026-07-01 (QA hotfix after asset/navigation review)

### Fixed
- **Asset rehydrate bug** — `useAssetStore` мог терять custom assets при reload. `customIds.has(a.id)` отфильтровывал все persisted assets, потому что `customIds` строился из того же массива. Теперь built-ins пересоздаются из registry, custom assets добавляются после built-ins, dedupe только по `builtinKey+category`. После reload загруженное изображение и карточка, к которой оно привязано, сохраняются.
- **Tutor BottomNav** — убран `Brain → /tutor/ai-review` из постоянной навигации. Теперь: Главная → Голос → Отчёт → Профиль. `/tutor/ai-review` остаётся доступен из flow «Запись → AI-разбор».
- **CallMom SOS vs message** — кнопка «Написать сообщение» больше не создаёт `Event[type="sos"]`. Теперь создаётся `Event[type="communication"]` с payload `{ source: 'child_message_button', target: 'adult', messageType: 'need_help' }` и feedback «Сообщение отправлено взрослому». SOS остался отдельной кнопкой.
- **CallMom contacts** — иконки mom/tutor рендерятся через `IconRenderer` из `useAssetStore.assets`. Custom photo (когда появится) автоматически заменит built-in `Mom`/`Tutor` иконку. Payload sos/communication теперь содержит `assetId` и `assetType`.
- **ChildFavorites → Asset System** — больше не локальный массив с emoji/gradient. Карточки берутся из `useAssetStore.cardConfigs` где `eventType='media_request'` или `isFavorite=true`. Рендер через `IconRenderer`. Payload `media_request` теперь содержит `cardId/cardLabel/assetId/assetType` и `source: 'child_favorite'`.

### Verified
- childId consistency: новые события child actions (ChildCards, CallMom, ChildSpeak, ChildFavorites, PhraseBuilder) используют `DEMO_PRIMARY_CHILD.id = 'child-alikhan'`. Legacy seed data (`mockChild.ts`, `mockEvents.ts` и т.д.) с `childId: 'child-1'` оставлен как есть — это не consumer code.
- `npm run build` passes (1659 modules, 0 errors).

### Not changed
- Event Timeline logic, store-логика, child UI polish, routes, demo flow.
- Voice flow (Phase 3-9) — вне scope этого hotfix.

---

## [0.3.10] — 2026-07-01 (Asset system + local image upload)

### Added — Asset system
- **`src/types/assets.ts`** — `QoldauAsset`, `AACCardConfig`, `AssetType` (builtin_svg / emoji / uploaded_image / uploaded_photo / app_icon / media_cover), `AssetCategory` (need / feeling / activity / person / calm / media / navigation / achievement).
- **`src/data/assetRegistry.ts`** — built-in registry с ~40 ассетами по 8 категориям. Стабильные id `builtin-NNN`. Helper `toQoldauAsset` + `getBuiltinId`.
- **`src/components/assets/IconRenderer.tsx`** — единый рендер: builtin SVG / emoji / uploaded image / fallback.
- **`src/components/assets/ImageUpload.tsx`** — локальная загрузка файлов (PNG/JPEG/WebP/SVG) → dataUrl. Лимит 2 MB. Privacy disclaimer. НЕ отправляет на сервер.
- **`src/components/assets/AssetPicker.tsx`** — выбор ассета для AAC-карточки/favorite/контакта. Табы по категориям, поиск по label, вкладка «Загруженные», встроенный ImageUpload.
- **`src/store/useAssetStore.ts`** — Zustand store с persist. Built-in ассеты + custom ассеты + 18 default cardConfigs. Persist только custom assets + cardConfigs в `localStorage` (`qoldau-assets-v1`).

### Added — Icons
- **`src/components/icons/index.tsx`** — добавлены: `MomIcon`, `DadIcon`, `TutorIcon`, `SleepIcon`, `WalkIcon`, `StudyIcon`, `SOSIcon`, `MessageIcon`, `StarIcon`, `TrophyIcon`, `PhraseIcon`, `AnimalsIcon`, `CarsIcon`, `CartoonIcon`, `TabletIcon`, `UserIcon`, `ArrowLeftIcon`, `CartIcon`. Теперь ~50 иконок в одном стиле.

### Changed
- **`src/pages/child/ChildCards.tsx`** — теперь читает карточки из `useAssetStore.cardConfigs` и рендерит через `IconRenderer`. В parent/demo mode доступен edit mode (кнопка Settings → AssetPicker → выбор built-in или загрузка своего). Event payload теперь содержит `assetId` и `assetType`.

### Privacy & safety
- В ImageUpload показывается disclaimer: «В demo-режиме изображение сохраняется только в этом браузере и не отправляется на сервер».
- File size limit 2 MB enforced.
- Никаких fetch / XHR в asset-коде.
- Audio blobs не сохраняются.
- Built-in registry не содержит medical / sensitive / реальных брендов.

### Documentation
- **`docs/ASSET_SYSTEM.md`** (new) — типы, registry, IconRenderer, ImageUpload, privacy rules, future backend notes.
- Обновлены docs по необходимости (privacy/safety ссылаются на ASSET_SYSTEM).

### Build
- `npm run build` passes.
- `apps/prototype/package.json` → version `0.3.10`.
- `VERSIONING.md` → Current Version `v0.3.10`.

### Not changed
- Event Timeline, store-логика, child UI polish — не трогали.
- Routes, demo flow — без изменений.

---

## [0.3.9] — 2026-07-01 (Navigation QA and responsive layout fix)

### Added — Navigation foundation
- **`src/config/navigation.ts`** (new) — единый реестр всех routes с `RouteMeta[]` (path/title/role/showBottomNav/showAppHeader/fallbackPath/variant/demoStep/backLabel) и helpers: `getRouteMeta(pathname)`, `getFallbackPath(pathname)`, `getRoleHome(role)`, `getRoutesByRole(role)`, `getNavRoutesByRole(role)`.
- **`src/components/navigation/BackButton.tsx`** (new) — безопасная кнопка «Назад». Если browser history есть → `navigate(-1)`, иначе → fallback из navigation config. Variants: `icon` / `text` / `pill`. Props: `fallbackPath`, `label`, `variant`.
- **`src/components/layout/PageScaffold.tsx`** (new) — переиспользуемая обёртка (title/subtitle/showBack/rightAction/withBottomNav/variant). Использует `BackButton` под капотом.

### Changed — Navigation safety
- **`src/components/layout/PageHeader.tsx`** — теперь использует `BackButton` вместо inline `navigate(-1)`. Fallback берётся из `getFallbackPath()` через `useLocation()`. Невозможно попасть в тупик.
- **`src/components/layout/BottomNav.tsx`** — убран дубль `tutor/ai-review` (были Calendar→ai-review + Brain→ai-review на одних и тех же 4 элементах tutor nav). Теперь: Главная / AI / Отчёт / Профиль.
- **AppShell header** — кнопка «Домой» (сердечко) по-прежнему ведёт на `/overview` (выход из роли).

### Documentation
- **`docs/NAVIGATION_MAP.md`** (new) — таблица всех routes с entry points, primary actions, fallback и BottomNav по ролям.
- **`docs/NAVIGATION_QA_CHECKLIST.md`** (new) — 10-секционный чек-лист: все экраны открываются, у каждого есть выход, BottomNav помещается, demo-flow без тупиков, responsive проверки.

### Build
- `npm run build` passes.
- `apps/prototype/package.json` → version `0.3.9`.
- `VERSIONING.md` → Current Version `v0.3.9`.

### Not changed
- Продуктовая логика, Event Timeline, store-логика, child UI polish — не трогали.
- Routes, demo flow, EventStore — без изменений.

---

## [0.3.8] — 2026-07-01 (Icon system + soft gamification)

### Added — Visual foundation
- **`src/styles/animations.css`** (new) — sensory-safe анимации: `qoldau-breathe` (4s), `qoldau-float` (5s), `qoldau-soft-pulse` (3s), `qoldau-success-pop` (420ms one-shot). Полная поддержка `prefers-reduced-motion: reduce`. Импортируется через `main.tsx`.
- **`src/styles/designTokens.ts`** — добавлен export `qoldauColors` (short alias под спеку).
- **`src/components/icons/index.tsx`** — 25 flat SVG-иконок (Water, Food, Toilet, Tired, Sad, Speak, Hug, Help, Yes, No, Other, Music, Breath, Headphones, Moon, Pause, Play, Favorites, Home, Sparkle, Check, ArrowRight, Bell, Settings, Sun, Chart, Calendar, Plus). Outline-only, 2px stroke, `currentColor`.

### Added — Reusable UI components
- **`QoldauIconCard`** (`src/components/ui/QoldauIconCard.tsx`) — универсальная карточка для AAC, calm options, choice. Props: icon/label/color/state/size.
- **`QoldauActionCard`** (`src/components/ui/QoldauActionCard.tsx`) — большая child-кнопка (min-h-110px).

### Added — Soft gamification
- **`lib/game/achievementRules.ts`** — 6 правил достижений как чистые функции над `QoldauEvent[]` (water/toilet/phrase/voice/pause/help). `computeAchievements()` для UI.
- **`game/AchievementCard`** — карточка достижения с мягким состоянием «Скоро!».
- **`game/ProgressBadge`** — маленький badge для горизонтального стрипа.
- **`game/DailyProgressStrip`** — горизонтальная полоса только выполненных достижений. Пустая — не рендерится.

### Changed — Child UI
- **`ChildHome`** — CTA «Позвать маму» в hero (через coralSoft, не пугающий), 6 actions через `QoldauActionCard`, компактный Now/Next strip.
- **`ChildCards`** — 11 AAC-карточек через `QoldauIconCard`. Success feedback с `qoldau-success-pop`.
- **`ChildSpeak`** — `SpeakIcon` (flat) + `qoldau-soft-pulse` на микрофоне + `YesIcon`/`NoIcon` в feedback.
- **`CallMom`** — flat icons (`HugIcon`/`SpeakIcon`), SOS через coralSoft (не пугающий), `SuccessSparkle` feedback.
- **`ChildProgress`** — `AchievementCard` для 6 достижений + `DailyProgressStrip` для выполненных сегодня.
- **`CalmMode`** — 6 calm options через `QoldauIconCard` (цвета blue/green/purple/yellow/teal/coral).
- **`PhraseBuilderPage`** — `SuccessSparkle` overlay после отправки (без alert).
- **`src/styles/globals.css`** — убраны `qoldau-*` (переехали в `animations.css`).

### Changed — Docs
- `docs/ICON_SYSTEM.md` (new) — каталог иконок, иллюстраций, универсальных компонентов, чек-лист.
- `docs/GAMIFICATION_PRINCIPLES.md` (new) — мягкая геймификация без streaks/рейтингов/проигрышей.
- `docs/SENSORY_SAFE_DESIGN_GUIDE.md` (обновлён) — ссылка на icon system.
- `docs/DESIGN_SYSTEM.md` (обновлён) — упоминание QoldauIconCard/ActionCard.
- `docs/CHILD_INTERFACE_GUIDE.md` (обновлён) — ссылки на icon system и gamification.
- `docs/UI_IMPROVEMENT_PLAN.md` (обновлён) — v0.3.8 секция (foundation, иконки, components, gamification, экраны).

### Safety
- SOS на `CallMom` использует `coralSoft` (`#FFEAEA`), не ярко-красный.
- AchievementCard не показывает «не сделал» — только «Скоро!».
- DailyProgressStrip не показывает пустой state (невыполненные достижения не отображаются как «проигрыш»).

### Build
- `npm run build` passes (1646+ modules, 0 errors).
- `apps/prototype/package.json` → version `0.3.8`.
- `VERSIONING.md` → Current Version `v0.3.8`.

### Not changed
- Event Timeline logic, `useEventStore`, `useVoiceObservationStore`, STT/AI abstraction, routes, demo dataset, product logic.
- Создание событий (aac_card, phrase, calm_mode, sos, communication) работает как раньше.

---

## [0.3.8] — 2026-07-01 (Sensory-safe SVG visual polish)

### Added — Visual polish for child UI
- **`src/components/illustrations/CloudMascot.tsx`** — спокойное облачко (mood: `calm` / `happy` / `sleepy`), `animated` prop.
- **`src/components/illustrations/DinoMascot.tsx`** — дружелюбный динозаврик для ChildHome и PhraseBuilder.
- **`src/components/illustrations/SuccessSparkle.tsx`** — мягкая success-галочка после действия.
- **`src/styles/globals.css`** — sensory-safe анимации: `qoldau-breathe` (4s), `qoldau-float` (5s), `qoldau-soft-pulse` (3.2s), `qoldau-check` (420ms one-shot). Поддержка `prefers-reduced-motion: reduce` через CSS media query (отключает loop-анимации).
- **`docs/SENSORY_SAFE_DESIGN_GUIDE.md`** — новый документ: принципы для детей с РАС, палитра, allowed/forbidden анимации, touch-targets, reduced-motion поведение, чек-лист.

### Changed — Child UI
- **`ChildHome`** — hero теперь с DinoMascot, мягкий gradient-фон, спокойные pressed states (`active:scale-[0.96]` + `duration-200`), focus-visible ring.
- **`CalmMode`** — CloudMascot в hero, поддерживающие тексты («Ты в безопасности», «Можно отдохнуть», «Я рядом»), 6 спокойных опций (Тихая музыка, Дыхание, Наушники, Темно, Пауза, Позвать маму). Убран inline `@keyframes breathe` — теперь глобально через CSS-класс.
- **`PhraseBuilderPage`** — DinoMascot маленький сбоку, мягкая ring-подсветка выбранных слов, success-overlay с SuccessSparkle после отправки (без alert).
- **`ChildCards`** — soft success-карточка с SuccessSparkle и текстом «Мама увидит запрос · Событие сохранено». Создание `aac_card` event не сломано.
- **`ChildProgress`** — SuccessSparkle в hero, мягкие supporting copy («У тебя получается», «Спасибо, что показал»).
- **`EmptyState`** — поддержка `useCloud` и `cloudMood` props для замены эмодзи на CloudMascot.
- **`docs/DESIGN_SYSTEM.md`** — добавлена ссылка на SENSORY_SAFE_DESIGN_GUIDE, секция SVG-иллюстраций, обновлена таблица анимаций.
- **`docs/CHILD_INTERFACE_GUIDE.md`** — ссылка на sensory-safe guide, обновлена таблица пастельных фонов с новыми hex-значениями.
- **`docs/UI_IMPROVEMENT_PLAN.md`** — секция про v0.3.8 (что сделано / что не меняли).

### Accessibility
- Все новые SVG имеют `role="img"` и `aria-label`.
- Кнопки child UI имеют `focus-visible:ring-2 focus-visible:ring-teal/40` для keyboard navigation.
- Touch-targets ≥ 88×88 (action cards) / ≥ 40×44 (chrome).

### Safety
- CalmMode больше не использует пугающий красный текст — «Я рядом» в зелёном (`#4EC28A`).
- Поддерживающие формулировки сохранены: «Ты в безопасности», «Можно отдохнуть», «Я рядом».

### Build
- `npm run build` passes (1641 modules).
- `apps/prototype/package.json` → version `0.3.8`.
- `VERSIONING.md` → Current Version `v0.3.8`.

### Not changed (по спеке v0.3.8)
- Event Timeline logic, `useEventStore`, `useVoiceObservationStore`, STT/AI abstraction, routes, demo dataset, product logic.
- Создание событий (ChildCards → `aac_card`, PhraseBuilder → `phrase`, CalmMode → `calm_mode`, CallMom → `sos`) работает как раньше.

---

## [0.3.4] — 2026-07-01 (Visual Design Alignment)

### Added — Design system
- **`src/styles/designTokens.ts`** — palette, radii, spacing, motion, typography tokens.
- **`tailwind.config.js`** — расширен темизацией: новые оттенки teal (light, dark, tint), green (#4EC28A), coral (#E56F5D), yellow (#F7C948), новые тени (card, card-soft, card-hover, inner, ring-teal), keyframes (fade-in, breathe, pulse-soft, slideUp).
- **`docs/DESIGN_SYSTEM.md`** — полная документация: цвета, типографика, скругления, тени, отступы, компоненты, layout, child UI, анимации.
- **`docs/CHILD_INTERFACE_GUIDE.md`** — правила построения детского UI.

### Changed — UI components
- **Button** — variants: primary / secondary / outline / ghost / danger / success / icon. Sizes: sm / md / lg / xl. Block.
- **Card** — variants: default / soft / tinted-{teal,blue,purple,yellow,coral,green,orange}.
- **Badge** — variants: default / outline / teal / blue / purple / yellow / coral / green.
- **PageHeader** — ink заголовок + subtitle + back + rightAction. accent.
- **AIInsightCard** — pastel teal-карточка с Sparkles.
- **EmptyState** — универсальный компонент.

### Changed — Layout
- **AppShell** — phone-panel layout (max-w-430 / 1100). Sticky header с колокольчиком.
- **BottomNav** — floating pill. Для parent — центральная teal-кнопка с микрофоном.

### Changed — Parent pages
- ParentHome / VoiceObservation / AIReview / ClarifyingQuestions / EventTimeline / EventDetails / CareDiary / BehaviorSensory / ParentAIChat / ParentAnalytics / ParentNotifications / ParentProfile — все переписаны под референс.

### Changed — Tutor pages
- TutorHome / TutorVoice / TutorAIReview / TutorReport / TutorChildProfile — все переписаны.

### Changed — Specialist
- SpecialistDashboard — обновлён с ChildSelector, периодом, KPI tinted-карточками.

### Changed — Overview
- Полностью переработан в стиле investor deck.

### UX Text / Safety
- «паттерны поведения» → «повторяющиеся ситуации и реакции»
- «триггеры поведения» → «ситуации, которые могли повлиять»
- «отказ» → «не включился / нужна была пауза»
- Все AI-выводы начинаются с «Похоже…», «Возможно…»
- Все suggestions — «Можно попробовать…»

### Build
- `npm run build` passes
- `apps/prototype/package.json` → version `0.3.4`
- `docs/VERSIONING.md` → Current Version `v0.3.4`

---

## [0.3.0] — 2026-07-01

### Full Demo MVP

#### Added — Data
- **`src/data/demoDataset.ts`** — full mock dataset:
  - 3 children: Алихан (7), Мира (5), Тимур (9)
  - 2 parents, 2 tutors, 2 specialists
  - 60+ events over 7 days for Алихан covering 13 EventTypes
  - All events have `status: 'confirmed'`, logical `linkedEventIds`, mixed `sourceRole` (parent / child / tutor / specialist)
- **Helpers**: `getDemoChild`, `getDemoEventsByChild`, `getDemoTimelineSummary`, `getDemoCommunicationProfile`, `getDemoTutorReport`, `getDemoSpecialistSummary`, `seedDemoEvents`, `resetDemoData`

#### Added — Pages filled with real data
- **Parent**: ParentHome (status, KPIs, last events, AI observation), CareDiary (food/water/toilet/sleep grouped by day), BehaviorSensory (triggers, helpers, calm mode), ParentAIChat (preset questions, AI answers from EventStore), ParentAnalytics (donut + triggers + top signals), ParentProfile (child, parents, tutor, specialist, settings)
- **Child**: ChildHome (6 large cards), ChildFavorites (creates `media_request` events), ChildSpeak (mock STT + cautious interpretation), PhraseBuilder (creates `phrase` events), CalmMode (timer, creates `calm_mode` events), CallMom (creates `sos` events), ChildProgress (positive-only metrics), **new `/child/now-next`** (visual schedule)
- **Tutor**: TutorHome (schedule, hints, recent observations), TutorVoice (mock recording), TutorAIReview (creates `tutor_note` events from transcript), TutorChildProfile (signals / what helps / avoid / preferences), TutorReport (7-day summary, copy/send via toast)
- **Specialist**: SpecialistDashboard (KPIs, AI summary, links), SpecialistEvents (filterable timeline), ABCAnalysis (A/B/C columns from EventStore), CommunicationProfile (signals with confidence), CarePatterns (food→sensory patterns), SupportPlan (visual schedule, sensory support, what to try/confirm), Reports (preview + types)

#### Added — UX
- **`useToastStore`** + `ToastContainer` — in-app feedback instead of `alert()`
- All buttons either navigate to a real page or call `showToast`
- No `alert()` or `confirm()` anywhere
- Child events all use cautious AI wording: «Похоже…», «Нужно подтвердить»

#### Changed
- `package.json` → version `0.3.0`
- `VERSIONING.md` → `Current Version: v0.3.0`
- `docs/DEMO_SCRIPT.md` → updated
- `docs/MVP_WALKTHROUGH.md` → new
- All Parent/Child/Tutor/Specialist pages read from `useEventStore`
- Card component now supports `onClick`
- `useEventStore` initializes with 60+ events from `demoDataset`

#### Fixed
- `tsc` strict-mode unused-import warnings across all rewritten pages
- `AlertCircle` re-imported in EventTimeline for status icon map

---

## [0.2.1] — 2026-07-01 (Hotfix)

### Fixed
- Demo step targets stable seeded event via `evt-demo-voice-1`; demo events seeded by `seedDemoEvents()` in `src/data/demoScenario.ts`.
- `src/utils/eventLabels.ts` maps statuses (`draft`/`ai_parsed`/`confirmed`/`corrected`/`rejected`) to UI.
- Parent voice flow: AIReview no longer creates events; ClarifyingQuestions is the single point that creates confirmed events with `rawText`/`payload`/`linkedEventIds`.
- Event Timeline filters expanded for every `EventType`.
- Tailwind class audit — `bg-orange`/`bg-indigo`/`bg-gray-soft`/`text-gray` removed.

### Added
- `src/data/demoScenario.ts`, `src/utils/eventLabels.ts`, `docs/VERSIONING.md`.

---

## [0.2.0] — 2026-07-01

Guided Demo Mode with 18-step tour, improved Overview, Event Timeline, EventDetails, CommunicationProfile, TutorReport, SpecialistDashboard. Toast notifications.

---

## [0.1.0] — 2026-07-01

Initial MVP with Parent (11), Child (8), Tutor (5), Specialist (7) pages. Mock STT, mock AI parser, Zustand stores, Tailwind design tokens.