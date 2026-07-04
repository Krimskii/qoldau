# Ticket — MiniMax — v1.0.x функциональная завершённость (батчи 3–4–5)

> База: `release/v1.0rc-wave0-gate` (HEAD 80bb680 — содержит per-device сторы).
> План: [WORKPLAN.md](../WORKPLAN.md) Часть A. Дизайн: [TECH_DECISIONS.md](../TECH_DECISIONS.md) Child UI Principles.

Роль: Frontend (React/TS). **Зона: только `apps/prototype/**`.** НЕ трогать `apps/api`, `docs`.

```
git switch release/v1.0rc-wave0-gate && git pull
git switch -c feature/v1.0.x-functional-buttons
```
Три батча = **три отдельных коммита** на одной ветке (3 → 4 → 5).

---

## Коммит 1 — Батч 3: «говорящие карточки» (TTS) + покрытие логированием
Цель: детский AAC реально **озвучивает** нажатую карточку (ядро AAC), и каждое
действие ребёнка попадает в ленту событий.

1. **Новый util `src/lib/tts/speak.ts`:**
   - `speak(text: string, lang = 'ru-RU')` через `window.speechSynthesis` +
     `SpeechSynthesisUtterance`. Перед новой фразой — `speechSynthesis.cancel()`
     (не наслаивать). Guard: если `speechSynthesis` недоступен — тихий no-op.
   - Sensory-safe: `rate` ~0.95, обычная громкость, без резкости.
2. **Подключить `speak(label)` к нажатию карточек** во всех AAC-поверхностях:
   `pages/child/ChildCards.tsx`, `PhraseBuilderPage.tsx`, `ChildSpeak.tsx`,
   `NowNext.tsx`, `ChildFavorites.tsx`, `NeedCard.tsx`. Озвучивается подпись
   карточки/фразы («Хочу пить», «Ещё» и т.д.).
3. **Аудит логирования:** убедиться, что каждое нажатие пишет событие через
   `lib/events/eventFactory.ts` (`createAACEvent`/`createPhraseEvent`/
   `createCalmModeEvent`/`createSOSEvent`) в `useEventStore`. Где не пишет — дописать.
   (ChildCards уже пишет — проверить остальные экраны.)
4. Тест: `src/lib/tts/speak.test.ts` — mock `speechSynthesis`, проверить
   cancel-before-speak и no-op при отсутствии API.

**Критерии:** тап по карточке → слышно озвучку + событие в parent timeline.
Никаких emoji-кнопок (только IconRenderer), без medical claims.

---

## Коммит 2 — Батч 4: демо-гид «18 экранов» не наезжает на живые экраны
Цель: guided-тур (`store/useDemoStore.ts` 18 шагов + `components/layout/DemoIndicator.tsx`)
показывается **только в демо-режиме** и не перекрывает реальные экраны/запись.

1. В `DemoIndicator.tsx`: рендерить оверлей-плашку **только когда демо-тур активен**
   (флаг из `useDemoStore`, напр. `isRunning`/`step > 0`) И роль/поток реальные —
   НЕ показывать поверх `VoiceObservation`, реального ребёнка, consent.
2. Исправить **z-index/позиционирование**: плашка не должна перекрывать
   интерактивную зону (кнопку записи, «Далее/Назад» самого тура). Bottom-safe-area.
3. Кнопка «×» реально останавливает тур (сброс шага в `useDemoStore`), после
   закрытия оверлей не возвращается до повторного «Запустить демо».
4. Проверить на реальном флоу: старт записи голоса → плашки тура НЕТ.

**Критерии:** в реальном использовании (не демо) оверлея тура нет; в демо —
плашка внизу, не перекрывает контент, закрывается насовсем.

---

## Коммит 3 — Батч 5: экраны на реальных данных (убрать хардкод-демо)
Цель: отчёты/дашборды считают из **реальной** ленты `useEventStore`, а не из
захардкоженного «Алихан, 4 года / 32 события».

1. **`pages/specialist/Reports.tsx`** — заменить хардкод («Алихан, 4 года»,
   «32 события», «12 эпизодов», даты) на значения из `useEventStore` для текущего
   ребёнка (`getFamilyChildName()`/`DEMO_PRIMARY_CHILD`): реальные счётчики
   событий, реальное имя. Если событий мало — честный текст, не выдуманные числа.
2. **Аудит остальных экранов** на хардкод-числа/имена и привязка к стору:
   `SpecialistDashboard.tsx`, `CommunicationProfile.tsx`, `tutor/TutorReport.tsx`,
   `parent/ParentAIChat.tsx`. (Analytics/BehaviorSensory/ABC/CarePatterns уже
   читают из стора — только сверить.)
3. Пустое состояние везде честное: «Пока мало наблюдений — добавьте голосом».

**Критерии:** ни одного выдуманного числа на видимом экране; всё из реальной
ленты или честный empty-state. Формулировки — по SAFETY_WORDING (не диагноз).

---

## Проверки (перед каждым push)
```
cd apps/prototype
npm run typecheck && npm test && npm run build
```
Все три — зелёные. Тесты не ронять (сейчас 27/27).

## Commit + push
Три коммита с префиксами `feat(child): AAC TTS...`, `fix(ux): demo tour overlay...`,
`fix(data): reports/dashboards from real events...`. Затем:
```
git push -u origin feature/v1.0.x-functional-buttons
```

## Финальный отчёт (Claude сверит с кодом, не по словам)
- branch + 3 commit SHA;
- по каждому батчу: какие файлы, что сделано;
- вывод `typecheck && test && build`;
- что проверил на устройстве/в браузере (TTS слышно, тур не наезжает, числа реальные).
