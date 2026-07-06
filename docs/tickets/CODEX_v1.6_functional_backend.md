# Ticket — Codex — v1.6 Functional Backend: STT реального аудио + recordings-sync + taxonomy verify

> Зона: **только `apps/api/**`.** База: integration (после P2 + taxonomy). Ветка:
> `feature/v1.6-be-functional`. Небольшой пакет — в основном верификация/докрутка того, что
> уже есть (STT, audio-ingest, sync, taxonomy). **Не ломать** AI-proxy контракты; ESM — все
> относительные импорты с `.js` (проверять `node dist/index.js`).
>
> Контекст: фронт (MiniMax F1) переходит на РЕАЛЬНОЕ аудио — записывает Blob, шлёт в STT,
> хранит звук КЛИЕНТСКИ (IndexedDB), на сервер звук НЕ грузит. Сервер отвечает за
> транскрипцию и синхронизацию метаданных.

## 1. STT реального аудио (`/api/stt/transcribe`)
- Убедиться, что эндпоинт принимает **реальный аудио-base64** (не только мок) и гоняет через
  Whisper (`sttService`) → `{ transcript, confidence, durationSec, sttSource }`. Проверить
  формат входа (base64 + mimeType), лимиты размера (уже есть `MAX_AUDIO_BASE64_CHARS`),
  таймаут, error→graceful (mock/пусто, не 500).
- Поддержать реальные mime от MediaRecorder (webm/opus, mp4/aac) — прокинуть в Whisper.
- Тесты: валидный аудио→transcript; слишком большой→400; провайдер down→fallback; регресс.

## 2. Audio-pipeline (`/api/audio/ingest`) — сверить назначение
- Уточнить: `ingest` = один шаг (audio→STT→AI-parse)? Если фронт использует раздельно
  (`/stt` + `/ai/parse`), задокументировать, какой путь канонический для клиента; не плодить
  дубли. Оставить оба, но описать в `docs/API.md` / `docs/AUDIO_PIPELINE_TZ.md`.

## 3. Recordings в sync (звук клиентский, метаданные серверные)
- Модель `Recording` синкается (P2 добавил updatedAt/deletedAt?) — проверить, что
  `/api/sync/pull|push` включает recordings с полями `{id, childId, label, durationSec,
  transcript?, mimeType?, updatedAt, deletedAt}`. **audioId/сам звук НЕ синкать** (клиентский).
- Если поля `transcript`/`mimeType` в схеме нет — добавить (миграция, nullable, backfill).
- Тесты: pull/push recordings с транскриптом; soft-delete; звук не требуется сервером.

## 4. Event taxonomy — verify tutor/specialist
- Подтвердить, что `tutor_note`, `specialist_note`, `voice_observation`, `aac_card`,
  `communication`, `calm_mode`, `media_request`, `sos`, `phrase` — все в каноническом наборе
  (из event-taxonomy тикета) и проходят sync-валидацию. Если чего-то нет — добавить.

## 5. AI-parse для тьютора
- `/api/ai/parse` роле-агностичен — подтвердить, что работает для транскриптов тьютора
  (TutorAIReview) так же, как для родителя. Никаких изменений контракта; только проверка+тест.

## Проверки / отчёт
```
cd apps/api && npm run typecheck && npm test && npm run eval
npm run build && node dist/index.js   # ESM-старт, без ERR_MODULE_NOT_FOUND
prisma validate
```
Отчёт: что уже работало vs докручено; STT реального аудио (пример mime→transcript); recordings
в sync (поля/миграция если была); подтверждение taxonomy (tutor_note и др.); регресс
AI-proxy/sync; ESM-старт. Что осталось (если audio-ingest требует доработки — вынести отдельно).
