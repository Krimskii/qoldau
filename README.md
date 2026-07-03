# Qoldau AI

Voice-first AI-платформа сопровождения детей с РАС, родителей, тьюторов и специалистов.

**Текущая версия: v0.4.0** — Full Demo MVP + Backend API + deployment-ready

> **Что нового в v0.4.0:** добавлен backend API (`apps/api`) на Express + TypeScript, frontend синхронизируется с API при `VITE_API_BASE_URL`, mock STT/AI endpoints, Dockerfile + docker-compose. См. [docs/API.md](docs/API.md) и [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). Предыдущие релизы — [CHANGELOG.md](CHANGELOG.md).

---

## Быстрый старт

### Только frontend (mock, без backend)

```bash
cd apps/prototype
npm install
npm run dev
# → http://localhost:5173 (работает на localStorage)
```

### Full stack (frontend + backend)

```bash
# Terminal 1: backend
cd apps/api
npm install
npm run dev
# → http://localhost:4000

# Terminal 2: frontend (с env var)
cd apps/prototype
cp .env.example .env
npm install
npm run dev
# → http://localhost:5173 (синхронизируется с API)
```

### Docker (full stack)

```bash
docker compose up -d --build
# API:    http://localhost:4000
# (frontend задеплойте отдельно через Vercel/Netlify/Caddy — см. docs/DEPLOYMENT.md)
```

## Сборка

```bash
# Frontend
cd apps/prototype
npm run build      # → dist/ (статический SPA)

# Backend
cd apps/api
npm run build      # → dist/ (Node.js, запускается через `npm start`)
```

`npm run build` ✅ чисто: TypeScript strict mode, 0 ошибок.

---

## Демо-flow (4 шага за 30 секунд)

1. **Overview → Запустить демо** (или Role Switcher → **Родитель**)
2. **Parent Voice**: «Сказать наблюдение» → mic → «Использовать demo-текст» → «Продолжить к AI-разбору»
3. **AI Review**: проверить извлечённые события → «Сохранить и подтвердить»
4. **Event Timeline**: видно, как новые события появились в ленте

Для полного тура по 4 ролям см. [docs/MVP_WALKTHROUGH.md](docs/MVP_WALKTHROUGH.md).
Для guided demo через Demo Controls (внизу Overview) — [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md).

**Переключение ролей:** Role Switcher (вверху справа) → Родитель / Ребёнок / Тьютор / Специалист.

---

## Что реализовано в v0.3.18

### Данные
- **3 ребёнка**: Алихан (7), Мира (5), Тимур (9) — `src/data/demoDataset.ts`
- **50+ событий за 7 дней** для Алихана: voice_observation, food, water, toilet, sleep, behavior, sensory, communication, aac_card, phrase, media_request, sos, calm_mode, tutor_note, state
- Все события связаны через `linkedEventIds`
- 2 родителя, 2 тьютора, 2 специалиста

### Наполненные экраны (38 routes)

#### Parent (12)
`/parent/home` · `/parent/voice` · `/parent/ai-review` · `/parent/clarify` · `/parent/events` · `/parent/events/:eventId` · `/parent/care` · `/parent/behavior` · `/parent/assistant` · `/parent/analytics` · `/parent/profile` · `/parent/notifications`

#### Child (11)
`/child/home` · `/child/cards` · `/child/favorites` · `/child/speak` · `/child/phrase-builder` · `/child/calm` · `/child/now-next` · `/child/choice` · `/child/interface-guide` · `/child/call` · `/child/progress`

#### Tutor (5 + 1 alias)
`/tutor/home` · `/tutor/voice` · `/tutor/ai-review` · `/tutor/report` · `/tutor/child-profile` · `/tutor/events/:eventId`

#### Specialist (7 + 1 alias)
`/specialist/dashboard` · `/specialist/events` · `/specialist/events/:eventId` · `/specialist/abc` · `/specialist/communication-profile` · `/specialist/care-patterns` · `/specialist/support-plan` · `/specialist/reports`

#### Overview
`/overview` (landing page, Role Switcher, Demo Controls) · `/` → `/overview` · `*` → `/overview`

