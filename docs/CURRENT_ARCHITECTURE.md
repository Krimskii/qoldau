# Qoldau AI — Current Architecture (v0.3.18)

> Единая точка входа для разработчика, попавшего в проект.
> Последнее обновление: 2026-07-01 (v0.3.18)

---

## 1. TL;DR

**Qoldau AI** — voice-first платформа сопровождения детей с РАС.
Это **frontend-only demo MVP** в виде SPA на React + TypeScript + Vite + Tailwind + Zustand.

**В production-бандле нет**:
- backend / API / БД
- auth / login
- real STT / real LLM (всё mock)
- cloud sync / payment / push
- medical records / wearable / GPS / геозон

Все данные живут в **localStorage** через Zustand-persist. Демо-данные засеяны при первом запуске.

---

## 2. Project structure

```
qoldau/
├── apps/
│   └── prototype/                     # Единственное приложение (SPA)
│       ├── public/
│       │   └── assets/icons/          # Soft 3D PNG ассеты (24 actions + 4 events + 2 mascots)
│       ├── src/
│       │   ├── app/                   # Entry: App.tsx, router.tsx
│       │   ├── components/
│       │   │   ├── ui/                # Design system (QoldauCard, Button, Badge, AppIcon...)
│       │   │   ├── layout/            # AppShell, ChildTopBar, BottomNav, PageHeader...
│       │   │   ├── assets/            # IconRenderer (auto soft-first → 2D)
│       │   │   ├── child/             # ChildSettingsSheet, ChildOnboarding
│       │   │   ├── icons/             # child2d.tsx (50+ SVG), soft3d.tsx, brand.tsx, flat.tsx
│       │   │   └── illustrations/     # CloudMascot, DinoMascot, SuccessSparkle
│       │   ├── pages/
│       │   │   ├── overview/          # Landing page (4 roles)
│       │   │   ├── parent/            # 12 pages
│       │   │   ├── child/             # 11 pages
│       │   │   ├── tutor/             # 5 pages + 1 alias route
│       │   │   └── specialist/        # 7 pages + 1 alias route
│       │   ├── store/                 # Zustand stores (event/role/toast/asset/demo/voice/child)
│       │   ├── data/                  # Demo dataset (DEMO_CHILDREN, DEMO_EVENTS, mock*)
│       │   ├── lib/
│       │   │   ├── ai/                # aiParser.mock.ts — AI-парсинг транскрипта
│       │   │   ├── stt/               # sttClient.mock.ts — имитация распознавания речи
│       │   │   ├── events/            # eventFactory.ts — сборка батча events
│       │   │   └── game/              # achievementRules.ts
│       │   ├── styles/                # tokens.ts, designTokens.ts, globals.css, animations.css
│       │   ├── types/                 # qoldau.ts, assets.ts, lucide-react.d.ts
│       │   └── utils/                 # eventLabels.ts, cn.ts, formatTime.ts
│       ├── tailwind.config.js
│       ├── vite.config.ts
│       └── package.json
├── docs/                              # 26 markdown-файлов (PRODUCT_BRIEF, MVP_SCOPE, ...)
├── README.md
└── CHANGELOG.md
```

---

## 3. App entry & routing

**Single-file router**: `apps/prototype/src/app/router.tsx` (BrowserRouter).

**38 routes** объединены общим `AppShell` (показывает/скрывает nav, top bar по роли).

**Roles** (через `useRoleStore`):
- `parent` → AppShell c parent header + 4-tab bottom nav (Home/Voice/Events/Profile)
- `child` → AppShell c `ChildTopBar` (avatar + brand + Тишина + bell + gear) + 3-tab bottom nav (Главная/Карточки/Сказать)
- `tutor` → AppShell c tutor header + 2-tab bottom nav (Home/Report)
- `specialist` → AppShell c specialist header + 2-tab bottom nav (Dashboard/Events)

