# Changelog

All notable changes to this project will be documented in this file.

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