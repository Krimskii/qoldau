# Versioning Strategy

Qoldau AI использует **SemVer** (Semantic Versioning).

## Version Format

```
v{major}.{minor}.{patch}
```

Пример: `v1.0.0`

## Version Lifecycle

### v0.x.x — Prototype/MVP
- Быстрые итерации
- API может меняться
- Публичный релиз для тестирования

### v1.0.0 — Production Ready
- Стабильный API
- Breaking changes с мажорным обновлением

## Branching Model

```
main          — стабильные релизы
├── develop   — активная разработка
├── v0.x.x    — версионные теги
└── feature/* — фичи
```

## Release Notes

Каждый релиз документируется в:
- CHANGELOG.md
- GitHub Releases
- Теги: `git tag -a v1.0.0 -m "Release v1.0.0"`

## Changelog Format

```markdown
## [1.0.0] — 2026-07-01

### Added
- Initial MVP features

### Changed
- Improvements

### Fixed
- Bug fixes
```

## Current Version

Текущая версия: **v0.3.12** (Visual refresh — design system consolidation)

### v0.3.12 — Visual refresh: design system consolidation

Phase A — foundation:
- `src/styles/tokens.ts` — palette, roleColors, eventTypeColors (tone/emoji/label + helpers), eventStatusColors, radii, spacing, shadow, motion, typography, layout.
- `src/components/icons/brand.tsx` — QoldauLogoMark, QoldauLogoLockup, VoiceWaveIcon, EventTimelineIcon, AACCardIcon, CalmModeIcon.
- `src/components/icons/index.ts` — unified entry: brand + flat + lucide-react (re-export). `flat.tsx` renamed from `index.tsx`.
- `src/components/ui/AppIcon.tsx` — wrapper для SVG/lucide (colorClass/color/strokeWidth/ariaLabel/filled).
- `src/components/ui/QoldauCard.tsx` — unified card: default / soft / elevated / tinted-{teal,blue,purple,yellow,coral,green,warm} / outline. Padding none/sm/md/lg. hoverable + liftOnHover.
- `src/components/ui/Primitives.tsx` — PrimaryAction, RoleBadge, EventTypeBadge, EventStatusBadge, MobileFrame.

Phase B1 — Parent Event Timeline + Event Details:
- EventTimeline: фильтры-чипсы с counts, day-grouped `<section>`, hero с EventTimelineIcon + AI observation в tinted-teal.
- EventDetails: hero с tone-tinted icon container, AI hypothesis в tinted-yellow + «не диагноз», suggestions в tinted-warm + disclaimer.

Phase B2 — Parent voice flow:
- VoiceObservation — state machine UI через useVoiceObservationStore (idle → recording → stopped → transcript_ready → editing → processing → review). Большая кнопка-микрофон с qoldau-soft-pulse, demo-текст + manual input, transcript card с inline edit.
- AIReview — transcript наверху, parsed events с EventTypeBadge + confidence + tone-tinted icon, AI insight в tinted-yellow + disclaimer «не диагноз», PrimaryAction + ghost fallback.
- ClarifyingQuestions — динамические вопросы из parsedObservation, fallback на 3 default вопроса, chip-ответы, createEventsFromAIReview с answers payload.

Phase B3 — Child UI polish:
- CalmMode — 6 calm options через QoldauIconCard (purple/blue/green/yellow/teal/coral), timer card через QoldauCard elevated, PrimaryAction для start, "Вернуться на главную" с interrupted payload.
- PhraseBuilderPage — phrase card через QoldauCard tinted-blue, send button через PrimaryAction, success overlay через QoldauCard elevated, lucide icons вместо unicode glyphs.
- ChildProgress — celebratory hero через QoldauCard tinted-yellow, top cards через QoldauCard default, footer через QoldauCard tinted-green.
- ChildFavorites — edit banner через QoldauCard tinted-yellow, success toast через QoldauCard tinted-teal.
- ChildSpeak — heard card через QoldauCard tinted-teal, examples через QoldauCard tinted-blue, role/aria-live wrapper.

Build: `npm run build` passes (1665 modules, 0 errors).