**Default**: `/` → `/overview` (landing page), `*` → `/overview` (поэтому в v0.3.18 два ранее сломанных handler-а (`/parent/voice/manual`, `/child/phrase`) уводили пользователя туда, а не показывали 404).

---

## 4. Demo-flow (4 шага за 30 секунд)

1. **Child → signal**: ребёнок нажимает AAC-карточку (вода/туалет/еда) или кнопку «Позвать маму» (CallMom). `useEventStore.addEvent()` записывает событие в localStorage.
2. **Adult → voice**: родитель/тьютор нажимает «Сказать наблюдение» → mic → `transcribeMock()` через 1.5с возвращает мок-транскрипт. Можно отредактировать в textarea.
3. **AI → structure**: «Продолжить к AI-разбору» → `processWithAI()` через 1.2с → `aiParser.mock.ts` возвращает `ParsedObservation { events[], clarificationQuestions[], insight }`.
4. **Confirm → timeline**: «Сохранить и подтвердить» → `eventFactory.createEventsFromAIReview()` создаёт батч (extracted events + observation event) → `addEvents([...])` → `/parent/events` показывает обновлённый timeline.

Специалист читает этот же Event Timeline через `ChildSelector` (может переключать между детьми).

---

## 5. State management — Zustand

| Store | Что хранит | Persisted? | localStorage key |
| ----- | ---------- | ---------- | ---------------- |
| `useEventStore` | `QoldauEvent[]` — единый Event Timeline | ✅ | `qoldau-event-store-v1` |
| `useRoleStore` | Текущая роль UI | ❌ | — |
| `useToastStore` | Toast-уведомления (auto-dismiss 3с) | ❌ | — |
| `useAppStore` | App-level (current screen, etc.) | ❌ | — |
| `useAssetStore` | Custom ассеты (uploaded photos) | ✅ | `qoldau-asset-store-v1` |
| `useDemoControlsStore` | `selectedChildId`, demo flags | ✅ | `qoldau-demo-controls-v1` |
| `useDemoStore` | Demo started flag | ✅ | `qoldau-demo-store-v1` |
| `useVoiceObservationStore` | Recording state machine + transcripts | ✅ | `qoldau-voice-store-v1` |
| `useChildSettingsStore` | calmVisual / largeIcons / highContrast / paused / fontScale | ✅ | `qoldau-child-settings-v1` |
| `useChildOnboardingStore` | First-run welcome flag | ✅ | `qoldau-child-onboarded-v1` |

**Паттерн:** каждый store экспортирует actions через Zustand selectors, чтобы избежать re-render всего поддерева.

---

## 6. Mock data layer

**Entry point**: `apps/prototype/src/data/demoDataset.ts` (~27 KB)

Экспортирует:
- `DEMO_PRIMARY_CHILD` — Алихан, 5 лет
- `DEMO_CHILDREN` — 3 ребёнка для specialist (ChildSelector)
- `DEMO_PARENTS`, `DEMO_TUTORS`, `DEMO_SPECIALISTS` — взрослые
- `DEMO_EVENTS` — ~50 событий за последнюю неделю (seed при первой загрузке)
- `seedDemoEvents(store)` — функция сидинга
- `resetDemoData()` — сброс к дефолтному набору (через DemoControls)
- `getDemoTimelineSummary(childId)` — агрегаты для AI-чата и Analytics

Сидинг вызывается из `useEventStore` при первом запуске, если store пустой.

---

## 7. Event model

**Canonical type**: `QoldauEvent` (`types/qoldau.ts`)

```ts
interface QoldauEvent {
  id: string;
  childId: string;
  type: EventType;          // 'food' | 'water' | 'toilet' | 'sleep' | 'behavior' |
                            // 'sensory' | 'communication' | 'aac_card' | 'voice_observation' |
                            // 'phrase' | 'media_request' | 'sos' | 'tutor_note' | 'calm_mode' | 'state'
  title: string;
  description: string;
  timestamp: string;        // ISO 8601
  sourceRole: 'parent' | 'child' | 'tutor' | 'specialist' | 'device' | 'ai';
  status: 'pending' | 'confirmed' | 'rejected';
  confidence?: number;      // 0..1 (AI-generated)
  rawText?: string;         // исходный транскрипт
  linkedEventIds?: string[];
  payload?: Record<string, unknown>;  // гибкие данные под каждый тип
}
```

