# Ticket — Codex — v1.6: Event-type taxonomy (единый канон + sync-валидация)

> Зона: **только `apps/api/**`.** База: ветка от P2 (`feature/v1.6-be-p2-auth-sync`) или
> integration после merge P2. Ветка/PR: `feature/v1.6-be-event-taxonomy`. Небольшой, но реальный.
>
> **Проблема:** `Event.type` в prisma — свободная строка, sync `POST /api/sync/push` принимает
> любой `type` без валидации. Фронт использует канонический набор типов, но дизайн-аудит уже
> начал плодить выдуманные (`safety_call`, `now_next`). Без единого канона + валидации данные и
> аналитика (Event Timeline, digest) поедут. Нужен **single source of truth** + серверная защита.

## Задача
1. **Канонический набор `Event.type`** — константа-источник (напр. `src/domain/eventTypes.ts`):
   выровнять с фронтовым `eventTypeColors` (styles/tokens.ts). Ориентировочный полный набор
   (сверить с фронтом, не выдумывать лишнего):
   `food, water, toilet, sleep, behavior, sensory, communication, aac_card, voice_observation,
   phrase, media_request, sos, calm_mode, tutor_note, specialist_note, state`.
   Экспортировать тип + рантайм-массив + zod-enum.
2. **Валидация в sync `push`** (`validation/requestSchemas.ts` / sync-схема): `type` каждого
   события в батче — из канонического enum; неизвестный тип → **отклонить элемент** (в
   `conflicts`/errors ответа) или весь батч (выбрать поведение, задокументировать). Не молча
   принимать мусорные типы.
3. **Разграничить два набора (документация):** AI-парсер (`services/prompts/parseRuV2` +
   `llmService.EVENT_TYPES`) использует ПОДмножество (`food/water/sleep/toilet/sensory/behavior/
   communication/state`) — это выход парсинга транскрипта, НЕ полный набор детских действий.
   Чётко описать в `docs/EVENT_MODEL.md` / `docs/DATA_MODEL.md`: «parser-types ⊂ canonical-types»,
   какие типы создаёт фронт (действия ребёнка/родителя), какие — AI. Не ломать парсер-enum.
4. **Обратная совместимость:** существующие события в БД с любым старым type — не отклонять на
   чтении (pull), валидация только на входящий push/create. Миграция не нужна (type остаётся
   String; добавляется app-level валидация).
5. **Опционально:** helper `isCanonicalEventType(t)` + переиспользовать в events/recordings
   роутах (create/update) для единообразия.

## Проверки / отчёт
```
cd apps/api && npm run typecheck && npm test && npm run eval
npm run build && node dist/index.js   # ESM-старт (все относительные импорты с .js!)
```
Тесты: push с валидным type→applied; push с `safety_call`/мусором→reject (в conflicts/400);
существующее чтение старых типов не ломается; parser-enum не тронут; регресс AI-proxy/sync.
Отчёт: файл-источник таксономии; диффы sync-валидации; обновлённый EVENT_MODEL.md (canonical
vs parser-subset); подтверждение обратной совместимости и ESM-старта.
