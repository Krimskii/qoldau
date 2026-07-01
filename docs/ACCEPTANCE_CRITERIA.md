# Acceptance Criteria — Qoldau AI v0.1.1

## Build Requirements

- [x] `npm run build` проходит без ошибок
- [x] Нет TypeScript warnings при strict mode
- [x] Нет неиспользуемых импортов
- [x] Используется `ReturnType<typeof setInterval>` вместо `NodeJS.Timeout`

## Demo-Flow Requirements

### Parent Flow
- [x] Overview → Parent → Voice → AI-Review → Clarify → EventTimeline → EventDetails
- [x] После "Сохранить всё" события добавляются в EventStore
- [x] После "Сохранить ответы" переход на EventTimeline
- [x] Новые события отображаются сверху в EventTimeline
- [x] EventDetails открывает созданное событие без ошибки

### Child Flow
- [x] Child карточки создают события в EventStore
- [x] Используется in-app feedback вместо browser alert
- [x] События видны в EventTimeline родителя/специалиста

### Tutor Flow
- [x] Tutor voice timer работает во время записи
- [x] После "Сохранить в дневник" событие создаётся с sourceRole: tutor
- [x] Отчёт показывает реальные данные из EventStore

### Specialist Flow
- [x] CareDiary читает из EventStore (food/water/toilet)
- [x] BehaviorSensory читает из EventStore (behavior/sensory/state)
- [x] Dashboard показывает данные из EventStore

## Safety Requirements

- [x] Нет запрещённых формулировок:
  - [x] Нет "лечит аутизм"
  - [x] Нет "диагностирует"
  - [x] Нет "исправляет ребёнка"
  - [x] Нет "нормализует поведение"
  - [x] Нет "ИИ точно понял причину"
  - [x] Нет "поведенческое нарушение"
  - [x] Нет "неадекватное поведение"
  - [x] Нет "ребёнок манипулирует"

- [x] Все AI-выводы содержат осторожные формулировки:
  - [x] "Похоже..."
  - [x] "Возможно..."
  - [x] "Это наблюдение, не диагноз."
  - [x] "Нужно подтвердить."
  - [x] "Можно обсудить со специалистом."
  - [x] "Можно попробовать..."

## Architecture Requirements

- [x] Все данные идут через QoldauEvent и useEventStore
- [x] Нет независимых дневников вне Event Timeline
- [x] Mock STT layer с абстракцией для будущей замены
- [x] Mock AI parser с абстракцией для будущей замены
- [x] Архитектура готова для React Native / Expo

## Navigation Requirements

- [x] RoleSwitcher работает корректно при клике на Overview
- [x] Role переключается при выборе роли
- [x] Отображается правильная нижняя навигация для каждой роли