**Где используется:**
- `EventTimeline` (parent) — все events с фильтрами
- `SpecialistEvents` — с фильтром по sourceRole + ChildSelector
- `Analytics` — donut chart по `type` counts
- `ABCAnalysis` — группировка events по antecedent→behavior→consequence
- `CommunicationProfile` — events `communication` + `aac_card`
- `CarePatterns` — events `food/water/toilet/sleep`
- `TutorReport` — events за 7 дней от `tutor` + `specialist`

Подробнее: `docs/EVENT_MODEL.md`.

---

## 8. STT mock

**File**: `apps/prototype/src/lib/stt/sttClient.mock.ts`

Имитирует распознавание речи через `Promise` с задержкой 1.5с.

```ts
async function transcribeMock(audio: Blob, opts): Promise<STTResult>
```

Возвращает фиксированный `DEMO_TRANSCRIPT` (в `VoiceObservation.tsx`):
> «Алихан поел кашу с сыром, потом начал нервничать и закрывал уши. Сказал «ту-ту» и сходил в туалет.»

**`transcribeManual(text)`** — обходит STT, сразу использует переданный текст.

**Future stub**: `sttClient.future.ts` — заглушка с тем же интерфейсом для подмены на Web Speech API / Whisper API.

---

## 9. AI parser mock

**File**: `apps/prototype/src/lib/ai/aiParser.mock.ts`

Принимает транскрипт, возвращает `ParsedObservation`:

```ts
interface ParsedObservation {
  events: Array<{
    timestamp: string;       // 'HH:MM'
    title: string;
    description: string;
    type: EventType;
  }>;
  clarificationQuestions: Array<{
    id: string;
    question: string;
    options: string[];
  }>;
  insight: string;           // 'Похоже, ...'
}
```

**Логика парсинга** — keyword-matching:
- «поел/каша/суп» → food event
- «вода/пьёт» → water event
- «туалет/горшок» → toilet event
- «закрывал уши/шум» → sensory event
- «сказал «ва»/карточка» → communication/aac_card event
- и т.д.

Insight генерируется из counts через шаблоны: «Похоже, чаще встречаются X и Y...»

**Future stub**: `aiParser.future.ts` — заглушка для LLM.

---

## 10. Icon system (hybrid)

**Файлы:**
- `components/icons/child2d.tsx` — **50+ inline 2D SVG** + `CHILD_2D_REGISTRY` (single source of truth для IconRenderer).
- `components/icons/soft3d.tsx` — legacy wrappers для soft 3D PNG + `SOFT_FIRST_REGISTRY` (НЕ используется IconRenderer, оставлен для backward-compat).
- `components/icons/brand.tsx` — QoldauLogoMark и брендовые иконки.
- `components/icons/flat.tsx` — legacy line SVG (для chrome).
- `public/assets/icons/{actions,events,mascots}/` — 30 soft 3D PNG ассетов (24 actions + 4 events + 2 mascots).

**Entry point**: `components/assets/IconRenderer.tsx`
- Auto-resolves `builtinKey` → 2D inline SVG (через `CHILD_2D_REGISTRY`).
- Если есть custom ассет (загруженный через `useAssetStore`), использует его.
- Soft 3D PNG выбираются только при явном указании `<IconRenderer prefer="soft3d" />`.

**Naming convention:** функциональный (`water`, `food`, `call`, `tutor`) — не визуальный (`drop`, `plate`).

---

## 11. Design system

**Токены**: `styles/tokens.ts` (consolidated) + `styles/designTokens.ts` (legacy alias) + `tailwind.config.js` + `styles/globals.css` (CSS vars).

**Цвета**: teal (primary), coral (warm), blue (calm), yellow (energy), purple (specialist), green (positive).