### UX / Design System
- **Hybrid icon system**: soft 3D PNG (30 ассетов в `public/assets/icons/`) + inline 2D SVG (50+ в `components/icons/child2d.tsx`) + Lucide для chrome
- **QoldauCard / QoldauIconCard / QoldauActionCard** — единая дизайн-система
- **Cautious AI wording** — везде «Похоже…», «Возможно…», «Это наблюдение, не диагноз.», «Можно обсудить со специалистом.»
- **Toast notifications** — in-app feedback (нет `alert()`)
- **Все действия создают Event** в Event Timeline (через `useEventStore`)
- **Child UI** — DESIGN_RULES-compliant: NO ambient animations, AAC color coding, tap-zones ≥64px, 3-tab bottom nav, personalization через `useChildSettingsStore` (calmVisual / largeIcons / highContrast / paused / fontScale)

---

## Что реально, что mock

Начиная с v0.6, ключевые интеграции реализованы как **opt-in real с mock-fallback**:
без ключа/backend приложение полностью работает на заглушках (demo не ломается).

| Слой | Статус |
| ---- | ------ |
| STT (распознавание речи) | ✅ **real** — OpenAI Whisper (`OPENAI_API_KEY` / `WHISPER_API_KEY`), fallback `transcribeMock()` |
| AI-парсинг наблюдений | ✅ **real** — OpenAI `gpt-4o-mini` (`OPENAI_API_KEY`), fallback `aiParser.mock.ts` |
| Audio pipeline | ✅ **real** — `POST /api/audio/ingest` (audio → STT → LLM → Event) |
| Backend / БД | ✅ **real** — Express + Prisma (SQLite Phase 1, Postgres-ready) |
| Auth | ✅ **real** — magic-link (JWT), opt-in |
| Realtime | ✅ **real** — socket.io (`event:new/updated/deleted`) |
| Event storage (frontend) | localStorage через Zustand-persist (+ sync с backend в apiMode) |
| Custom images | base64 в localStorage (max ~5MB) |
| Push | Toast-уведомления (реальные push — Phase 2) |

**Не реализовано (Phase 2+):**
- ❌ Push notifications / email / SMS
- ❌ Payment / subscription
- ❌ Cloud sync между устройствами (сейчас per-device)

**Не реализовано и не планируется:**
- ❌ Medical records / диагнозы
- ❌ Wearable / GPS / геозоны
- ❌ Телемедицина

---

## Стек

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** + кастомные design tokens (`src/styles/tokens.ts`)
- **Zustand** для state management (10 stores, 8 persisted)
- **React Router v6** (BrowserRouter, 38 routes)
- **Lucide React** для chrome иконок

---

## Структура проекта

```
qoldau/
├── apps/
│   ├── prototype/                # Frontend SPA (React + Vite)
│   │   ├── src/
│   │   │   ├── app/               # Entry: App.tsx, router.tsx (40+ routes)
│   │   │   ├── api/               # API client (v0.4.0) — fetch wrapper с fallback
│   │   │   ├── components/        # UI / layout / assets / child / icons
│   │   │   ├── pages/             # overview/ + parent/ + child/ + tutor/ + specialist/
│   │   │   ├── store/             # Zustand stores (10 stores, optional API sync)
│   │   │   ├── data/              # Demo dataset, categories
│   │   │   ├── lib/               # ai/ + stt/ + events/ + game/ (legacy mocks)
│   │   │   ├── styles/            # tokens.ts, globals.css, animations.css
│   │   │   └── types/             # qoldau.ts, assets.ts
│   │   ├── public/assets/icons/   # Soft 3D PNG (24 actions + 4 events + 2 mascots)
│   │   └── package.json
│   └── api/                       # Backend API (Express + TS, v0.4.0)
│       ├── src/
│       │   ├── index.ts           # Express entry
│       │   ├── routes/            # health, events, recordings, stt, ai, children
│       │   ├── db/                # In-memory store (Phase 2: Prisma)
│       │   └── middleware/        # logger
│       ├── Dockerfile             # Multi-stage build
│       ├── tsconfig.json
│       └── package.json
├── docs/                          # 28 markdown-файлов
├── docker-compose.yml             # Full-stack dev environment
├── README.md
└── CHANGELOG.md
```

