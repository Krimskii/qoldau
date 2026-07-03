# Handoff — перенос проекта на другой ПК

Как продолжить работу над Qoldau AI (с real STT/LLM/audio pipeline) на новом компьютере.

---

## Wave 0 RC Handoff Checklist

Use branch `integration/v1.0rc-pilot-ru` or release prep branch `release/v1.0rc-codex-prep`.

### Required owner-only secrets

Do not send secrets through git, APK, screenshots, or docs.

- Rotate/revoke any OpenAI key that was pasted into chat or logs.
- Create a fresh `OPENAI_API_KEY` in the OpenAI dashboard.
- Confirm OpenAI billing/quota is active.
- Put `OPENAI_API_KEY` only in backend/proxy env (`apps/api/.env` locally, Railway/Render env in prod).
- Optional: use `WHISPER_API_KEY` only if STT should use a separate key.
- Frontend/APK gets only `VITE_API_BASE_URL=https://<prod-proxy-url>`.

### Wave 0 release smoke

- Production proxy URL works over HTTPS.
- `/api/health`, `/api/ai/health`, `/api/stt/health`, `/api/audio/health` are green.
- Android APK installs on a real device.
- Consent gate is visible before first audio upload.
- First-run tutorial is visible.
- Voice record works.
- AI unavailable state is honest when quota/key/network fails.
- Manual save works.
- Event appears once in Timeline.
- Text uses cautious observation wording and does not present medical conclusions.

### Audio Flow

```text
VoiceObservation -> MediaRecorder -> /api/audio/ingest -> STT -> LLM -> Event -> Timeline
```

If backend returns `aiFallback:true`, treat parsed AI output as unavailable and offer manual save/retry.

---

## 1. Забрать код

```bash
git clone https://github.com/Krimskii/qoldau.git
cd qoldau
git fetch --all
git switch rescue/codex-audio-stt-llm-sync
```

Эта ветка содержит актуальное состояние: audio pipeline (record → STT → AI → events),
real STT/LLM интеграцию, family setup flow и всё остальное на момент переноса.

---

## 2. Секреты (env) — кладутся ТОЛЬКО локально, в git их нет

В репозитории есть только `*.env.example` — шаблоны. Реальные ключи в git **не хранятся**
и переносятся между машинами вручную (мессенджер/менеджер паролей, не через git).

### Backend — `apps/api/.env`

Скопируй шаблон и заполни реальными значениями:

```bash
cp apps/api/.env.example apps/api/.env
```

Ключевые переменные (см. полный список в `apps/api/.env.example`):

| Переменная          | Назначение                                                       |
| ------------------- | ---------------------------------------------------------------- |
| `OPENAI_API_KEY`    | **Один ключ на STT + LLM** (OpenAI). Real AI, opt-in.            |
| `OPENAI_LLM_MODEL`  | модель LLM (default `gpt-4o-mini`)                               |
| `WHISPER_MODEL`     | модель STT (default `whisper-1`)                                 |
| `WHISPER_API_KEY`   | (опц.) отдельный ключ для STT; иначе берётся `OPENAI_API_KEY`    |
| `SENTRY_DSN`        | error tracking (опционально, пусто = выкл)                       |
| `AUDIO_MAX_MB`      | лимит размера аудио (по умолчанию 25)                            |
| `PORT`              | порт backend (по умолчанию 4000)                                 |
| `CORS_ORIGIN`       | origin(ы) фронтенда для CORS                                     |

> ⚠️ **Провайдеры (v1.0, сверено с кодом):** LLM — **OpenAI** `gpt-4o-mini`
> (`llmService.ts`, SDK `openai`); STT — **OpenAI Whisper** (`sttService.ts`,
> `api.openai.com/v1/audio/transcriptions`). Достаточно **одного** `OPENAI_API_KEY`
> на оба. Anthropic Claude мигрирован в v1.0 (`@anthropic-ai/sdk` удалён). Оба
> **opt-in**: без ключа — mock-режим (штатный fallback).
>
> ⚠️ `OPENAI_API_KEY` кладётся **только** в `apps/api/.env` на локальной машине.
> Никогда не коммить этот файл (он в `.gitignore`).