**Core components** (`components/ui/`):
- `QoldauCard` — базовая карточка с variants (default / tinted-{color} / elevated / soft)
- `QoldauIconCard` — child-style (white bg + colored border + colored icon-container + colored label)
- `QoldauActionCard` — large tappable card с icon + label
- `SectionCard` — section header + accent bar
- `StatusBadge` / `Badge` — pills с color variants
- `AIInsightCard` — hero с AI-observation + disclaimer
- `AppIcon` — универсальный wrapper для Lucide иконок
- `EmptyState` — empty placeholder
- `MetricCard` / `TimelineItem` — list items

**Tailwind plugin**: `tailwindcss-shadow-arrows` (не используется), `tailwindcss/forms` (отключён для сохранения кастомных стилей).

Подробнее: `docs/DESIGN_SYSTEM.md`.

---

## 12. Accessibility

- **Child UI** (`DESIGN_RULES.md`):
  - NO ambient/loop animations (только one-shot feedback ≤300ms: `success-pop` 280ms, `fade-in` 240ms, `tap-scale` 200ms)
  - AAC color coding (white card + colored border + colored icon-container)
  - Tap zones ≥ 64px
  - BottomNav max 3 items
  - Hero tagline «Ты в безопасности · Я рядом» (без medical claims)
  - **Personalization обязательна** через `useChildSettingsStore`:
    - `calmVisual` — отключает декоративные элементы
    - `largeIcons` — увеличивает AAC-карточки (md → lg)
    - `highContrast` — повышает контрастность текста
    - `paused` — global pause switch (`html.qoldau-paused`) останавливает все анимации
    - `fontScale` — увеличивает базовый шрифт

- **Все роли**:
  - `aria-label` на иконочных кнопках
  - `aria-pressed` на toggle-кнопках
  - `aria-live="polite"` на success-feedback
  - `role="status"` для toast-уведомлений
  - `focus-visible:ring-2 focus-visible:ring-teal/40` для keyboard nav

---

## 13. Intentionally mocked

| Что | Mock-имплементация | Где |
| --- | ------------------ | --- |
| Распознавание речи | `transcribeMock()` возвращает DEMO_TRANSCRIPT через 1.5с | `lib/stt/sttClient.mock.ts` |
| AI-парсинг транскрипта | `aiParser.mock.ts` с keyword-matching | `lib/ai/aiParser.mock.ts` |
| Event storage | localStorage через Zustand-persist | `store/useEventStore.ts` |
| Custom images | `useAssetStore` хранит base64 в localStorage (max ~5MB) | `store/useAssetStore.ts` |
| Push-уведомления | Toast-уведомления через `useToastStore` | `store/useToastStore.ts` |
| SOS | `addEvent({ type: 'sos' })` + success popup | `pages/child/CallMom.tsx` |
| Call Mom | `addEvent({ type: 'sos', payload: { targetPerson } })` | `pages/child/CallMom.tsx` |

---

## 14. Must not add (explicit constraints)

Из `MVP_SCOPE.md` + `SAFETY_WORDING.md`:

- ❌ Real STT (Whisper / Web Speech) — переход в Phase 2
- ❌ Real LLM (OpenAI / Claude) — Phase 2
- ❌ Backend API / БД / Cloud sync — Phase 2
- ❌ Auth / login / registration — Phase 2
- ❌ Push notifications / email / SMS — Phase 2
- ❌ Payment / subscription — Phase 3
- ❌ Medical records / диагнозы — навсегда запрещено
- ❌ Wearable integration / GPS / геозоны — Phase 3
- ❌ Телемедицина / видеозвонки со специалистом — Phase 3
- ❌ Запрещённые формулировки:
  - «лечит аутизм», «диагностирует», «исправляет ребёнка»
  - «нормализует поведение», «ИИ точно понял причину»
  - «поведенческое нарушение», «неадекватное поведение»
  - «ребёнок манипулирует»

---

