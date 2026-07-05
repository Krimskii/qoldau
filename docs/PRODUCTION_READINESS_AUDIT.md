# Production Readiness Audit — `apps/prototype/src/`

> **Дата:** 2026-07-05 · **Скоуп:** все 4 роли (parent / child / tutor / specialist) + auth.
> **Метод:** grep по TODO/FIXME/HACK, mock*, placeholder, coming soon; ручной
> просмотр `router.tsx`, `AppShell.tsx`, `api/client.ts`, `data/mock*`,
> `lib/stt/sttClient.{mock,future}.ts`, `lib/ai/aiParser.{mock,future}.ts`.

---

## 1. TODO / FIXME / HACK / XXX

**0 совпадений** по всему `apps/prototype/src/`.

---

## 2. Строка-литералы «заглушка / placeholder / coming soon»

### pages/child/
- `CalmMode.tsx:19` — `// Mock-длительность «аудио от мамы» — имитирует воспроизведение без реального файла.`
- `CalmMode.tsx:20,91,94,264` — `MOCK_AUDIO_DURATION = 18`, fake `setInterval` audio.

### pages/tutor/
- `TutorAIReview.tsx:31` — `// Запускаем полный flow (mock STT + AI) только один раз.`

### pages/overview/
- `Overview.tsx:95-117` — demo-reseed комментарии.

### components/
- `game/AchievementCard.tsx:51` — `<span>Скоро!</span>` (label «Coming soon»).
- `assets/IconRenderer.tsx:132` — `// 6. Last resort — neutral placeholder` (это OK, fallback для неизвестного ассета).
- `ui/EmptyState.tsx:2`, `Skeleton.tsx:2` — design system placeholders (OK).
- `assets/AssetPicker.tsx:104`, `ImageUpload.tsx:167`, `LoginPage.tsx:74`, `ParentAIChat.tsx:124`, `VoiceObservation.tsx:621` — HTML `placeholder=` (OK, не stub).

### lib/
- `ai/aiParser.future.ts:2,44` — `Future AI Parser — заглушка`, `[Qoldau] Real AI Parser is not implemented yet`.
- `stt/sttClient.future.ts:2,26,27,47` — `Future STT client — заглушка`, `[Qoldau] Real STT client is not implemented yet`.

### store/
- `useVoiceObservationStore.ts:127,306` — legacy mock-flow.

### api/
- `client.ts:5` — `Если API недоступен — fallback на in-memory mock`.
- `client.ts:115,124` — `STT (mock)` и `AI parser (mock)` секции в API-клиенте.

---

## 3. Mock fallbacks (useDemo, mock*, MOCK)

### Mock data files (`data/`)
- `mockChild.ts` — `mockChild: ChildProfile`, `mockEvents: QoldauEvent[]`.
- `mockEvents.ts` — `mockVoiceObservation`, `mockAIInsight`, `mockAIParsedObservation`.
- `mockNotifications.ts` — `mockNotifications: NotificationItem[]`.
- `mockSpecialist.ts` — `mockSpecialistData`.
- `mockTutor.ts` — `mockTutorChild`, `mockTutorHints`.
- `demoDataset.ts` — общий demo dataset.

### Mock API (`lib/`)
- `mockApi.ts` — класс `MockApi` (51 строка), сидится в client fallback.

### Mock STT / AI parsers (`lib/`)
- `stt/sttClient.mock.ts` — `mockSTTClient`.
- `stt/useSpeechRecognition.ts:5,69-275` — `mockTranscript`, `startMock()`, `mode: 'real' | 'mock'`.
- `ai/aiParser.mock.ts` — `mockAIParser` (regex-based).

### Stores
- `useDemoControlsStore.ts`, `useDemoStore.ts`, `useVoiceObservationStore.ts` (mock-клиенты по умолчанию).
- `useEventStore.ts:167` — `// сидим демо-сценарий для onboarding`.

