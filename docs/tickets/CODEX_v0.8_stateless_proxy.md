# Ticket — Codex — v0.8 stateless AI-proxy

> Готовый промпт для Codex. Владелец решения зафиксировал: per-device, backend =
> stateless AI-прокси. См. [ROADMAP_V1.md](../ROADMAP_V1.md).

---

Ты работаешь в проекте Qoldau AI. Твоя роль: Backend / API / audio integration engineer.

Базовая ветка: `integration/v0.7.6-real-voice-pipeline`
Создай ветку: `feature/v0.8-stateless-proxy`

## Контекст и решение

Пилот = per-device: данные каждой семьи хранятся локально на устройстве
(localStorage на фронте). Backend НЕ хранит данные и НЕ имеет пользователей.
Backend должен стать **stateless AI-прокси**: принять аудио → распознать (Whisper)
→ структурировать (Claude) → вернуть результат. Никакой БД, auth, realtime.

## Главная задача

Превратить `POST /api/audio/ingest` в stateless-эндпоинт:
- НЕ писать recording/events в Prisma;
- НЕ вызывать realtimeService broadcast;
- вернуть в ответе всё, что нужно фронту для локальной вставки:
  `{ transcript, events: [...parsed], insight, questions, sttMode, aiMode }`.

Фронт (MiniMax, отдельная ветка) уже делает optimistic-вставку событий локально —
после этого рефактора это станет единственным путём, дедуп-логика упрощается.

## Строгие границы

МОЖНО трогать:
- `apps/api/**`
- `apps/api/src/modules/audio-pipeline/**`
- `apps/api/src/services/sttService.ts`, `llmService.ts`
- `apps/api/src/index.ts` (снять регистрацию socket.io/realtime)
- `apps/api/test/**`

НЕЛЬЗЯ трогать:
- `apps/prototype/src/pages/**`, `components/**` (зона MiniMax)
- `apps/prototype/src/api/audio.ts`, `hooks/useAudioRecorder.ts` — **можно менять
  только контракт ответа**, синхронно с backend; UI-логику не трогать.
- docs (зона Claude)

## Задачи

1. `git fetch --all && git switch integration/v0.7.6-real-voice-pipeline`
   (если сети нет — работай от локальной ветки).
   `git switch -c feature/v0.8-stateless-proxy`

2. **Stateless pipeline** (`audioPipeline.service.ts`):
   - убрать создание recording + events в БД;
   - убрать вызовы `realtimeService.broadcast*`;
   - собрать распарсенные события в ответ (тип события, title, description,
     timestamp, sourceRole), НЕ присваивая server-id (id генерит фронт локально).

3. **Убрать realtime**: снять инициализацию socket.io в `index.ts` и
   `realtimeService`. Если проще выключить флагом — ок, но цель: realtime не нужен.
   Это закрывает баги из код-ревью (DELETE broadcast, dedup-cache, двойной DELETE,
   hardcoded childId, graceful shutdown) удалением.

4. **Лимиты и бюджет-гварды** (AI стоит денег на пилоте):
   - кап длительности/размера аудио (`AUDIO_MAX_MB` уже есть — проверить);
   - rate-limit на `/api/audio/ingest` (по IP, разумный лимит запросов/мин);
   - graceful-обработка ошибок STT/LLM → структурированный ответ, не 500.

5. **Синхронизировать контракт**: обновить `apps/prototype/src/api/audio.ts`
   (`uploadAudioObservation` / типы ответа) под новый stateless-ответ. Только
   контракт/типы, без UI.

6. **Обновить/добавить тесты**: audio pipeline (stateless), STT mock fallback,
   LLM mock fallback. Убрать тесты, завязанные на realtime/DB-запись.

7. **Медицинские формулировки**: не вводить запрещённых
   (лечит/диагностирует/исправляет/нормализует/манипулирует/неадекватное/
   поведенческое нарушение/«ИИ точно понял»). Осторожные формулировки: «Похоже…»,
   «Возможно…», «Нужно подтвердить», «Это наблюдение, не диагноз».

8. Прогони:
   ```
   cd apps/api && npm run typecheck && npm test
   cd ../prototype && npm run typecheck && npm test && npm run build
   ```

9. Commit + (если сеть) push:
   ```
   git add apps/api apps/prototype/src/api
   git commit -m "refactor(audio): stateless AI-proxy — drop DB write, realtime; add limits"
   git push -u origin feature/v0.8-stateless-proxy
   ```
   Если сети нет: `git bundle create C:\Users\user\Downloads\qoldau-v0.8-codex.bundle feature/v0.8-stateless-proxy`

## Финальный отчёт
- branch, commit SHA, files changed
- новый контракт ответа `/api/audio/ingest` (JSON-схема)
- что убрано (realtime/DB) и какие тесты изменились
- какие проверки прошли
- что MiniMax должен использовать (обновлённый `audio.ts`)
- next dependency
