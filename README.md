# Qoldau AI

Voice-first AI-платформа сопровождения детей с РАС, родителей, тьюторов и специалистов.

**Текущая версия: v0.3.18** (Full Demo MVP + click-through QA pass)

> **Что нового в v0.3.18:** [полный QA pass](docs/QA_CLICKTHROUGH_REPORT.md) — исправлено 7 broken handlers, добавлены 2 alias routes для cross-role nav, [архитектурный обзор](docs/CURRENT_ARCHITECTURE.md). Предыдущие релизы — [CHANGELOG.md](CHANGELOG.md).

---

## Быстрый старт

```bash
cd apps/prototype
npm install
npm run dev
```

Откроется на http://localhost:5173

## Сборка

```bash
npm run build      # tsc -b && vite build → dist/
npm run preview    # preview production build
```

`npm run build` ✅ clean: 1671 modules transformed, ~470 KB JS (gzip ~128 KB), ~51 KB CSS.

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

## Что mock

| Слой | Mock-имплементация |
| ---- | ------------------ |
| Распознавание речи | `transcribeMock()` возвращает DEMO_TRANSCRIPT через 1.5с |
| AI-парсинг | `aiParser.mock.ts` — keyword-matching по русским словам |
| Event storage | localStorage через Zustand-persist |
| Custom images | base64 в localStorage (max ~5MB) |
| SOS / Call Mom | `addEvent()` + success popup |
| Push | Toast-уведомления |

**Не реализовано в MVP (Phase 2+):**
- ❌ Real STT (Whisper / Web Speech)
- ❌ Real LLM (OpenAI / Claude)
- ❌ Backend / БД / Cloud sync
- ❌ Auth / login
- ❌ Push notifications / email / SMS
- ❌ Payment / subscription

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
├── apps/prototype/                # Единственное приложение (SPA)
│   ├── src/
│   │   ├── app/                   # Entry: App.tsx, router.tsx (38 routes)
│   │   ├── components/            # UI / layout / assets / child / icons
│   │   ├── pages/                 # overview/ + parent/ + child/ + tutor/ + specialist/
│   │   ├── store/                 # Zustand stores (10 stores)
│   │   ├── data/                  # Demo dataset
│   │   ├── lib/                   # ai/ + stt/ + events/ + game/
│   │   ├── styles/                # tokens.ts, globals.css, animations.css
│   │   └── types/                 # qoldau.ts, assets.ts
│   ├── public/assets/icons/       # Soft 3D PNG (24 actions + 4 events + 2 mascots)
│   └── package.json
├── docs/                          # 26 markdown-файлов
├── README.md
└── CHANGELOG.md
```

Подробнее: [docs/CURRENT_ARCHITECTURE.md](docs/CURRENT_ARCHITECTURE.md).

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