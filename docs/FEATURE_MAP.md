# Feature Map — Qoldau AI

> Карта всех экранов и функций Demo MVP (v0.3.0) по ролям.
> Используется для проверки полноты продукта и для навигации в коде.

## Overview

| Экран | Путь | Назначение |
|-------|------|------------|
| Overview | `/overview` | Стартовая страница, описание продукта, запуск демо, выбор роли |

## Parent (11 экранов)

| Экран | Путь | Действия |
|-------|------|----------|
| ParentHome | `/parent/home` | Карточка ребёнка, состояние, последние события, AI-наблюдение, быстрые действия |
| VoiceObservation | `/parent/voice` | Mock-запись голосового наблюдения |
| AIReview | `/parent/ai-review` | Разбор transcript, предзаполненные события |
| ClarifyingQuestions | `/parent/clarify` | Уточняющие вопросы (вода, шум, туалет) |
| EventTimeline | `/parent/events` | Полная лента событий с фильтрами и AI-наблюдением |
| EventDetails | `/parent/events/:eventId` | Детали события, связанные события, AI-гипотеза |
| CareDiary | `/parent/care` | Питание / вода / туалет / сон — фильтр Event Timeline |
| BehaviorSensory | `/parent/behavior` | Сенсорика / поведение / calm_mode — фильтр Event Timeline |
| ParentAIChat | `/parent/assistant` | Q&A к данным ребёнка с пресетами |
| ParentAnalytics | `/parent/analytics` | Аналитика 7/14/30 дней |
| ParentProfile | `/parent/profile` | Ребёнок, родители, тьютор, специалист, настройки |

**Главные действия родителя:**
- Наговорить наблюдение → confirm → Event
- Добавить событие вручную через CareDiary / BehaviorSensory
- Открыть детали события и связанные
- Задать вопрос AI-помощнику
- Посмотреть аналитику
- Открыть коммуникационный профиль

## Child (9 экранов)

| Экран | Путь | Действия |
|-------|------|----------|
| ChildHome | `/child/home` | 6 крупных кнопок: Хочу пить / Туалет / Помощь / Пауза / Любимые / Сказать + Now/Next |
| ChildCards | `/child/cards` | AAC карточки по категориям |
| ChildFavorites | `/child/favorites` | Любимые мультики / музыка / занятия |
| ChildSpeak | `/child/speak` | Mock-запись голоса, AI-интерпретация |
| PhraseBuilder | `/child/phrase-builder` | Сборка фразы из карточек |
| NowNext | `/child/now-next` | Визуальное расписание «сейчас / потом» |
| CalmMode | `/child/calm` | Таймер 1 минута + спокойные карточки |
| CallMom | `/child/call` | SOS / позвать маму / тьютора |
| ChildProgress | `/child/progress` | Позитивная динамика за неделю |

**Каждое действие ребёнка создаёт Event:**
| Действие | Event type |
|----------|-----------|
| AAC карточка | `aac_card` |
| Сборка фразы | `phrase` |
| Позвать маму | `sos` |
| Запуск Calm Mode | `calm_mode` |
| Голосовой ввод | `communication` |
| Любимый мультик | `media_request` |

## Tutor (5 экранов)

| Экран | Путь | Действия |
|-------|------|----------|
| TutorHome | `/tutor/home` | Расписание, подсказки, последние наблюдения |
| TutorVoice | `/tutor/voice` | Mock-запись наблюдения тьютора |
| TutorAIReview | `/tutor/ai-review` | AI-разбор, что помогло, что подтвердить дома |
| TutorReport | `/tutor/report` | Сводка за 7 дней, copy/send через toast |
| TutorChildProfile | `/tutor/child-profile` | Сигналы, что помогает, чего избегать, предпочтения |

**Главные действия тьютора:**
- Быстро записать наблюдение голосом
- Сохранить в Event Timeline как `tutor_note`
- Сформировать отчёт родителю
- Посмотреть сигналы ребёнка

> **Roadmap**: TutorTimeline, TutorHandoff — Phase 2.

## Specialist (7 экранов)

| Экран | Путь | Действия |
|-------|------|----------|
| SpecialistDashboard | `/specialist/dashboard` | KPI, AI-summary, быстрые ссылки |
| SpecialistEvents | `/specialist/events` | Все события с фильтрами по источнику |
| ABCAnalysis | `/specialist/abc` | A (до) / B (что) / C (после) из Event Timeline |
| CommunicationProfile | `/specialist/communication-profile` | Сигналы ребёнка с confidence |
| CarePatterns | `/specialist/care-patterns` | Связи food→sensory, поведенческие паттерны |
| SupportPlan | `/specialist/support-plan` | План поддержки (не лечение) |
| Reports | `/specialist/reports` | Отчёты: недельный, месячный, индивидуальный |

**Главные действия специалиста:**
- Смотреть паттерны через ABC
- Отслеживать сигналы коммуникации
- Составлять план поддержки
- Формировать отчёты

> **Roadmap**: SpecialistNotes, ChildCaseView — Phase 2.

## Future: Organization / Center

Запланировано в Phase 2 (см. `PHASE_2_ROADMAP.md`):

- OrganizationDashboard — список детей, родителей, специалистов
- StaffManagement — управление сотрудниками
- ChildList — все дети центра
- AccessControl — кто что видит
- CenterReports — отчёты по центру
- Templates — шаблоны отчётов

Для Demo MVP показывается в Overview как «Phase 2».

## Cross-cutting

| Функция | Реализация | Где |
|---------|-----------|-----|
| Role switcher | UI в шапке | `RoleSwitcher.tsx` |
| Guided Demo Mode | 18 шагов | `useDemoStore.ts` + `DemoIndicator.tsx` |
| Toast notifications | In-app feedback | `useToastStore.ts` + `ToastContainer.tsx` |
| Event store | Единый источник данных | `useEventStore.ts` |
| Demo dataset | 60+ событий, 3 ребёнка | `demoDataset.ts` |

## Подсчёт фич

| Категория | Кол-во |
|-----------|--------|
| Экраны | 33 |
| Типы событий | 16 |
| Mock-родителей | 2 |
| Mock-тьюторов | 2 |
| Mock-специалистов | 2 |
| Demo-событий | 60+ |
| Роли | 4 |