### Pages
- `parent/VoiceObservation.tsx` — все `mockMode`/`sttMocked`/`aiMocked` честные (✓).
- `parent/ParentAIChat.tsx:21,32-44` — `text: 'Привет! Это демо-помощник Qoldau...'` + keyword-match (НЕ реальный AI).
- `pages/parent/ClarifyingQuestions.tsx:110` — `sttSource: sttSource ?? 'mock'`.
- `pages/specialist/*.tsx`, `pages/tutor/*.tsx` — все используют `useDemoControlsStore` для `selectedChildId`.
- `pages/child/CalmMode.tsx:20-264` — fake audio.
- `pages/child/ChildSpeak.tsx:109-203` — fallback на random `DEMO_LABELS`.

---

## 4. No-op / disabled / empty stubs

### Disabled buttons (легитимные, по state)
- `assets/ImageUpload.tsx:212`, `privacy/ConsentGate.tsx:155`,
  `ui/FamilySetupCard.tsx:97`, `ui/Primitives.tsx:17`,
  `ui/QoldauActionCard.tsx:28`, `ui/QoldauIconCard.tsx:55`,
  `pages/auth/LoginPage.tsx:76,90`, `pages/child/ChildFavorites.tsx:249`,
  `pages/child/NeedCard.tsx:318,332`, `pages/child/PhraseBuilderPage.tsx:411,428,438`,
  `pages/parent/ParentProfile.tsx:85`,
  `pages/parent/VoiceObservation.tsx:478` — всё gating по state (OK).

### Fake actions (только toast)
- 🚨 `pages/tutor/TutorReport.tsx:55-57` — `handleSend` только toast
  `'Отчёт отправлен родителю'`. Нет реальной отправки.
- 🚨 `pages/specialist/Reports.tsx:233` — 5 кнопок «Другие отчёты» →
  toast `'<title> появится в следующей версии'`.

### Dead code / unused refs
- `CalmMode.tsx:120` — `void stopAudio;` (dead reference, no-op).
- `HealthCheckBanner.tsx:63`, `LoginPage.tsx:39`, `VerifyPage.tsx:38`,
  `VoiceObservation.tsx:119,324,468,473` — `void X` для unused vars.

### Stub candidates (по размеру файла)
- `pages/tutor/TutorChildProfile.tsx` — 105 строк, всё на статических массивах
  (`whatHelps`, `avoidList`, `preferences`) + `DEMO_CHILDREN`.
- `pages/tutor/TutorVoice.tsx` — 106 строк, использует mock STT/AI.
- `pages/tutor/TutorHome.tsx` — 144 строки, статические `HINTS`, `DEMO_PRIMARY_CHILD`.
- `pages/specialist/SupportPlan.tsx` — 110 строк, всё в hardcoded массивах.
- `pages/specialist/SpecialistEvents.tsx` — 89 строк, FILTERS hardcoded.
- `pages/specialist/CarePatterns.tsx`, `ABCAnalysis.tsx`, `CommunicationProfile.tsx` —
  heavy hardcoded строк.
- `pages/child/ChildWater.tsx`, `ChildFood.tsx` — по 31 строке (только
  `CONFIG` + `<NeedCard />`).

### LoginPage dev-leak (🚨)
- `pages/auth/LoginPage.tsx:74,84,96-131` —
  - `placeholder="parent@example.com"` (OK).
  - `error ${error}. Убедись, что backend запущен (VITE_API_BASE_URL=http://localhost:4000).`
    — показывает dev-URL в user-facing ошибке.
  - `devMagicUrl` (dev-режим) — отображается inline как «В demo-режиме ссылка
    показана ниже».
  - `В demo-режиме magic-link не отправляется на почту. После нажатия кнопки
    ниже появится ссылка для перехода.`

---

## 5. i18n gaps (hardcoded Cyrillic в JSX)

**Всего 1874 строки хардкод-русского вне `t()`/`i18n.t()`.**

### Топ-10 самых «грязных» файлов
| Файл | Строк хардкода |
|---|---|
| `pages/parent/AIReview.tsx` | ~30 |
| `pages/parent/BehaviorSensory.tsx` | ~25 |
| `pages/specialist/ABCAnalysis.tsx` | ~25 |
| `pages/specialist/CarePatterns.tsx` | ~20 |
| `pages/tutor/*.tsx` (5 файлов) | ~30 |
| `pages/specialist/*.tsx` (7 файлов) | ~30 |
| `components/assets/AssetPicker.tsx` | ~15 |
| `components/assets/ImageUpload.tsx` | ~15 |
| `pages/parent/ParentAIChat.tsx` | ~12 |
| `pages/auth/LoginPage.tsx` | ~10 |

