# Event Model — Qoldau AI

> Главная сущность данных в продукте. Всё строится вокруг `QoldauEvent`.

## Архитектурное правило

> **Все данные = Event Timeline.**
> Любой модуль (CareDiary, BehaviorSensory, TutorReport, CommunicationProfile, SpecialistDashboard) — это фильтр, агрегация или визуализация поверх Event Timeline.
> Никаких независимых дневников, журналов или таблиц.

### ❌ Что запрещено

- Отдельный дневник питания.
- Отдельный дневник туалета.
- Отдельный журнал поведения.
- Отдельный журнал тьютора.
- Отдельные таблицы для сигналов вне Event Timeline.

### ✅ Что правильно

- CareDiary = фильтр Event[type in (food, water, toilet, sleep)].
- BehaviorSensory = фильтр Event[type in (behavior, sensory, calm_mode)].
- TutorReport = сборка из Events по sourceRole=tutor за период.
- CommunicationProfile = агрегация Events с тегами/сигналами по ребёнку.
- SpecialistDashboard = аналитика по всем Events.

---

## QoldauEvent

Определён в `src/types/qoldau.ts`:

```ts
export interface QoldauEvent {
  id: string;                           // уникальный ID
  childId: string;                      // ID ребёнка
  type: EventType;                      // один из 16 типов
  title: string;                        // короткий заголовок
  description: string;                  // полное описание
  timestamp: string;                    // ISO 8601
  sourceRole: 'parent' | 'child' | 'tutor' | 'specialist' | 'device' | 'ai';
  status: EventStatus;                  // см. ниже
  confidence?: number;                  // 0–1, только если sourceRole=ai
  rawText?: string;                     // транскрипт, если voice
  linkedEventIds?: string[];            // связанные события
  tags?: string[];                      // напр. ['шум', 'переход']
  payload?: Record<string, unknown>;    // дополнительные данные
}
```

## EventType — 16 типов

| Тип | Описание | Источник |
|-----|----------|----------|
| `voice_observation` | Голосовое наблюдение родителя | parent |
| `food` | Приём пищи | parent, tutor |
| `water` | Вода | parent, child, tutor |
| `toilet` | Туалет | parent, child, tutor |
| `sleep` | Сон / пробуждение | parent |
| `behavior` | Нервозность / отказ | parent, tutor |
| `sensory` | Сенсорная реакция | parent, tutor |
| `communication` | Звук / слово / жест ребёнка | child, parent, tutor |
| `aac_card` | AAC-карточка | child |
| `phrase` | Собранная фраза из карточек | child |
| `media_request` | Запрос мультика / музыки | child |
| `sos` | SOS / позвать маму | child |
| `calm_mode` | Запуск спокойного режима | child, parent |
| `tutor_note` | Заметка тьютора | tutor |
| `specialist_note` | Заметка специалиста | specialist |
| `state` | Состояние (спокойный, проснулся) | parent, tutor |

## EventStatus — 5 статусов

| Статус | Когда |
|--------|-------|
| `draft` | Создано AI, ещё не подтверждено (промежуточный) |
| `ai_parsed` | AI распарсил, ждёт подтверждения |
| `confirmed` | Подтверждено взрослым |
| `corrected` | Подтверждено с правками |
| `rejected` | Отклонено |

В Demo MVP большинство событий имеют `status: confirmed`, потому что они mock.

> **Важно:** В Demo MVP ни одно событие не создаётся со статусом `ai_parsed` без последующего подтверждения. После ClarifyingQuestions все voice events становятся `confirmed`.

## Источники (sourceRole)

| sourceRole | Когда создаёт Event |
|------------|---------------------|
| `parent` | Голосовое наблюдение, еда, туалет, сон, подтверждение |
| `child` | AAC, фраза, SOS, мультик, голос, calm_mode |
| `tutor` | Заметки тьютора, наблюдения на занятии |
| `specialist` | Заметки специалиста, паттерны |
| `device` | Зарезервировано для wearable/IoT (Phase 2) |
| `ai` | AI не создаёт события, только структурирует → не используется |

## Связи (linkedEventIds)

`linkedEventIds` связывают события в цепочки. Примеры:

```
voice_observation(evt-1-5) → food(evt-1-6) + behavior(evt-1-7) + toilet(evt-1-9)
sensory(evt-1-13) → calm_mode(evt-1-14)
aac_card(evt-1-10) → communication(evt-1-11)
```

Связи строятся:

1. **При AI-парсинге** (родитель наговорил → родительский flow → ClarifyingQuestions).
2. **При реальных действиях** (AAC карточка → коммуникация → вода).

В Demo MVP mock-связи заложены вручную в `demoDataset.ts`.

## payload

`payload` — свободный `Record<string, unknown>` для специфичных данных.

Примеры:

```ts
// Voice observation от родителя
{
  clarifyingAnswers: { 'water-amount': 'Нормально', 'toilet-better': 'Да' },
  aiInsight: 'Похоже, нервозность связана с сенсорикой',
  source: 'voice_observation',
}

// AAC карточка от ребёнка
{
  cardLabel: 'Вода',
  cardCategory: 'thirst',
}

// Calm mode
{
  startedAt: '2026-07-01T14:20:00',
  finishedAt: '2026-07-01T14:25:00',
  duration: 300,
  feltCalmer: true,
}
```

## Правила для разработчиков

### ✅ DO

- Создавать Event при любом значимом действии.
- Использовать `linkedEventIds` для связи связанных событий.
- Добавлять `confidence` только если событие создано AI.
- Использовать `status: confirmed` если взрослый подтвердил.

### ❌ DON'T

- Не создавать параллельные структуры данных (state outside EventStore).
- Не хранить события в локальном state страницы — всегда в `useEventStore`.
- Не использовать `status: ai_parsed` без последующего подтверждения.
- Не создавать события со статусом `confirmed` без явного действия взрослого.

## Технические детали

### Хранение

```ts
// Zustand store
const useEventStore = create((set, get) => ({
  events: DEMO_EVENTS,  // инициализируется при первом запуске
  addEvent: (data) => { ... },
  addEvents: (dataArray) => { ... },
  updateEvent: (id, updates) => { ... },
  deleteEvent: (id) => { ... },
}));
```

### Чтение из любого компонента

```ts
import { useEventStore } from '@/store/useEventStore';

const { events, addEvent, addEvents } = useEventStore();

// Фильтрация
const childFood = events.filter(e => 
  e.childId === 'child-alikhan' && e.type === 'food'
);
```

### Создание нового события

```ts
addEvent({
  childId: 'child-alikhan',
  type: 'aac_card',
  title: 'Вода',
  description: 'Ребёнок нажал AAC карточку «Хочу пить»',
  timestamp: new Date().toISOString(),
  sourceRole: 'child',
  status: 'confirmed',
  payload: { cardLabel: 'Вода' },
});
```

## Эволюция модели

### Phase 2 (Pilot Alpha)

- Добавить поля `createdBy`, `updatedBy`, `tenantId`.
- Real STT → реальный `rawText` с временной разметкой.
- Soft-delete через `deletedAt`.

### Phase 3 (Production)

- Event-sourcing pattern.
- Связь с внешними системами (wearable, smart home).
- Полная история изменений через `event_log`.

---

## Связь с другими документами

- `MVP_SCOPE.md` — что входит в Demo MVP.
- `DATA_MODEL.md` — все типы данных продукта.
- `MOCK_DATA_SPEC.md` — конкретные значения в Demo MVP.
- `TECH_DECISIONS.md` — почему Zustand и эта модель.