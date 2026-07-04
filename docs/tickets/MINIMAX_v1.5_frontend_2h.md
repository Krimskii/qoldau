# Ticket — MiniMax — v1.5 Frontend (~2ч): схема + EventStorage + недельные паттерны

> Дизайн: [EVENT_SCHEMA_V1.5.md](../EVENT_SCHEMA_V1.5.md). STRATEGY §6.2–6.3, §4.1.
> Зона: **только `apps/prototype/**`.** НЕ трогать apps/api, docs.
> ⚠️ v1.5 идёт ОТДЕЛЬНО от пилота. Пилот-release заморожен.

```
git switch release/v1.0rc-wave0-gate && git pull
git switch -c feature/v1.5-frontend
```
Три задачи = три коммита (A → B → C). После каждого: typecheck+test+build зелёные.

---

## Коммит A — Формализация QoldauEvent (аддитивно, ~40 мин)
1. **`src/types/qoldau.ts`** — расширить `QoldauEvent` (НИЧЕГО не удалять):
   ```ts
   export type EventSource = 'manual' | 'voice' | 'child_ui' | 'import';
   export interface EventAbc { antecedent?: string; behavior?: string; consequence?: string; }
   // + в QoldauEvent:
   schemaVersion: number;          // = 1
   occurredAt: string;             // ISO — когда произошло
   recordedAt: string;             // ISO — когда записано
   source: EventSource;
   abc?: EventAbc;
   sensoryContext?: string[];
   ai?: { model?: string; promptVersion?: string; aiFallback?: boolean; aiError?: string };
   deleted?: boolean;
   /** @deprecated — оставить обязательным пока (60 читателей) */
   timestamp: string;
   ```
2. **persist-миграция `useEventStore`**: `version: 3` + `migrate(persisted, from)`:
   старым событиям проставить `schemaVersion:1`, `occurredAt=recordedAt=timestamp`,
   `source = sourceRoleToSource(sourceRole)` (`child→child_ui`, `ai→voice`, иначе `manual`).
   Проверить: старые localStorage-данные НЕ теряются, не дублируются.
3. **`src/lib/events/eventFactory.ts`**: все `create*Event` проставляют
   `schemaVersion:1`, `occurredAt` (момент события), `recordedAt` (now), `source`.
   `timestamp` продолжать заполнять (= occurredAt).
4. **Голосовой путь** (`VoiceObservation`/`addEvents`): проставлять occurredAt/recordedAt/
   source='voice'; если backend прислал `abc`/`sensoryContext` — прокинуть в событие.
5. Тесты: миграция v2→v3; фабрики проставляют новые поля.

---

## Коммит B — Интерфейс EventStorage (~40 мин)
Готовим замену localStorage→SQLite (v2.0) без правки страниц.
1. **`src/lib/storage/eventStorage.ts`**:
   ```ts
   export interface EventQuery { childId?: string; types?: EventType[]; since?: string; until?: string; }
   export interface EventStorage {
     getAll(): QoldauEvent[];
     query(q: EventQuery): QoldauEvent[];   // фильтр по occurredAt-диапазону
     put(e: QoldauEvent): void;
     putMany(e: QoldauEvent[]): void;
     update(id: string, patch: Partial<QoldauEvent>): void;
     remove(id: string): void;              // soft-delete: deleted:true
     clear(): void;
     export(): QoldauEvent[];
   }
   export const eventStorage: EventStorage; // реализация поверх useEventStore
   ```
   `query` фильтрует по childId/types и `occurredAt >= since && <= until`, исключает `deleted`.
2. Перевести **читающие** экраны на `eventStorage.query` вместо ручного `events.filter`:
   `ParentAnalytics.tsx`, `EventTimeline.tsx`, `specialist/Reports.tsx`. Поведение
   идентичное (только источник запроса меняется).
3. Тесты: query по childId/types/since/until; soft-delete скрывает событие.

---

## Коммит C — Недельные паттерны (движок инсайтов v0, ~40 мин)
Наука: scatterplot (Touchette 1985), STRATEGY §4.1 — на устройстве, без сети.
1. **`src/lib/insights/weeklyPatterns.ts`** — чистые функции из событий:
   - `dayHourHeatmap(events, childId, weekStart): number[][]` — сетка 7×24, счётчик
     событий поведения/сенсорики по дню недели × часу (по `occurredAt`);
   - `topEventTypes(events, since): {type, count}[]`;
   - `simpleStreaks(events)` — серии дней подряд с записями.
2. **UI-секция**: в `ParentAnalytics.tsx` добавить карточку «Тепловая карта недели»
   — рендер `dayHourHeatmap` (клетки интенсивностью цвета). Честный empty-state
   «Пока мало наблюдений — добавьте голосом». Формулировки: «Похоже, чаще
   вечером» без диагнозов (SAFETY_WORDING).
3. Тесты для функций паттернов (бакеты по дню×часу, топ-типы).

---

## Проверки / commit / push / отчёт
```
cd apps/prototype && npm run typecheck && npm test && npm run build   # всё зелёное, тесты не ронять
git push -u origin feature/v1.5-frontend
```
Три коммита: `feat(schema): ...`, `feat(storage): EventStorage ...`, `feat(insights): weekly heatmap ...`.
Отчёт: по коммиту — файлы/что сделано; вывод проверок; подтверждение (старые данные
мигрируют, экраны читают через EventStorage, тепловая карта из реальных событий).
