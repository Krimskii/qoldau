# Handoff — перенос проекта на другой ПК

Как продолжить работу над Qoldau AI (с real STT/LLM/audio pipeline) на новом компьютере.

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

| Переменная          | Назначение                                                  |
| ------------------- | ----------------------------------------------------------- |
| `ANTHROPIC_API_KEY` | LLM-парсер наблюдений — **Anthropic Claude** (real AI)      |
| `ANTHROPIC_MODEL`   | модель Claude (default `claude-3-5-haiku-20241022`)         |
| `WHISPER_API_KEY`   | STT — **OpenAI Whisper** (распознавание речи)              |
| `WHISPER_MODEL`     | модель Whisper (default `whisper-1`)                        |
| `DATABASE_URL`      | Prisma (SQLite по умолчанию в Phase 1)                      |
| `JWT_SECRET`        | секрет для auth (magic-link)                                |
| `SENTRY_DSN`        | error tracking (опционально, пусто = выкл)                 |
| `AUDIO_MAX_MB`      | лимит размера аудио (по умолчанию 25)                       |
| `PORT`              | порт backend (по умолчанию 4000)                            |
| `CORS_ORIGIN`       | origin(ы) фронтенда для CORS                                |

> ⚠️ **Провайдеры (сверено с кодом):** LLM — Anthropic Claude (`@anthropic-ai/sdk`,
> `llmService.ts`); STT — OpenAI Whisper (`sttService.ts`, вызывает
> `api.openai.com/v1/audio/transcriptions`). Оба **opt-in**: без своего ключа
> соответствующий сервис работает в mock-режиме (это штатный fallback, не ошибка).
>
> ⚠️ `ANTHROPIC_API_KEY` и `WHISPER_API_KEY` кладутся **только** в `apps/api/.env` на
> локальной машине. Никогда не коммить этот файл (он в `.gitignore`).

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

- `/api/ai/health` → `{ "ok": true, "service": "ai", "enabled": true, "mode": "claude", "model": "claude-3-5-haiku-20241022" }`
- `/api/stt/health` → `{ "ok": true, "service": "stt", "enabled": true, "mode": "whisper", "model": "whisper-1" }`
- `/api/audio/health` → `{ "ok": true, "service": "audio-pipeline", "mode": "sync", "maxAudioMb": 25 }`

Если `mode: "mock"` — значит соответствующий ключ не задан в `apps/api/.env`, приложение
работает на заглушках (это штатный fallback, не ошибка).

### Режимы работы

| Режим        | Условие                                        | Что работает                        |
| ------------ | ---------------------------------------------- | ----------------------------------- |
| Full real    | есть `ANTHROPIC_API_KEY` **и** `WHISPER_API_KEY` | real STT + real LLM                 |
| STT-only     | есть `WHISPER_API_KEY`, нет `ANTHROPIC_API_KEY`  | real распознавание, mock-структуризация |
| LLM-only     | есть `ANTHROPIC_API_KEY`, нет `WHISPER_API_KEY`  | mock-транскрипт, real-структуризация |
| Mock         | нет ни одного ключа                            | полностью на заглушках, demo не ломается |

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
