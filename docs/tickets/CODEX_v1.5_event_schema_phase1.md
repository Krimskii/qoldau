# Ticket — Codex — v1.5 Фаза 1: ingest-ответ отдаёт новые поля события

> Дизайн: [EVENT_SCHEMA_V1.5.md](../EVENT_SCHEMA_V1.5.md). Зона: **только `apps/api/**`.**
> Параллельно MiniMax (зоны не пересекаются). База: `release/v1.0rc-wave0-gate`.

```
git switch release/v1.0rc-wave0-gate && git pull
git switch -c feature/v1.5-ingest-fields
```

## Контекст
Фронт формализует `QoldauEvent` (occurredAt/recordedAt/source/abc/sensoryContext).
`abc` и `sensoryContext` ты уже добавил в v1.0.x. Осталось, чтобы ingest-ответ
`/api/audio/ingest` отдавал их в каждом извлечённом событии + временные метки,
чтобы фронт мапил напрямую.

## Задачи
1. В извлечённых событиях ingest-ответа добавить (если модель дала):
   - `occurredAt?` (если из рассказа ясно время; иначе фронт проставит recordedAt),
   - `abc?`, `sensoryContext?` — прокинуть из parse-результата в событие ответа
     (сейчас они в parse, убедиться что доходят до `events[]`).
   - `source: 'voice'` для голосовых событий.
2. Контракт-тест `/api/audio/ingest` расширить: событие может содержать
   `abc`, `sensoryContext`, `source`; форма ответа обратно совместима
   (старые поля не удалять).
3. Не ломать `aiFallback`/`aiError`/`aiMode`/`sttMode`.

## Проверки / commit / отчёт
```
cd apps/api && npm run typecheck && npm test    # не ронять текущие 29, новые зелёные
git commit -m "feat(ingest): expose source/abc/sensoryContext on parsed events + contract test"
git push -u origin feature/v1.5-ingest-fields
```
Отчёт: что изменено, вывод проверок, подтверждение — контракт ingest обратно совместим.
