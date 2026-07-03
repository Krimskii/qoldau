# Ticket — MiniMax — v0.8 local events (per-device)

> Запускать ПОСЛЕ того, как Codex опубликует обновлённый контракт
> `/api/audio/ingest` (ветка `feature/v0.8-stateless-proxy`). См.
> [ROADMAP_V1.md](../ROADMAP_V1.md).

---

Ты работаешь в проекте Qoldau AI. Твоя роль: Frontend / UI / demo-flow engineer.

Базовая ветка: `feature/v0.8-stateless-proxy` (ветка Codex, после его контракта)
Создай ветку: `feature/v0.8-local-events`

## Контекст

Пилот = per-device: события хранятся локально на устройстве. Backend теперь
stateless-прокси — он больше НЕ пишет события в БД и НЕ шлёт realtime. Значит
локальная вставка события на фронте становится единственным источником правды.

## Строгие границы

МОЖНО трогать:
- `apps/prototype/src/pages/**`
- `apps/prototype/src/components/**`
- `apps/prototype/src/data/demoDataset.ts`
- `apps/prototype/src/i18n/**` (только RU-строки для пилота)

НЕЛЬЗЯ трогать:
- `apps/api/**` (зона Codex)
- `apps/prototype/src/api/audio.ts`, `hooks/useAudioRecorder.ts` (зона Codex)
- LLM/STT services, Prisma, docs

## Задачи

1. `git switch feature/v0.8-stateless-proxy && git pull`
   `git switch -c feature/v0.8-local-events`

2. **Убрать realtime с фронта**:
   - удалить использование `useRealtimeEvents` в `EventTimeline.tsx`;
   - события приходят только из локального стора (`useEventStore`), без WebSocket.

3. **Локальная вставка = единственный путь**:
   - в `VoiceObservation.tsx` после ответа stateless-прокси вставлять
     распарсенные события в `useEventStore` локально (id генерит фронт);
   - убрать дедуп-обвязку, которая была нужна из-за WebSocket-дублей (теперь
     источник один — локальный).

4. **Fallback сохранить**: нет сети / нет микрофона / ошибка прокси → Web Speech /
   demo-flow, приложение не ломается.

5. **RU-only полировка** (по ходу): если на затронутых страницах есть
   хардкод-заглушки или нерусский текст — привести к чистому RU через `t()`.

6. **Осторожные формулировки**: «Похоже…», «Возможно…», «Нужно подтвердить»,
   «Это наблюдение, не диагноз». Запрещённые medical claims не вводить.

7. Проверь demo-flow: ParentHome → VoiceObservation → запись → обработка →
   EventTimeline (событие видно, без дублей).

8. Прогони:
   ```
   cd apps/prototype && npm run typecheck && npm test && npm run build
   ```

9. Commit + (если сеть) push:
   ```
   git add apps/prototype/src/pages apps/prototype/src/components apps/prototype/src/i18n apps/prototype/src/data
   git commit -m "feat(parent): local event insert (per-device), drop realtime"
   git push -u origin feature/v0.8-local-events
   ```
   Если сети нет: `git bundle create C:\Users\user\Downloads\qoldau-v0.8-minimax.bundle feature/v0.8-local-events`

## Финальный отчёт
- branch, commit SHA, files changed
- как проверить вручную
- работает ли fallback без backend
- виден ли Event в Timeline, нет ли дублей
- какие проверки прошли
