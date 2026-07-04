# Ticket — Codex — v1.0.x качество AI-разбора + контракт ingest

> База: `release/v1.0rc-wave0-gate` (HEAD 80bb680). План: [WORKPLAN.md](../WORKPLAN.md)
> (Часть B1/v1.5 backend + A.4 контракт). Идёт **параллельно** MiniMax (зоны не пересекаются).

Роль: Backend (Node/TS). **Зона: только `apps/api/**`.** НЕ трогать `apps/prototype`, `docs`.

```
git switch release/v1.0rc-wave0-gate && git pull
git switch -c feature/v1.0.x-ai-quality
```

## Контекст (важно)
На реальном устройстве голосовой разбор отработал, но вывод LLM был **тонким**
(`[llm] openai usage { completionTokens: 19 }`) — модель вернула почти пустой
результат на нормальную фразу родителя. Нужно, чтобы `gpt-4o-mini` стабильно
извлекал **полный** набор структурированных событий, тогда экраны на реальных
данных (MiniMax Батч 5) станут осмысленными.

## Задачи
1. **Промпт/схема в `apps/api/src/services/llmService.ts`:**
   - Ужесточить system-инструкцию (RU): из рассказа родителя извлекать **все**
     наблюдаемые события по типам `food/toilet/behavior/communication/state`,
     каждое с `title` + короткой `description`; где в рассказе есть A-B-C —
     заполнять `abc {antecedent,behavior,consequence}`; сенсорный контекст
     (шум/свет/толпа) → `sensoryContext: string[]`.
   - `response_format` json_schema — сделать так, чтобы пустой/односложный ответ
     был исключением: минимум одно событие если во входе есть содержание; поле
     `insight` (1–2 фразы, тон «Похоже…», не диагноз); `clarificationQuestions`.
   - НЕ ломать `aiFallback`/`aiError` и текущий контракт `source`.
   - Границы AI (STRATEGY §7.5): без диагнозов/медутверждений; при неуверенности —
     `clarificationQuestions`, а не выдумка.
2. **Версионирование промпта:** вынести RU-промпт в отдельный модуль/константу с
   версией (напр. `parse-ru.v2`), логировать версию рядом с usage.
3. **Контрактный тест `/api/audio/ingest`** (STRATEGY §6.7): тест, фиксирующий
   форму ответа пайплайна — `{ transcript, events[], insight, aiMode, sttMode,
   aiFallback, aiError? }` (mock STT+LLM). Это автоматическая граница фронт↔бэк.
4. **Тесты извлечения:** 2–3 фикстуры реальных RU-фраз (обезличенных) → проверка,
   что извлекается >0 типизированных событий с непустыми title.

## Проверки
```
cd apps/api
npm run typecheck && npm test
```
Не ронять текущие 28 тестов; новые — зелёные.

## Commit + push
```
git commit -m "feat(ai): richer RU parse extraction + ingest contract test + prompt versioning"
git push -u origin feature/v1.0.x-ai-quality
```

## Финальный отчёт (Claude сверит по коду)
- branch + commit SHA;
- что изменено в промпте/схеме (до/после по completionTokens на фикстуре);
- версия промпта;
- вывод `typecheck && test` (число тестов);
- подтверждение: контракт ingest покрыт тестом; границы AI (без диагнозов) соблюдены.

> ⚠️ Ключи не коммитить. Реальный прогон против OpenAI — только локально/в проде,
> тесты идут на mock.
