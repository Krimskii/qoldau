# Ticket — MiniMax — v1.6 Functional Round: реальное аудио + рабочие карточки + тьютор + UI-полиш

> Зона: **только `apps/prototype/**`.** База: `integration/v1.5`. Ветки по пакетам:
> `feature/v1.6-F1-audio`, `-F2-cards`, `-F3-tutor`, `-F4-polish` (отдельные PR, можно
> параллельно). Общие инварианты (раздел 0 прошлых спек): 0 хардкод-hex, i18n ru/kk/en, a11y
> (aria=label, focus, контраст AA, reduced-motion + сенсорный регулятор), тач-таргеты
> (детские ≥112px), DataState (loading/empty/error/data), честные состояния (DemoBadge).
>
> **Реальные факты (сверено с кодом):** `useAudioRecorder.ts` — уже РЕАЛЬНЫЙ MediaRecorder+Blob;
> но `useRecordingsStore` хранит только `{label, durationSec}` (звук нигде не сохраняется);
> E10 убрал управление аудио из детского UI (оно для parent/tutor). Карточки: две системы —
> `data/categories.ts` и `useAssetStore.cardConfigs`; ChildCategoryPage создаёт event, но НЕ
> озвучивает. Тьютор: TutorAIReview — mock-flow, TutorReport — честная заглушка.

---

## F1 — РЕАЛЬНОЕ АУДИО: запись → сохранение (IndexedDB) → воспроизведение
Решение: **звук хранится клиентски в IndexedDB** (localStorage мал; сервер — только
STT-транскрипт+метаданные, звук на сервер НЕ грузим).

1. **`lib/audio/audioBlobStore.ts`** — обёртка над IndexedDB (можно `idb-keyval`): `put(id, Blob)`,
   `get(id) → Blob`, `del(id)`, `clear()`. Квота/ошибки — обрабатывать (fallback: не сохранять
   звук, оставить метаданные+транскрипт).
2. **`useRecordingsStore`:** к записи добавить `audioId` (ключ в IndexedDB) + `transcript?`;
   `mimeType`, `sizeBytes`. persist — только метаданные (не Blob).
3. **ChildSpeak (детский режим):** при `stopRecording` брать реальный `Blob` из
   `useAudioRecorder`, сохранить в IndexedDB (`audioId`), `addRecording({label, durationSec,
   audioId, transcript})`. Детский UI НЕ показывает управление (по E10) — только «✓ Фраза
   отправлена» + (F4) TTS фразы. `addEvent('voice_observation'|'communication')`.
4. **Воспроизведение в parent/tutor** (там, где «Недавние записи»): реальный `<audio>` —
   создать objectURL из IndexedDB-Blob, play/pause/скраббер/длительность, delete (удаляет и
   Blob из IndexedDB), список. **Revoke objectURL** при размонтировании. Состояния (нет звука →
   показать только транскрипт/метку с пометкой).
5. **STT — реальный звук:** отправлять записанный Blob (base64) в `POST /api/stt/transcribe`
   → `transcript` использовать как label/подпись. Fallback: Web Speech API → mock (как сейчас).
   Обрабатывать оффлайн/ошибку (`ErrorState`/тихий fallback).
6. **TutorVoice:** та же запись → IndexedDB → STT → `tutor_note` event (см. F3).
7. Тесты: record→save→get→play (мок IndexedDB/MediaRecorder), STT happy-path+fallback, delete
   чистит Blob, revoke objectURL.

## F2 — Детские Карточки / AAC рабочие
Сейчас две несвязанные системы. Свести к **единому AAC-борду на `useAssetStore.cardConfigs`**.
1. **Каждая карточка функциональна:** тап → `speak(config.phrase || config.label)` (TTS) +
   `addEvent` каноническим типом (`aac_card`) + гаптик (по сенсорному режиму) + визуальный
   speak-pulse фидбек. **ChildCategoryPage сейчас НЕ озвучивает — добавить `speak()`.**
2. **Единый источник:** категории (`data/categories.ts`) сделать группировками над
   `cardConfigs` (у карточки: `category`, `label`, `phrase`, `assetId`, `eventType`, `order`).
   ChildCards + ChildCategoryPage читают из cardConfigs, не из двух разных мест.
3. **«Добавить в фразу»:** опция на карточке → добавляет слово/фразу в PhraseBuilder
   (кросс-связь), чтобы карточки собирались в предложение.
4. **Редактируемый борд (parent/edit-роль):** добавить/убрать/переставить карточки, задать
   label/phrase/иконку (переиспользовать `AssetPicker`/`ImageUpload`). Ребёнку — только
   пользоваться.
5. **Нет карточек-пустышек:** каждая делает speak+event+фидбек. Порядок фиксирован (моторная
   память). Уважать сенсорный регулятор, ≥112px, токены, i18n.
6. Тесты: тап карточки → speak+event; редактирование борда; add-to-phrase.

## F3 — Тьютор функциональный
1. **TutorVoice:** реальная запись (F1) → STT → `addEvent('tutor_note')`; состояния записи/
   обработки/ошибки; появляется в ленте/отчёте тьютора.
2. **TutorAIReview:** заменить mock-flow на реальный `POST /api/ai/parse` по транскрипту →
   показать распарсенные события, правка, подтверждение → сохранение (как parent AIReview).
3. **TutorReport:** честно — «Копировать»/«Поделиться» через Web Share API/clipboard РАБОТАЕТ
   (не заглушка). «Отправить родителю» — либо через share, либо пометить DemoBadge (реальная
   доставка = когда будет sync/backend-канал; не выдавать фейк).
4. **TutorChildProfile:** реальные данные из сторов (события ребёнка, AAC-набор, прогресс);
   назначение/просмотр AAC-набора ребёнка (из cardConfigs). Мультиребёнок (E7.3 `useCurrentChild`).
5. Все экраны тьютора: DataState, честные состояния, токены, i18n, дисклеймеры.
6. Тесты: voice→tutor_note; AIReview реальный parse (мок api); report share; profile data.

## F4 — UI-полиш (E11 backlog + следующий GPT-раунд)
- **ParentProfile:** аватары ролей (не цветные квадраты) — реюз `IconRenderer`/asset или
  инициал-аватар.
- **ConfirmSheet:** coral-cue гаптик при открытии для тревожных/срочных действий (по
  сенсорному режиму, гейт reduced-motion).
- **CallMom:** редактируемые `messagePresets` (родитель настраивает быстрые фразы).
- **ChildSpeak:** TTS всей фразы после успешной записи (озвучить распознанное).
- Хук под следующий GPT-раунд по скринам — находки я оформлю отдельными тикетами.

---

## Проверки / отчёт (по каждому пакету)
```
cd apps/prototype && npm run typecheck && npm test && npm run build
git push -u origin feature/v1.6-F{N}-...
```
Отчёт по пакету: файлы; как протестировано (аудио — на реальном устройстве/браузере с mic);
матрица тестов; подтверждения по чек-листу пакета; 0 хардкод-hex, i18n, a11y; что осталось.
```
```
Зависимости: **F1 (аудио) — база для F3 (TutorVoice)**; F2/F4 независимы. Рекомендуемый
порядок: F1 → (F2 ∥ F3) → F4.