## 15. Future integration points (Phase 2+)

| Слой | Что заменить | На что |
| ---- | ------------ | ------ |
| STT | `sttClient.mock.ts` | `sttClient.future.ts` → Web Speech API / Whisper |
| AI parser | `aiParser.mock.ts` | `aiParser.future.ts` → GPT-4 / Claude function calling |
| Storage | localStorage | REST API + PostgreSQL / Firestore |
| Auth | none | OAuth (Google / Apple) + email magic link |
| Real-time | none | WebSocket / Firebase Realtime DB |
| Push | Toast | FCM / APNs |
| Sync | per-device | Multi-device через cloud |
| Reports | `navigator.clipboard.writeText` | PDF generation + email + Drive export |

---

## 16. Technical debt / known issues

| # | Issue | Приоритет | Решение |
| - | ----- | --------- | ------- |
| 1 | `today` в `ParentHome` хардкодился `2026-07-01` (исправлено в v0.3.18) | High | ✅ Done |
| 2 | `/parent/voice/manual` route не существовал (исправлено в v0.3.18) | Critical | ✅ Done |
| 3 | `/child/phrase` typo → правильный `/child/phrase-builder` (исправлено в v0.3.18) | Critical | ✅ Done |
| 4 | Cross-role nav из tutor/specialist в `/parent/events/:id` (исправлено через alias routes в v0.3.18) | High | ✅ Done |
| 5 | `PhoneFrame` (v0.3.15 mockup) удалён, но остался в некоторых комментариях | Low | Code cleanup |
| 6 | `soft3d.tsx` legacy wrappers не используются, но файл сохранён | Low | Удалить после release v1.0 |
| 7 | `flat.tsx` legacy icons — частично дублируют `child2d.tsx` | Low | Merge в v0.4 |
| 8 | Нет unit-тестов на `eventFactory.ts` | Medium | Phase 2 (vitest) |
| 9 | Нет e2e-тестов (Playwright) на основной demo-flow | Medium | Phase 2 |
| 10 | Zustand selectors не используются повсеместно (иногда весь store) | Low | Оптимизация re-renders |

---

## 17. How to run

```bash
# Install
cd qoldau/apps/prototype
npm install

# Dev (Vite, HMR)
npm run dev
# → http://localhost:5173

# Production build
npm run build
# → dist/

# Preview production build
npm run preview
```

Подробнее: `README.md` (обновлён в v0.3.18).

---

## 18. Где ещё почитать

| Документ | Что внутри |
| -------- | ---------- |
| `README.md` | TL;DR + как запустить + demo-flow |
| `CHANGELOG.md` | История версий (0.1.0 → 0.3.18) |
| `docs/PRODUCT_BRIEF.md` | Видение, гипотеза, метрики успеха |
| `docs/MVP_SCOPE.md` | Что входит / что НЕ входит в MVP |
| `docs/USER_JOURNEYS.md` | 4 роли → сценарии |
| `docs/NAVIGATION_MAP.md` | Все routes + cross-links |
| `docs/EVENT_MODEL.md` | QoldauEvent + lifecycle |
| `docs/DATA_MODEL.md` | Stores + persisted keys |
| `docs/DESIGN_SYSTEM.md` | Tokens + components |
| `docs/ICON_SYSTEM.md` | Hybrid (soft 3D + 2D + Lucide) |
| `docs/SENSORY_SAFE_DESIGN_GUIDE.md` | Что можно/нельзя для child UI |
| `docs/DESIGN_RULES.md` | AAC color coding, animations, accessibility |
| `docs/SAFETY_WORDING.md` | Запрещённые формулировки + гайд |
| `docs/QA_CLICKTHROUGH_REPORT.md` | Полный QA pass (v0.3.18) |
| `docs/CURRENT_ARCHITECTURE.md` | Этот документ |
| `docs/MVP_WALKTHROUGH.md` | Step-by-step демо-сценарий |
| `docs/DEMO_SCRIPT.md` | Что говорить на демо-встрече |