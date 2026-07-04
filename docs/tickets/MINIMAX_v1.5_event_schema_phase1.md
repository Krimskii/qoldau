# Ticket — MiniMax — v1.5 Фаза 1: формализация QoldauEvent (аддитивно)

> Дизайн: [EVENT_SCHEMA_V1.5.md](../EVENT_SCHEMA_V1.5.md). Зона: **только `apps/prototype/**`.**
> ⚠️ НЕ на пилотном release. База: `release/v1.0rc-wave0-gate`, ветка ниже.

```
git switch release/v1.0rc-wave0-gate && git pull
git switch -c feature/v1.5-event-schema
```

## Задачи (аддитивно, ничего не ломать)
1. **`src/types/qoldau.ts`** — расширить `QoldauEvent`:
   - добавить `schemaVersion: number`, `occurredAt: string`, `recordedAt: string`,
     `source: EventSource` (`'manual'|'voice'|'child_ui'|'import'`),
     `abc?: EventAbc` (`{antecedent?,behavior?,consequence?}`), `sensoryContext?: string[]`,
     `ai?: { model?; promptVersion?; aiFallback?; aiError? }`, `deleted?: boolean`;
   - `timestamp` пометить `@deprecated`, но **оставить обязательным пока** (60 читателей).
2. **persist-миграция в `useEventStore`**: `version: 3` + `migrate(persisted, from)`:
   старым событиям проставить `schemaVersion:1`, `occurredAt = recordedAt = timestamp`,
   `source = sourceRoleToSource(sourceRole)` (`child→child_ui`, `ai→voice`, иначе `manual`).
   Проверить: существующие localStorage-данные НЕ теряются.
3. **`src/lib/events/eventFactory.ts`**: все `create*Event` проставляют
   `occurredAt` (= момент события), `recordedAt` (= now), `source`, `schemaVersion:1`.
   `timestamp` продолжать заполнять (= occurredAt) для обратной совместимости.
4. **Голосовой путь** (`VoiceObservation`/`addEvents`): проставлять occurredAt/recordedAt/source;
   если backend прислал `abc`/`sensoryContext` — прокидывать в событие.
5. **Тесты**: миграция v2→v3 (старое событие получает occurredAt/recordedAt/source);
   фабрики проставляют новые поля.

## НЕ делать в этой фазе
- Не типизировать `payload` (Фаза 3). Не убирать `timestamp`. Не трогать страницы-читатели.

## Проверки / commit / отчёт
```
cd apps/prototype && npm run typecheck && npm test && npm run build   # всё зелёное
git commit -m "feat(schema): additive QoldauEvent v1.5 fields + persist migrate v2->v3"
git push -u origin feature/v1.5-event-schema
```
Отчёт: файлы, вывод проверок, подтверждение — старые данные мигрируют без потерь.
