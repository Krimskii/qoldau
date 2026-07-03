# Agent Workflow — Codex + MiniMax + Claude

Операционные правила параллельной разработки Qoldau AI тремя агентами.
Версия: v0.7.6 · База: `rescue/codex-audio-stt-llm-sync`

> Этот файл — версионированная копия рабочего процесса. Источник-договорённость:
> `Qoldau_AI_Agent_Workflow_PC_Handoff.md` (вне репо). Если расходятся — правит этот файл.

---

## 1. Цель v0.7.6

Довести полный пользовательский flow: **Родитель нажимает запись → аудио уходит в
backend → STT/LLM структурирует наблюдение → Event появляется в Event Timeline.**
С сохранением mock/demo-fallback, если backend, ключи или микрофон недоступны.

Медицинская безопасность: AI-выводы — только наблюдения, не диагноз (см.
[SAFETY_WORDING.md](SAFETY_WORDING.md)).

---

## 2. Ветки

```text
База для всех агентов:   rescue/codex-audio-stt-llm-sync

Codex   → feature/v0.7.6-audio-foundation
MiniMax → feature/v0.7.6-voice-ui-flow
Claude  → docs/v0.7.6-handoff-sync

Интеграция:              integration/v0.7.6-real-voice-pipeline
master — НЕ трогать до полной интеграции и ручного smoke-test.
```

Порядок: **Codex → MiniMax** (MiniMax базируется на ветке Codex, т.к. использует
его hook/client). **Claude** — параллельно по docs-ветке.

---

## 3. Разделение ролей и зон файлов

| Агент     | Роль                         | МОЖНО                                                                                                                                                             | НЕЛЬЗЯ                                                                              |
| --------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Codex** | Backend / audio integration  | `apps/api/**`, `apps/prototype/src/api/audio.ts`, `apps/prototype/src/hooks/useAudioRecorder.ts`, `apps/prototype/src/features/audio/**`, `useVoiceObservationStore` | UI-страницы, UX-тексты, demo-flow, `docs/HANDOFF_PC_SETUP.md`                       |
| **MiniMax** | Frontend / UI / demo-flow    | `pages/parent/VoiceObservation.tsx`, `EventTimeline.tsx`, `EventDetails.tsx`, `components/**`, `i18n/**`, `data/demoDataset.ts`                                     | `apps/api/**`, `api/audio.ts`, `hooks/useAudioRecorder.ts`, LLM/STT services, Prisma |
| **Claude** | Architect / Git / docs        | `docs/**`, `README.md`, `SETUP.md`, `CHANGELOG.md`, `VERSIONING.md`, `.gitignore`, `.github/**`, `scripts/setup.ps1`                                               | `apps/api/src/**`, `pages/**`, `components/**`, активный feature-код                |

**Критическое правило:** Codex не трогает UI, MiniMax не трогает backend,
Claude не трогает feature-code.

---

## 4. Git-безопасность

- Перед любой работой: `git status -sb` и `git branch --show-current`.
- Если рабочее дерево грязное и изменения **чужие** — стоп, не делать `switch`/`reset`.
- Один агент = одна ветка = своя зона файлов.
- Никто не пушит: `.env`, `.env.local`, `*.apk`, `*.aab`, `*.jks`, `*.keystore`,
  `keystore.properties`, `dist/`, `build/`, `node_modules/`.
- Перед commit: `git diff --cached --name-only` + grep на секреты.
- Перед push: typecheck + tests + build в своей зоне.

### Минимальный отчёт агента

```text
branch · commit SHA · files changed · tests passed · manual check · next dependency
```

---

## 5. Контракт интеграции (что Codex отдаёт MiniMax)

Проверено по коду ветки `feature/v0.7.6-audio-foundation`:

### Backend endpoints

| Endpoint                  | Ответ                                                                       |
| ------------------------- | --------------------------------------------------------------------------- |
| `POST /api/audio/ingest`  | `audioBase64` → STT → LLM → recording + events + realtime broadcast → JSON  |
| `GET /api/ai/health`      | `{ ok, service:"ai", enabled, mode:"claude"\|"mock", model }`               |
| `GET /api/stt/health`     | `{ ok, service:"stt", enabled, mode:"whisper"\|"mock", model }`             |
| `GET /api/audio/health`   | `{ ok, service:"audio-pipeline", mode:"sync", maxAudioMb }`                 |

Провайдеры: **LLM = Anthropic Claude**, **STT = OpenAI Whisper**. Оба opt-in
(mock-fallback без ключа).

### Frontend client — `apps/prototype/src/api/audio.ts`

- `blobToBase64(blob): Promise<string>`
- `uploadAudioObservation(...)` — Blob → base64 → `POST /api/audio/ingest`, typed error при недоступности backend
- `getAudioPipelineHealth(): Promise<AudioPipelineHealth>`

### Frontend hook — `apps/prototype/src/hooks/useAudioRecorder.ts`

```ts
useAudioRecorder(): {
  isRecording, isProcessing, duration, audioBlob, error,
  startRecording(): Promise<void>,
  stopRecording(): Promise<Blob | null>,
  resetRecording(): void,
}
```

Хук не содержит UI-разметки, не делает `navigate`, не создаёт Event напрямую,
безопасен для браузеров без `MediaRecorder` (см. `chooseSupportedAudioMimeType`).

**MiniMax:** подключает `useAudioRecorder` + `uploadAudioObservation` в
`VoiceObservation.tsx`. НЕ трогает эти файлы, только использует их.

---

## 6. Интеграция (после работы агентов)

```bash
git switch rescue/codex-audio-stt-llm-sync && git pull
git switch -c integration/v0.7.6-real-voice-pipeline

git merge feature/v0.7.6-audio-foundation
git merge feature/v0.7.6-voice-ui-flow
git merge docs/v0.7.6-handoff-sync

cd apps/api && npm run typecheck && npm test
cd ../prototype && npm run typecheck && npm test && npm run build

git push -u origin integration/v0.7.6-real-voice-pipeline
```

PR в master — только после зелёной интеграции и ручного smoke-test.

---

## 7. Manual QA checklist

- [ ] Backend на `http://localhost:4000`, frontend на `http://localhost:5173`.
- [ ] `VoiceObservation` запрашивает доступ к микрофону.
- [ ] После stop — состояние обработки (`isProcessing`).
- [ ] `POST /api/audio/ingest` уходит на backend.
- [ ] Whisper возвращает transcript (или mock fallback).
- [ ] Claude возвращает структурированное наблюдение (или mock fallback).
- [ ] Создаётся Event, связанный с Event Timeline.
- [ ] Нет дубля через старый AIReview mock-flow.
- [ ] AI-формулировки осторожные: наблюдение, не диагноз.

### Android smoke-test (LAN)

- `VITE_API_BASE_URL=http://<IP_ПК>:4000` (ПК и телефон в одной Wi-Fi).
- Windows Firewall: открыть порт 4000.
- `AndroidManifest.xml` уже разрешает cleartext (LAN http).