### Frontend — `apps/prototype/.env` (опционально)

```bash
cp apps/prototype/.env.example apps/prototype/.env
```

- `VITE_API_BASE_URL` — URL backend. Пусто = mock-режим (полностью оффлайн на localStorage).

---

## 3. Установка зависимостей

```bash
# Backend
cd apps/api
npm install

# Frontend
cd ../prototype
npm install
```

---

## 4. Запуск

### Backend

```bash
cd apps/api
npm run dev        # dev с hot-reload
# или
npm run build && npm start
```

### Frontend

```bash
cd apps/prototype
npm run dev        # http://localhost:5173
```

---

## 5. Проверка, что real STT/LLM подключены

При запущенном backend:

```bash
curl http://localhost:4000/api/ai/health
curl http://localhost:4000/api/stt/health
curl http://localhost:4000/api/audio/health
```

**Ожидаемо при корректных ключах** (поле называется `mode`):

- `/api/ai/health` → `{ "ok": true, "service": "ai", "enabled": true, "mode": "openai", "model": "gpt-4o-mini" }`
- `/api/stt/health` → `{ "ok": true, "service": "stt", "enabled": true, "mode": "whisper", "model": "whisper-1" }`
- `/api/audio/health` → `{ "ok": true, "service": "audio-pipeline", "mode": "sync", "maxAudioMb": 25 }`

Если `mode: "mock"` — значит `OPENAI_API_KEY` не задан в `apps/api/.env`, приложение
работает на заглушках (это штатный fallback, не ошибка).

### Режимы работы

| Режим     | Условие                          | Что работает                             |
| --------- | -------------------------------- | ---------------------------------------- |
| Full real | есть `OPENAI_API_KEY`            | real STT (Whisper) + real LLM (gpt-4o-mini) |
| Mock      | нет `OPENAI_API_KEY`             | полностью на заглушках, demo не ломается |

> Один `OPENAI_API_KEY` включает и STT, и LLM. `WHISPER_API_KEY` — опциональный
> отдельный ключ для STT, если нужно развести.

### Проверка полного audio pipeline

`POST /api/audio/ingest` принимает `audioBase64` → STT → LLM-парсер → создаёт recording +
события → возвращает JSON с событиями, AI-инсайтом и уточняющими вопросами.
Контракт и архитектура — в [AUDIO_PIPELINE_TZ.md](AUDIO_PIPELINE_TZ.md).

---

## 6. Android APK + LAN backend

Если тестируешь APK на телефоне против backend на компьютере (в одной Wi-Fi сети):

1. Узнай локальный IP компьютера (`ipconfig` → IPv4, напр. `192.168.0.104`).
2. Собери фронт с этим IP:
   ```bash
   cd apps/prototype
   # VITE_API_BASE_URL должен указывать на IP компьютера, не localhost:
   #   VITE_API_BASE_URL=http://192.168.0.104:4000
   npm run build
   npx cap sync android
   ```
3. `AndroidManifest.xml` уже содержит `android:usesCleartextTraffic="true"` — нужно,
   т.к. LAN backend работает по http (не https).
4. Backend должен слушать на `0.0.0.0` (не только localhost), чтобы телефон достучался.

> Релизная подпись APK: `apps/prototype/android/keystore.properties` и `*.keystore`
> **не в git** (секреты). На новой машине для release-сборки нужно либо перенести keystore
> вручную, либо сгенерировать новый. Debug-сборка (`gradlew assembleDebug`) keystore не требует.

---

## 7. Проверки (verify)

```bash
# Backend
cd apps/api
npm run typecheck
npm test

# Frontend
cd ../prototype
npm run typecheck
npm run build
```
