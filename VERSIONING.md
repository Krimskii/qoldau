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

Текущая версия: **v0.3.9** (Navigation QA and responsive layout fix)

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
