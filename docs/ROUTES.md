# ROUTES — Qoldau AI

> Полный список маршрутов Demo MVP (v0.3.0). 34 экрана.

## Overview

| Path | Component | Описание |
|------|-----------|----------|
| `/` | (redirect) | → `/overview` |
| `/overview` | Overview | Стартовая страница, описание продукта, запуск демо, выбор роли, сброс демо |

## Parent (12 страниц)

| Path | Component | Описание |
|------|-----------|----------|
| `/parent/home` | ParentHome | Главная: карточка ребёнка, состояние, последние события, AI-наблюдение |
| `/parent/voice` | VoiceObservation | Mock-запись голосового наблюдения |
| `/parent/ai-review` | AIReview | AI-разбор transcript и parsed events |
| `/parent/clarify` | ClarifyingQuestions | Уточняющие вопросы (вода, шум, туалет) |
| `/parent/events` | EventTimeline | Полная лента событий с фильтрами |
| `/parent/events/:eventId` | EventDetails | Детали события, связанные, AI-гипотеза |
| `/parent/care` | CareDiary | Фильтр: еда / вода / туалет / сон |
| `/parent/behavior` | BehaviorSensory | Фильтр: сенсорика / поведение / calm_mode |
| `/parent/assistant` | ParentAIChat | AI-помощник с пресетами |
| `/parent/analytics` | ParentAnalytics | Аналитика 7/14/30 дней |
| `/parent/profile` | ParentProfile | Ребёнок, родители, тьютор, специалист, настройки |
| `/parent/notifications` | ParentNotifications | Уведомления от ребёнка / тьютора / специалиста |

## Child (9 страниц)

| Path | Component | Описание |
|------|-----------|----------|
| `/child/home` | ChildHome | 6 крупных кнопок + Now/Next |
| `/child/cards` | ChildCards | AAC карточки по категориям → Event[aac_card] |
| `/child/favorites` | ChildFavorites | Любимые мультики → Event[media_request] |
| `/child/speak` | ChildSpeak | Mock-запись голоса → Event[communication] |
| `/child/phrase-builder` | PhraseBuilderPage | Сборка фразы → Event[phrase] |
| `/child/calm` | CalmMode | Таймер + спокойные карточки → Event[calm_mode] |
| `/child/now-next` | NowNext | Визуальное расписание «сейчас / потом» |
| `/child/call` | ChildCall | SOS / позвать маму / тьютора → Event[sos] |
| `/child/progress` | ChildProgress | Позитивная динамика за неделю |

## Tutor (5 страниц)

| Path | Component | Описание |
|------|-----------|----------|
| `/tutor/home` | TutorHome | Расписание, подсказки, последние наблюдения |
| `/tutor/voice` | TutorVoice | Mock-запись наблюдения тьютора |
| `/tutor/ai-review` | TutorAIReview | AI-разбор, что помогло → Event[tutor_note] |
| `/tutor/report` | TutorReport | Сводка за 7 дней, copy/send через toast |
| `/tutor/child-profile` | TutorChildProfile | Сигналы, что помогает, чего избегать |

## Specialist (7 страниц)

| Path | Component | Описание |
|------|-----------|----------|
| `/specialist/dashboard` | SpecialistDashboard | KPI 3 детей, AI-summary, быстрые ссылки |
| `/specialist/events` | SpecialistEvents | Все события с фильтрами по источнику |
| `/specialist/abc` | ABCAnalysis | A (до) / B (что) / C (после) из Event Timeline |
| `/specialist/communication-profile` | CommunicationProfile | Сигналы ребёнка с confidence |
| `/specialist/care-patterns` | CarePatterns | Связи food→sensory, поведенческие паттерны |
| `/specialist/support-plan` | SupportPlan | План поддержки (не лечение) |
| `/specialist/reports` | Reports | Отчёты: недельный, месячный, индивидуальный |

## Navigation Flow

```
Overview
├── Parent
│   ├── home → voice → ai-review → clarify → events → events/:id
│   ├── home → care
│   ├── home → behavior
│   ├── home → analytics
│   ├── home → profile
│   ├── home → notifications
│   └── home → assistant
├── Child
│   ├── home → cards
│   ├── home → favorites
│   ├── home → speak
│   ├── home → phrase-builder
│   ├── home → calm
│   ├── home → call
│   ├── home → now-next
│   └── home → progress
├── Tutor
│   ├── home → voice → ai-review → report
│   └── home → child-profile
└── Specialist
    ├── dashboard → events
    ├── dashboard → abc
    ├── dashboard → communication-profile
    ├── dashboard → care-patterns
    ├── dashboard → support-plan
    └── dashboard → reports
```

## Общие компоненты (вне роутинга)

| Компонент | Где появляется |
|-----------|---------------|
| `<DemoIndicator />` | поверх всех страниц во время Guided Demo |
| `<ToastContainer />` | глобально, поверх всех страниц |
| `<RoleSwitcher />` | в шапке страниц, кроме fullscreen (voice, ai-review) |
| `<BottomNav />` | в `AppShell` для большинства страниц |
| `<ChildSelector />` | на specialist-страницах для переключения между детьми |
| `<DemoControls />` | на Overview (сброс демо-данных) |

## Всего

- **34 экрана** (1 overview + 12 parent + 9 child + 5 tutor + 7 specialist)
- **16 типов событий** через Event Timeline
- **3 ребёнка** для специалиста
- **2 родителя, 2 тьютора, 2 специалиста**

## Связь с другими документами

- `FEATURE_MAP.md` — описание каждого экрана.
- `EVENT_MODEL.md` — какие события создаются на каких страницах.
- `USER_JOURNEYS.md` — сценарии пользователей по этим роутам.