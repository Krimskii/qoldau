# Acceptance Criteria — Qoldau AI v0.3.0

> Полный чек-лист для Demo MVP. Используется для релизов и ревью.

## Build Requirements

- [x] `cd apps/prototype && npm run build` проходит без ошибок
- [x] TypeScript strict mode без warnings
- [x] Нет неиспользуемых импортов
- [x] `apps/prototype/package.json` → version 0.3.0

## Data Requirements

- [x] Есть минимум 3 ребёнка: Алихан, Мира, Тимур
- [x] Есть минимум 60 событий за 7 дней (реально 75+)
- [x] Все 16 EventType покрыты
- [x] События логически связаны через linkedEventIds
- [x] 2 родителя, 2 тьютора, 2+ специалиста в demoDataset
- [x] Все события имеют status: confirmed (после seed)

## Event Timeline Requirements

- [x] Все дневники читают из useEventStore (нет независимых дневников)
- [x] CareDiary = фильтр Event[type in (food, water, toilet, sleep)]
- [x] BehaviorSensory = фильтр Event[type in (behavior, sensory, calm_mode)]
- [x] TutorReport собирается из Events
- [x] CommunicationProfile = агрегация сигналов из child profile
- [x] SpecialistDashboard = аналитика всех Events
- [x] Фильтры по типу покрывают все EventType

## Parent Flow Requirements

- [x] ParentHome показывает состояние ребёнка, последние события, AI-наблюдение
- [x] VoiceObservation → AIReview → ClarifyingQuestions → Event Timeline
- [x] Voice observation создаёт confirmed events
- [x] Уточняющие ответы сохраняются в payload
- [x] AIReview показывает transcript и parsed events
- [x] ParentAIChat работает с пресетами
- [x] ParentAnalytics строится по событиям
- [x] ParentProfile показывает ребёнка, родителей, тьютора, специалиста
- [x] ParentNotifications показывает уведомления от тьютора/ребёнка

## Child Flow Requirements

- [x] ChildCards создаёт Event[type=aac_card]
- [x] ChildSpeak создаёт Event[type=communication]
- [x] PhraseBuilder создаёт Event[type=phrase]
- [x] CalmMode создаёт Event[type=calm_mode]
- [x] CallMom создаёт Event[type=sos]
- [x] ChildFavorites создаёт Event[type=media_request]
- [x] Нет browser alert (только in-app feedback / toast)
- [x] Крупный детский интерфейс

## Tutor Flow Requirements

- [x] TutorVoice → TutorAIReview → TutorReport работает как flow
- [x] TutorAIReview создаёт Event[type=tutor_note]
- [x] TutorReport строится из Event Timeline
- [x] Copy/send кнопки дают toast/action
- [x] Формулировки нейтральные («наблюдалась нервозность», не «проблемное поведение»)

## Specialist Flow Requirements

- [x] SpecialistDashboard показывает 3 детей (через ChildSelector)
- [x] SpecialistEvents фильтруется по ребёнку, типу и источнику
- [x] ABCAnalysis строится из связанных событий
- [x] CommunicationProfile показывает сигналы, подтверждения, источники
- [x] SupportPlan называется «План поддержки» (не «план лечения»)
- [x] Reports строятся по Event Timeline

## Guided Demo Requirements

- [x] Demo-flow проходит через наполненные данные
- [x] Step EventDetails открывает существующее событие (evt-1-5)
- [x] Нет «Событие не найдено»
- [x] Demo mode seed-ит данные
- [x] Кнопка «Сброс демо» на Overview (DemoControls)

## UX / Visual Requirements

- [x] Мягкий светлый фон
- [x] Карточки с rounded corners
- [x] teal/turquoise primary
- [x] Крупный детский интерфейс (min-h-[86px], большие шрифты)
- [x] Аккуратные бейджи
- [x] Empty states для всех страниц
- [x] Skeleton loader компонент (EmptyState.tsx)
- [x] Toast notifications (info, success, warning, error)
- [x] Без «больничного» вида

## Safety Requirements

- [x] Нет «лечит», «диагностирует», «исправляет», «нормализует»
- [x] Нет «патология», «манипулирует», «неадекватное поведение»
- [x] Нет «проблемное поведение», «поведенческое нарушение»
- [x] Нет «ИИ точно понял»
- [x] Все AI-выводы содержат «Похоже…», «Возможно…»
- [x] На каждом экране disclaimer где есть AI-insight
- [x] Все suggestions начинаются с «Можно попробовать…»
- [x] Все confidence — «N подтверждений», не «X% правильности»

## Architecture Requirements

- [x] Все данные идут через QoldauEvent и useEventStore
- [x] Нет независимых дневников вне Event Timeline
- [x] Один источник mock-данных — `src/data/demoDataset.ts`
- [x] Mock STT layer (useVoiceObservationStore)
- [x] Mock AI parser (aiParser.mock.ts)
- [x] Zustand для state management
- [x] Card / Button / PageHeader / Toast — единые компоненты
- [x] ChildSelector — единый компонент для выбора ребёнка

## Documentation Requirements

- [x] docs/MVP_SCOPE.md
- [x] docs/FEATURE_MAP.md
- [x] docs/USER_JOURNEYS.md
- [x] docs/MOCK_DATA_SPEC.md
- [x] docs/EVENT_MODEL.md
- [x] docs/UX_WRITING_GUIDE.md
- [x] docs/SAFETY_WORDING.md
- [x] docs/MVP_WALKTHROUGH.md
- [x] docs/DEMO_SCRIPT.md
- [x] docs/ROUTES.md (обновлён, 34 экрана)
- [x] docs/VERSIONING.md (Current Version: v0.3.0)
- [x] CHANGELOG.md (секция [0.3.0])
- [x] README.md (обновлён)

## Что НЕ реализовано в Demo MVP (по дизайну)

- ❌ Production backend / API
- ❌ Real auth / login
- ❌ Real STT / LLM
- ❌ Real push notifications
- ❌ Real cloud storage
- ❌ Multi-tenant organizations
- ❌ Payment / billing
- ❌ Mobile app (RN/Expo)
- ❌ Wearable / GPS
- ❌ Medical records / диагностика / лечение

Всё это запланировано в `PHASE_2_ROADMAP.md` (будет создан).