### v0.3.11 — QA hotfix
- **Asset rehydrate bug fixed** — custom assets теперь сохраняются после reload.
- **Tutor BottomNav** — Голос вместо AI.
- **CallMom SOS vs message** — «Написать сообщение» теперь создаёт `communication` event, не `sos`.
- **CallMom contacts** — через IconRenderer, payload с assetId.
- **ChildFavorites → Asset System** — карточки из cardConfigs, IconRenderer, payload с assetId.

### v0.3.10 — Asset system

### v0.3.10 — Asset system
- `src/types/assets.ts` — QoldauAsset + AACCardConfig.
- `src/data/assetRegistry.ts` — ~40 built-in ассетов по 8 категориям.
- `src/components/assets/IconRenderer.tsx` — единый рендер ассета.
- `src/components/assets/ImageUpload.tsx` — локальная загрузка (2 MB, privacy disclaimer).
- `src/components/assets/AssetPicker.tsx` — выбор с табами + поиском + upload.
- `src/store/useAssetStore.ts` — persist custom + cardConfigs.
- `src/pages/child/ChildCards.tsx` — через asset system.
- `docs/ASSET_SYSTEM.md` — полная документация.

### v0.3.9 — Navigation QA
- `src/config/navigation.ts` — единый реестр routes + helpers.
- `src/components/navigation/BackButton.tsx` — безопасная кнопка «Назад» с fallback.
- `src/components/layout/PageScaffold.tsx` — переиспользуемая обёртка экрана.
- `PageHeader` использует `BackButton`.
- `BottomNav`: убран дубль `tutor/ai-review`.
- Документы: `NAVIGATION_MAP.md`, `NAVIGATION_QA_CHECKLIST.md`.

### v0.3.9 — Navigation QA
- `src/config/navigation.ts` — единый реестр routes + helpers.
- `src/components/navigation/BackButton.tsx` — безопасная кнопка «Назад» с fallback.
- `src/components/layout/PageScaffold.tsx` — переиспользуемая обёртка экрана.
- `PageHeader` использует `BackButton` (раньше был голый `navigate(-1)`, мог быть тупик).
- `BottomNav`: убран дубль `tutor/ai-review`.
- Документы: `NAVIGATION_MAP.md`, `NAVIGATION_QA_CHECKLIST.md`.

### v0.3.8 — Icon system + soft gamification

### v0.3.8 — Icon system + soft gamification
- `src/components/icons/` — 25 flat SVG-иконок (outline-only, currentColor, 32×32).
- `QoldauIconCard` + `QoldauActionCard` — универсальные карточки для child UI.
- `game/` — `AchievementCard`, `ProgressBadge`, `DailyProgressStrip` (мягкая геймификация).
- `lib/game/achievementRules.ts` — 6 правил достижений из Event Timeline.
- `styles/animations.css` — sensory-safe анимации + `prefers-reduced-motion`.
- Обновлены ChildHome (CTA «Позвать маму»), ChildCards, CalmMode, PhraseBuilder, ChildSpeak, CallMom, ChildProgress.
- Документы: `ICON_SYSTEM.md`, `GAMIFICATION_PRINCIPLES.md`, обновлены SENSORY_SAFE/DESIGN/CHILD_INTERFACE.

### v0.3.8 — Sensory-safe SVG visual polish
- CloudMascot / DinoMascot / SuccessSparkle в `src/components/illustrations/`
- Sensory-safe анимации в `src/styles/globals.css` + `prefers-reduced-motion`
- Обновлены ChildHome, CalmMode, PhraseBuilderPage, ChildCards, ChildProgress, EmptyState
- `docs/SENSORY_SAFE_DESIGN_GUIDE.md` — новый документ

### v0.3.4 — Visual Design Alignment
- Полный design system, designTokens, tailwind темизация
- Все Parent / Child / Tutor / Specialist страницы переписаны под референс
- AppShell + BottomNav + PageHeader + AIInsightCard + Card/Button/Badge variants

### v0.3.0 — Full Demo MVP
- Demo dataset (3 детей, 60+ событий), все страницы наполнены реальными данными
- Toast notifications (без `alert`), useDemoStore (18 шагов)
- Mock STT + mock AI parser
- Event Timeline data model

### v0.1.0 — MVP Prototype
- Voice-first родительский интерфейс
- Детский интерфейс (AAC)
- Тьюторский интерфейс
- Специалистский интерфейс
- Overview страница
- Mock STT layer
- Mock AI parser
- Event Timeline data model
