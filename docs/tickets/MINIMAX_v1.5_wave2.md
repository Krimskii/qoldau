# Ticket — MiniMax — v1.5 Wave 2 (~2ч): типизированный payload + ABC/сенсорика в UI + уточнения

> После `feature/v1.5-frontend`. База: `integration/v1.5` (когда Wave 1 влит) ИЛИ release.
> Зона: **только `apps/prototype/**`.** Дизайн: [EVENT_SCHEMA_V1.5.md](../EVENT_SCHEMA_V1.5.md).

```
git switch integration/v1.5 && git pull   # (или release, уточнит Claude)
git switch -c feature/v1.5-frontend-wave2
```
3 коммита (A→B→C), после каждого typecheck+test+build зелёные.

## Коммит A — Типизированный payload (discriminated union)
1. `src/types/qoldau.ts`: `EventPayloadMap` — payload per type
   (`food:{amount?,item?}`, `toilet:{kind?}`, `behavior:{intensity?}`,
   `communication:{signal?,meaning?}`, `state:{mood?}`, и т.д.). `QoldauEvent.payload`
   становится `EventPayloadMap[type]` через дженерик-хелпер (сохранить обратную
   совместимость — где payload не типизирован, узкий тип `unknown`).
2. Обновить фабрики/читатели, где payload используется (минимально, без слома).
3. Тесты типов (компиляция) + пары юнитов.
> `timestamp`-alias пока НЕ удалять (отдельный коммит позже, когда все читатели на occurredAt).

## Коммит B — ABC и сенсорика в UI (наука → видимость)
1. `EventDetails.tsx`: если у события есть `abc` — секция «Что было до / Что произошло /
   Что после» (описательно, без диагнозов). Если `sensoryContext` — чипы (шум/свет/толпа).
2. `EventTimeline`/аналитика: фильтр/бейдж по сенсорному контексту.
3. Тесты рендера секции ABC при наличии/отсутствии полей.

## Коммит C — Уточняющие вопросы родителю
1. `VoiceObservation.tsx`: если backend вернул `clarificationQuestions` — показать их
   после разбора (мягкая карточка), ответы родителя пишутся в `clarifyingAnswers`
   (стор уже есть) и/или уточняют событие. Без принуждения — можно пропустить.
2. Честный тон: «Чтобы точнее — уточните…», не «вы обязаны».
3. Тест: вопросы показываются при наличии, скрыты при пустом массиве.

## Проверки / push / отчёт
```
cd apps/prototype && npm run typecheck && npm test && npm run build
git push -u origin feature/v1.5-frontend-wave2
```
Отчёт: файлы/что по коммиту; проверки; ABC/сенсорика/уточнения видны в UI, payload типизирован.
