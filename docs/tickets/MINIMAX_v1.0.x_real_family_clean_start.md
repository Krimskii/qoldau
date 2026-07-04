# Ticket — MiniMax — v1.0.x Батч 6: чистый старт реальной семьи (demo↔real)

> База: `release/v1.0rc-wave0-gate`. **Приоритет: высокий** (Wave-0 блокер).
> Архитектура дизайна — Claude (ниже готовый контракт). Зона: **только `apps/prototype/**`.**

## Проблема
`useEventStore` при пустой ленте всегда сидит демо-события, а онбординг реальной
семьи (`FamilySetupCard`) их не чистит. Итог: пилотная семья видит 60 событий
«Алихана» вперемешку со своими. Нужен явный режим профиля: **demo** (сид, для
изучения) vs **real** (чистый старт, только свои события).

## Контракт (реализовать точно так)
1. **`src/data/demoDataset.ts`** — добавить рядом с `getFamilyChildName`:
   - `getProfileMode(): 'demo' | 'real'` — читает `localStorage['qoldau-profile-mode-v1']`,
     **default `'demo'`** (существующие юзеры остаются с демо — обратная совместимость).
   - `setProfileMode(mode: 'demo' | 'real'): void`.
2. **`components/ui/FamilySetupCard.tsx` → `handleSave`** (после `setFamilyChildName`):
   - `setProfileMode('real')`;
   - `useEventStore.getState().clearAll()` и `useRecordingsStore.getState().clearAll()`
     (стереть демо перед стартом реальной семьи);
   - затем уже существующий `window.localStorage.setItem('qoldau-tutorial-pending-v1','1')` + reload.
3. **`store/useEventStore.ts` → `onRehydrateStorage`**: сидить демо ТОЛЬКО если
   `getProfileMode() !== 'real'`. В real-режиме пустая лента → честный empty-state
   (в EventTimeline он уже есть: «добавьте наблюдение голосом»).
4. **`pages/overview/Overview.tsx` → `handleStartDemo`**: `setProfileMode('demo')` +
   пересидить демо (`ensureDemoEvents()` / clear+seed), чтобы кнопка «Запустить демо»
   по-прежнему давала полноценный демо-прогон.
5. **Reset-контрол** (`useDemoControlsStore` «Сбросить»): остаётся демо-режимом,
   формулировка честная («Восстановить демо»), не путать с реальными данными.

## Тесты
- `useEventStore`: в real-режиме пустая лента НЕ пересидивается; в demo — сид есть.
- FamilySetupCard: сохранение реального имени переводит в real + чистит события.

## Проверки / commit / отчёт
```
cd apps/prototype && npm run typecheck && npm test && npm run build
git commit -m "feat(onboarding): real-family clean start (demo↔real profile mode)"
```
Ветка — та же `feature/v1.0.x-functional-buttons` (это ЧЕТВЁРТЫЙ коммит, желательно
ПЕРВЫМ по порядку среди батчей), либо отдельная `feature/v1.0.x-real-family` если так удобнее.
Отчёт: файлы, вывод проверок, подтверждение: реальная семья стартует с пустой лентой,
демо по-прежнему работает через «Запустить демо».
