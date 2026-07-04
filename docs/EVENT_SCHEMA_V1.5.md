# QOLDAU AI — Формализация схемы события (v1.5)

> Первая задача Части B (STRATEGY §6.2–6.3). Архитектурный дизайн — Claude.
> **Цель:** дисциплинировать `QoldauEvent` так, чтобы паттерн-движок (v1.5),
> SQLite (v2.0) и синк (v2.x) строились без боли. Делаем **аддитивно и
> фазами** — не ломаем ~60 мест и не дестабилизируем пилот.

## Принцип безопасности
Пилотный APK (`release/v1.0rc-wave0-gate`) **заморожен и стабилен** — уходит
семьям. Работа v1.5 идёт на отдельной линии `integration/v1.5`, а не на release.
Мержим вперёд только после того, как пилот подтвердит стабильность.

## Целевая схема (аддитивно к текущей)
```ts
export type EventSource = 'manual' | 'voice' | 'child_ui' | 'import';
export interface EventAbc { antecedent?: string; behavior?: string; consequence?: string; }

export interface QoldauEvent {
  id: string;
  schemaVersion: number;          // NEW · сейчас = 1; bump при смене формы
  childId: string;
  type: EventType;
  title: string;
  description: string;
  occurredAt: string;             // NEW · когда произошло (ISO) — для паттернов
  recordedAt: string;             // NEW · когда записано (ISO)
  source: EventSource;            // NEW · как попало (manual/voice/child_ui/import)
  sourceRole: 'parent'|'child'|'tutor'|'specialist'|'device'|'ai';  // КЕМ — оставляем
  status: EventStatus;
  confidence?: number;
  rawText?: string;
  abc?: EventAbc;                 // NEW · выравниваем с backend (Codex уже добавил)
  sensoryContext?: string[];     // NEW · выравниваем с backend
  linkedEventIds?: string[];
  tags?: string[];
  ai?: { model?: string; promptVersion?: string; aiFallback?: boolean; aiError?: string };  // NEW
  deleted?: boolean;             // NEW · soft-delete для будущего синка (v2.x)
  payload?: EventPayload;        // Фаза 3: типизированный union per type
  /** @deprecated — во время миграции; читатели переходят на occurredAt/recordedAt */
  timestamp?: string;
}
```

## Миграция persist (v2 → v3, без потери данных)
```ts
// в useEventStore persist config
version: 3,
migrate: (persisted: any, from: number) => {
  if (from < 3 && persisted?.events) {
    persisted.events = persisted.events.map((e: any) => ({
      ...e,
      schemaVersion: 1,
      occurredAt: e.occurredAt ?? e.timestamp,
      recordedAt: e.recordedAt ?? e.timestamp,
      source: e.source ?? sourceRoleToSource(e.sourceRole),
    }));
  }
  return persisted;
},
```
`sourceRoleToSource`: `child→child_ui`, `ai→voice`, иначе `manual`.

## Интерфейс EventStorage (готовим замену localStorage→SQLite без правки страниц)
```ts
// src/lib/storage/eventStorage.ts
export interface EventQuery { childId?: string; types?: EventType[]; since?: string; until?: string; }
export interface EventStorage {
  getAll(): QoldauEvent[];
  query(q: EventQuery): QoldauEvent[];   // occurredAt-диапазоны для паттернов
  put(e: QoldauEvent): void;
  putMany(e: QoldauEvent[]): void;
  update(id: string, patch: Partial<QoldauEvent>): void;
  remove(id: string): void;              // soft-delete (deleted:true)
  clear(): void;
  export(): QoldauEvent[];               // бэкап/портируемость
}
```
v1.5 реализация оборачивает текущий Zustand+localStorage. v2.0 подменяет на
`@capacitor-community/sqlite` за тем же интерфейсом — страницы не меняются.

## Фазы (порядок, каждая — отдельно проверяема)
| Фаза | Что | Риск | Кто |
|---|---|---|---|
| 1 · v1.5.0 | Аддитивные поля + persist migrate v2→v3 + eventFactory проставляет occurredAt/recordedAt/source; `timestamp` пока жив как alias | низкий | MiniMax |
| — | Backend ingest-ответ отдаёт occurredAt/recordedAt/source/abc/sensoryContext (abc/sensory уже есть) | низкий | Codex |
| 2 · v1.5.1 | `EventStorage` интерфейс; сторы/страницы читают через него (без смены поведения) | средний | MiniMax |
| 3 · v1.5.x | Типизированный `EventPayload` (discriminated union per type); удалить `timestamp` alias | высокий (churn) | MiniMax |
| — | Паттерн-движок читает `occurredAt` через `EventStorage.query` (scatterplot, триггеры) | — | MiniMax |

## Definition of Done — Фаза 1
- `QoldauEvent` расширен аддитивно; старые события мигрируют (occurredAt=recordedAt=timestamp).
- Голосовой пайплайн и детские фабрики проставляют occurredAt/recordedAt/source.
- Backend отдаёт новые поля в ingest-ответе; контракт-тест обновлён.
- `typecheck && test && build` зелёные в обоих приложениях; персист старых данных не рушится.
- Всё на `integration/v1.5`, **не на пилотном release**.

---
*Связано: [STRATEGY.md](STRATEGY.md) §6.2–6.3, [WORKPLAN.md](WORKPLAN.md) Часть B, [DELIVERY_PLAN.md](DELIVERY_PLAN.md).*
