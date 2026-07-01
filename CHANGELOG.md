# Changelog

All notable changes to this project will be documented in this file.

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