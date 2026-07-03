# Ticket — MiniMax — v1.0-rc pilot UX finish

> База: `integration/v1.0-pilot-ru`. Параллельно с Codex. Не блокируется деплоем.

---

Ты работаешь в проекте Qoldau AI. Роль: Frontend / UX engineer.

Базовая ветка: `integration/v1.0-pilot-ru`
Создай ветку: `feature/v1.0rc-pilot-ux`

## Зона
МОЖНО: `pages/**`, `components/**`, `i18n/**` (RU).
НЕЛЬЗЯ: `apps/api/**`, `api/audio.ts`, `hooks/use*Recorder*`, STT/LLM, docs.

## Задачи

1. **Честный индикатор «AI недоступен»:**
   - если ответ прокси приходит с `aiMode:"mock"` / флагом fallback (Codex добавит
     `aiFallback`) во время реальной сессии (backend подключён) — **не выдавать
     mock-события за реальные**. Показать мягкое: «Распознавание сейчас недоступно,
     попробуйте позже» + предложить сохранить наблюдение вручную/повторить;
   - обычный оффлайн/demo-режим — как раньше (fallback ок).

2. **Мини-туториал первого запуска** (1-2 экрана после настройки семьи):
   - как записать наблюдение (нажать → говорить → стоп);
   - что делает система (осторожно: «структурирует в события, это наблюдение, не
     диагноз»);
   - пропускается кнопкой «Понятно», флаг в localStorage, повторно не показывать.

3. **Финальные состояния + доступность:**
   - loading / empty / error на Timeline, Voice, ролях — единообразно;
   - child-UI: тач-таргеты, контраст, `prefers-reduced-motion`, спокойная эстетика;
   - тёмная тема не протекает в детскую роль (проверить).

4. Осторожные формулировки, без medical claims (`docs/SAFETY_WORDING.md`). RU.

## Проверки
```
cd apps/prototype && npm run typecheck && npm test && npm run build
```

## Commit + push
```
git add apps/prototype/src/pages apps/prototype/src/components apps/prototype/src/i18n
git commit -m "feat(ux): honest AI-unavailable state + first-run tutorial + final states"
git push -u origin feature/v1.0rc-pilot-ux
```

## Финальный отчёт
- branch, SHA, файлы
- как выглядит «AI недоступен» (не выдаём mock за реальное)
- туториал первого запуска
- какие состояния/доступность допилены
- проверки
