# Changelog

All notable changes to this project will be documented in this file.

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