### Примеры (топ-30)
См. секцию 6 в выводе аудит-агента (полный список — по запросу).

---

## 6. console.* / alert / confirm / prompt

- `components/ui/ErrorBoundary.tsx:31` — `console.error('[ErrorBoundary]', error, info)` — OK, оставить.

**0 совпадений** для `alert(`, `confirm(`, `prompt(`, `console.log`, `console.warn`.

---

## 7. Сводка

| Категория | Кол-во | Severity |
|---|---|---|
| TODO/FIXME/HACK | 0 | — |
| No-op handlers `() => {}` | 0 | — |
| `alert/confirm/prompt` | 0 | — |
| `console.log/warn` (кроме ErrorBoundary) | 0 | — |
| **Следующая-версия-stub кнопки** | **6** | 🚨 P0 |
| **dev-leak в UI** | **2** (LoginPage) | 🚨 P0 |
| **Моки, выданные за реальный AI** | **3** (CalmMode / Speak / ParentAIChat) | ⚠️ P1 |
| **Хардкод i18n строк** | **~1874** | ⚠️ P2 |
| Hardcoded mock data в `data/mock*` | 5 файлов | OK (явные demo) |
| `lib/mockApi.ts` (offline mock) | 1 файл | OK (явный fallback) |
| `lib/{stt,ai}/*{.mock,.future}.ts` | 4 файла | OK (явные mock stubs) |

---

## 8. Реестр страниц-маршрутов (43 шт.)

| Роль | Кол-во | Маршруты |
|---|---|---|
| Overview / Auth / Errors | 4 | `/overview`, `/auth/login`, `/auth/verify`, `/404` |
| Parent | 12 | home, voice, ai-review, clarify, events, events/:id, care, behavior, assistant, analytics, profile, notifications |
| Child | 17 | home, cards, favorites, speak, phrase-builder, calm, now-next, choice, interface-guide, call, progress, water, food, toilet, category/:id |
| Tutor | 5 | home, voice, ai-review, report, child-profile, events/:id |
| Specialist | 7 | dashboard, events, events/:id, abc, communication-profile, care-patterns, support-plan, reports |
| Default redirect | 1 | `/` → `/overview`, `*` → 404 |

**Источник:** `app/router.tsx`. Все маршруты ведут к реальным компонентам,
0 «тупиков».

---

## 9. Что НЕ требует правок (по результатам аудита)

- Внутренняя архитектура (сторы, типы, EventPayloadMap) — production-grade.
- AppShell, BottomNav, child/parent nav — production-grade.
- Component library (`QoldauCard`, `QoldauIconCard`, `QoldauActionCard`,
  `StatusBadge`, `SectionCard`, `AIInsightCard`) — production-grade.
- i18n каркас (`react-i18next`, `useTranslation`, `ru/kk/en.json`) — есть.
- Тестовое покрытие — 156/156 ✓.
- Theme/dark mode/contrast/sensory — production-grade (D2 wave).
- Capacitor / native — production-grade.

---

## 10. Рекомендованный план (→ `MINIMAX_PRODUCTION_READINESS_PLAN.md`)

| # | Шаг | Severity | Effort |
|---|---|---|---|
| E1 | Auth honest state (LoginPage убрать dev-leak) | P0 | 1–2 ч |
| E2 | Tutor surface production (TutorHome/Voice/AIReview/Report/Profile + i18n) | P0 | 3–4 ч |
| E3 | Specialist surface production (Dashboard + 6 экранов + Reports убрать «следующая версия») | P0 | 3–4 ч |
| E4 | Honest mock layer (DemoBadge для CalmMode / Speak / ParentAIChat) | P1 | 2 ч |
| E5 | i18n final pass (AIReview/BehaviorSensory/AssetPicker/ImageUpload/ABCAnalysis/CarePatterns + tutor/specialist) | P2 | 3–4 ч |

**Суммарно:** ~12–16 ч.