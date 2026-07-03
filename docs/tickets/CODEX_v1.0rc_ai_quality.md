# Ticket — Codex — v1.0-rc AI quality & cost safety

> База: `integration/v1.0-pilot-ru`. Параллельно с MiniMax. Не блокируется деплоем.
> Контекст: LLM = OpenAI `gpt-4o-mini`. Smoke показал — на реальном транскрипте
> mock-парсер вернул пустой `events[]`; реальное качество разбора критично для пилота.

---

Ты работаешь в проекте Qoldau AI. Роль: Backend / AI engineer.

Базовая ветка: `integration/v1.0-pilot-ru`
Создай ветку: `feature/v1.0rc-ai-quality`

## Зона
МОЖНО: `apps/api/**` (`services/llmService.ts`, `modules/audio-pipeline/**`,
`routes/ai.ts`), `apps/api/test/**`.
НЕЛЬЗЯ: UI, `pages/**`, `components/**`, docs.

## Задачи

1. **Тюнинг промпта парсера** (`llmService.ts`) под русские наблюдения родителей:
   - system-промпт: извлекать события типов `food/water/sleep/toilet/behavior/
     sensory/communication` из свободного русского текста;
   - осторожные формулировки в description («Похоже…», «Возможно…», «не диагноз»);
   - проверить на 4-5 реальных RU-транскриптах, что `events[]` не пустой и
     осмысленный (добавить как fixtures в тест).

2. **Устойчивый structured output** для `gpt-4o-mini`:
   - использовать `response_format` json_schema (строгая схема
     events/insight/clarificationQuestions);
   - на невалидный JSON — не падать, graceful fallback на mock.

3. **Честный флаг недоступности AI:**
   - сейчас при ошибке OpenAI (429/quota/сеть) код молча уходит в mock и отдаёт
     `aiMode:"mock"`. Добавить в ответ явный признак, что это **fallback после
     ошибки** (напр. `aiFallback: true` + короткая причина `aiError: "quota"`),
     чтобы фронт мог показать «распознавание временно недоступно», а не выдавать
     mock-события за реальные;
   - обычный mock (нет ключа вовсе) и fallback-после-ошибки — различать.

4. **Cost/usage логирование:**
   - на каждый реальный вызов логировать `usage` (prompt/completion tokens) на
     info-уровне — чтобы видеть расход на пилоте. Без PII в логах.

5. Осторожные формулировки, без medical claims (`docs/SAFETY_WORDING.md`).

## Проверки
```
cd apps/api && npm run typecheck && npm test && npm run build
```

## Commit + push
```
git add apps/api
git commit -m "feat(ai): tune RU parse prompt, strict json output, AI-fallback flag + usage logging"
git push -u origin feature/v1.0rc-ai-quality
```

## Финальный отчёт
- branch, SHA, файлы
- новый признак fallback в ответе (имя поля/значения)
- пример разбора реального RU-транскрипта (events[])
- где логируется usage
- проверки
