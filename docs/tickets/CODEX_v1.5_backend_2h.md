# Ticket — Codex — v1.5 Backend (~2ч): ingest-поля + golden-set евалы + контракт

> Дизайн: [EVENT_SCHEMA_V1.5.md](../EVENT_SCHEMA_V1.5.md), STRATEGY §7.3.
> Зона: **только `apps/api/**`.** Параллельно MiniMax (зоны не пересекаются).

```
git switch release/v1.0rc-wave0-gate && git pull
git switch -c feature/v1.5-backend
```
Три задачи = три коммита (A → B → C). Ключи не коммитить; тесты — на mock.

---

## Коммит A — Ingest отдаёт новые поля события (~30 мин)
Фронт формализует `QoldauEvent` (occurredAt/recordedAt/source/abc/sensoryContext).
1. В извлечённых событиях ответа `/api/audio/ingest`:
   - прокинуть `abc` и `sensoryContext` из parse-результата в каждое `events[]`
     (сейчас они в parse — убедиться, что доходят до ответа);
   - `source: 'voice'`; `occurredAt?` если из рассказа ясно время (иначе фронт ставит recordedAt).
2. Не ломать `aiMode/sttMode/aiFallback/aiError`, обратная совместимость ответа.
3. Обновить контракт-тест: событие может содержать `abc/sensoryContext/source/occurredAt`.

---

## Коммит B — Golden-set eval harness (~60 мин) — регресс-гвард промпта
STRATEGY §7.3: «промпт меняем только с прогоном евала». Это защита от тихой деградации.
1. **`apps/api/eval/golden.ru.json`** — 15–20 реалистичных RU-фраз родителя
   (обезличенных) с эталонной разметкой:
   ```json
   [{ "transcript": "утром поел кашу, потом в магазине лёг на пол и кричал, дома успокоился",
      "expect": { "minEvents": 2, "types": ["food","behavior"], "hasAbc": true, "sensory": ["crowd"] } }]
   ```
   Покрыть типы food/toilet/behavior/communication/state, случаи с ABC и сенсорикой,
   и «пустой» контентный кейс.
2. **`apps/api/eval/runEval.ts`** + npm script `"eval": "tsx eval/runEval.ts"`:
   - прогоняет каждую фразу через parse (по умолчанию **mock**-путь; флаг `--live`
     идёт в реальный OpenAI, но по умолчанию НЕ жжёт ключи);
   - скоринг по полям: доля кейсов с ≥minEvents, совпадение types (пересечение),
     наличие abc/sensory где ожидалось; печатает таблицу-отчёт + итоговый % .
3. Тест `eval/runEval.test.ts`: harness запускается на mock и выдаёт отчёт без падения.

> Цель — не «100% точность» (mock ограничен), а **работающий harness**: дальше
> любое изменение промпта прогоняется через него.

---

## Коммит C — Контракт и устойчивость (~30 мин)
1. Усилить контракт-тест `/api/audio/ingest`: полная форма
   `{ transcript, events[]{title,description,type,source?,abc?,sensoryContext?,occurredAt?}, insight, aiMode, sttMode, aiFallback, aiError? }`.
2. Тест: содержательный transcript, но LLM вернул пустой `events[]` → трактуется как
   `aiFallback:true, aiError:'invalid_json'` (не тихий «успех»). (Ты уже делал похожее — закрепить.)
3. Тест: `insight` всегда содержит «наблюдение, не диагноз» (safety-инвариант).

---

## Проверки / commit / push / отчёт
```
cd apps/api && npm run typecheck && npm test && npm run eval   # не ронять текущие ~29, eval отрабатывает
git push -u origin feature/v1.5-backend
```
Три коммита: `feat(ingest): expose event fields`, `feat(eval): golden-set harness`, `test(contract): ingest shape + safety invariants`.
Отчёт: что изменено; вывод typecheck/test/eval (итоговый % евала на mock); подтверждение —
контракт обратно совместим, safety-инварианты покрыты, ключи не коммичены.
