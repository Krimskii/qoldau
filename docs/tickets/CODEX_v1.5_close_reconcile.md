# Ticket — Codex — закрыть v1.5 backend (свести две ветки в одну чистую)

## Проблема (почему нужно доделать)
Ты сделал бэкенд v1.5 в ДВУХ ветках, но со сдвигом базы:
- `feature/v1.5-backend` (от release): ingest-поля (source/abc/sensoryContext/occurredAt),
  golden-eval v1 (18 кейсов, prompt-ru.v2), контракт-тесты.
- `feature/v1.5-backend-wave2` (**тоже от release, а не от v1.5-backend**): digest-эндпоинт,
  red-flag safety, eval → 28 кейсов + prompt-ru.v3.

Из-за общей базы они **пересекаются и конфликтуют** при интеграции:
`apps/api/eval/runEval.ts`, `apps/api/eval/runEval.test.ts`, `apps/api/src/services/llmService.ts`.
Claude при merge получил CONFLICT (add/add) — свёл руками нельзя вслепую.

## Что сделать: одна чистая ветка `feature/v1.5-backend-final`
Собери ВСЁ бэкенд-v1.5 в одну линейную ветку поверх `feature/v1.5-backend`:
```
git switch feature/v1.5-backend && git pull   # база с ingest-полями + eval v1
git switch -c feature/v1.5-backend-final
# перенести работу wave2 (cherry-pick или переприменить руками):
#   cd90135 digest, 4838d93 red-flag, ea39f98 eval-expand+prompt-v3
git cherry-pick cd90135 4838d93 ea39f98   # разрешить конфликты вручную
```
При разрешении конфликтов:
- **eval** (`golden.ru.json`, `runEval.ts`, `runEval.test.ts`): оставить версию **wave2**
  (28 кейсов, prompt-ru.v3, per-field breakdown) — она надмножество v1 (18/v2).
- **llmService.ts**: объединить ОБА набора — ingest-извлечение (source/abc/sensoryContext
  из v1.5-backend) **И** digest + red-flag + prompt **v3** (из wave2). Ничего не потерять.
- **prompt version** итог = `parse-ru.v3`; логировать её; `/api/ai/health` отдаёт её.

## Итоговая ветка должна содержать (проверь по коду)
- [ ] ingest-ответ отдаёт `source/abc/sensoryContext/occurredAt` в `events[]`.
- [ ] `POST /api/ai/digest` (агрегаты → RU-фразы, reject transcript/PII, «наблюдение, не диагноз»).
- [ ] red-flag path → `safetyFlag:true` + безопасный шаблон, без бытовых советов.
- [ ] `apps/api/eval/golden.ru.json` = 28 кейсов, `npm run eval` работает, prompt-ru.v3.
- [ ] контракт-тесты `/api/audio/ingest` + safety-инварианты.
- [ ] зона: ТОЛЬКО `apps/api/**`.

## Проверки / отправка
```
cd apps/api && npm run typecheck && npm test && npm run eval   # всё зелёное, ~33+ тестов
git push -u origin feature/v1.5-backend-final
```
> Если push падает (TLS/SNI, как в прошлый раз) — сделай bundle:
> `git bundle create qoldau-v1.5-backend-final.bundle feature/v1.5-backend-final`
> и положи в Downloads. Ключи НЕ коммитить.

## Отчёт
- один SHA финальной ветки; подтверждение — все 6 пунктов чек-листа есть;
- вывод typecheck/test/eval (число тестов, % евала);
- как отправил (push или bundle).

После этого Claude вливает `feature/v1.5-backend-final` в `integration/v1.5` одним чистым
merge (без конфликтов) и деплоит — v1.5 backend закрыт.