Подробнее: [docs/CURRENT_ARCHITECTURE.md](docs/CURRENT_ARCHITECTURE.md), [docs/API.md](docs/API.md), [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

---

## Документация

### Must-read
- [docs/CURRENT_ARCHITECTURE.md](docs/CURRENT_ARCHITECTURE.md) — **полная архитектура проекта** (структура / routes / stores / events / icons / accessibility / Phase 2 план)
- [docs/QA_CLICKTHROUGH_REPORT.md](docs/QA_CLICKTHROUGH_REPORT.md) — **QA pass v0.3.18** (38 routes проверено, 7 broken handlers исправлено)
- [docs/PRODUCT_BRIEF.md](docs/PRODUCT_BRIEF.md) — видение, гипотеза, метрики
- [docs/MVP_SCOPE.md](docs/MVP_SCOPE.md) — что входит / не входит в MVP
- [docs/USER_JOURNEYS.md](docs/USER_JOURNEYS.md) — 4 роли → сценарии

### Сценарии показа
- [docs/MVP_WALKTHROUGH.md](docs/MVP_WALKTHROUGH.md) — полный сценарий показа v0.3.18
- [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) — что говорить на демо-встрече

### Технические
- [docs/EVENT_MODEL.md](docs/EVENT_MODEL.md) — модель `QoldauEvent`
- [docs/DATA_MODEL.md](docs/DATA_MODEL.md) — stores + persisted keys
- [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) — tokens + components
- [docs/ICON_SYSTEM.md](docs/ICON_SYSTEM.md) — hybrid (soft 3D + 2D + Lucide)
- [docs/SENSORY_SAFE_DESIGN_GUIDE.md](docs/SENSORY_SAFE_DESIGN_GUIDE.md) — child UI правила
- [docs/DESIGN_RULES.md](docs/DESIGN_RULES.md) — AAC color coding, animations, accessibility
- [docs/TECH_DECISIONS.md](docs/TECH_DECISIONS.md) — почему так, а не иначе
- [docs/NAVIGATION_MAP.md](docs/NAVIGATION_MAP.md) — все routes + cross-links

### UX
- [docs/SAFETY_WORDING.md](docs/SAFETY_WORDING.md) — запрещённые формулировки
- [docs/UX_WRITING_GUIDE.md](docs/UX_WRITING_GUIDE.md) — гайд по текстам
- [docs/CHILD_INTERFACE_GUIDE.md](docs/CHILD_INTERFACE_GUIDE.md) — принципы child UI

### Прочее
- [CHANGELOG.md](CHANGELOG.md) — история версий (0.1.0 → 0.3.18)
- [docs/FEATURE_MAP.md](docs/FEATURE_MAP.md) — карта экранов и функций
- [docs/MOCK_DATA_SPEC.md](docs/MOCK_DATA_SPEC.md) — спецификация mock-данных
- [docs/VERSIONING.md](docs/VERSIONING.md) — semver + release notes
- [docs/ACCEPTANCE_CRITERIA.md](docs/ACCEPTANCE_CRITERIA.md) — критерии приёмки
- [docs/ROUTES.md](docs/ROUTES.md) — все routes (38)

---

## Безопасность и формулировки

Qoldau AI **не является медицинским устройством**. Не диагностирует, не лечит, не заменяет специалиста.

Все AI-выводы формулируются осторожно:
- «Похоже…»
- «Возможно…»
- «Это наблюдение, не диагноз.»
- «Нужно подтвердить.»
- «Можно обсудить со специалистом.»

Запрещены: «лечит аутизм», «диагностирует», «исправляет ребёнка», «нормализует поведение», «ИИ точно понял причину», «поведенческое нарушение», «неадекватное поведение», «ребёнок манипулирует».

Подробнее: [docs/SAFETY_WORDING.md](docs/SAFETY_WORDING.md).