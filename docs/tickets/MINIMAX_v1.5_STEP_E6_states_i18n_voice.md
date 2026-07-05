# Ticket — MiniMax — v1.5 E6: состояния (loading/empty/error) + ErrorBoundary + остаток i18n + VoiceObservation

> Продолжение [MINIMAX_v1.5_frontend_completion.md](MINIMAX_v1.5_frontend_completion.md).
> E1–E5 закрыли честность состояний + i18n для auth/tutor/specialist/AIReview. E6 — самый
> ценный оставшийся блок для «работает у всех»: **единые состояния данных на ВСЕХ экранах,
> глобальный ErrorBoundary, остаток i18n (~1100 строк), доведение VoiceObservation.**
> Зона: **только `apps/prototype/**`.** База: `integration/v1.5` (после merge E1–E5, a08d710).
>
> ```
> git switch integration/v1.5 && git pull
> git switch -c feature/v1.5-E6-states-i18n
> ```

Дели на подшаги-коммиты E6.1…E6.5, каждый с прогоном `typecheck && test`.

---

## E6.1 — Глобальный ErrorBoundary + единые компоненты состояний
- **`components/ui/ErrorBoundary.tsx`** (class-компонент с `componentDidCatch`). Обернуть им
  контент в `AppShell` (и/или в `router.tsx` вокруг `<Routes>`). При любом рендер-краше —
  аккуратный экран: иконка, «Что-то пошло не так», кнопка **«Обновить»** (reload) и «На
  главную» (по роли/overview). Логировать в `utils/sentry` (если включён). НЕ белый экран.
- Ревизия существующих `EmptyState.tsx` / `Skeleton.tsx`: единый API, поддержка `title`,
  `description`, `icon`, `action` (CTA). Если чего-то нет — добавить.
- **`components/ui/ErrorState.tsx`** (новый, если нет): дружелюбная ошибка загрузки +
  кнопка «Повторить» (`onRetry`). Токены, i18n, a11y (`role="alert"`).
- Все три (`Skeleton`/`EmptyState`/`ErrorState`) — экспортить из `components/ui/index.ts`.

## E6.2 — Четыре состояния на КАЖДОМ data-экране
Пройти по всем экранам, где показываются списки/карточки/графики, и обеспечить
**loading → data → empty → error**. Приоритетные (сейчас часто только «data» или голый пусто):
- **Parent:** EventTimeline, EventDetails, CareDiary, BehaviorSensory, ParentNotifications,
  ParentAnalytics (heatmap/sensory уже имеют empty — привести к общему компоненту).
- **Tutor:** TutorHome, TutorChildProfile, TutorReport.
- **Specialist:** SpecialistDashboard, SpecialistEvents, ABCAnalysis, CommunicationProfile,
  CarePatterns, SupportPlan, Reports.
- **Child:** ChildFavorites (empty уже есть), ChildSpeak (recordings empty есть — свести к
  общему), ChildProgress.
Требование: ни одного «пустого места» без `EmptyState`, ни одного бесконечного спиннера,
любой сбой загрузки → `ErrorState` с «Повторить». Loading — `Skeleton`, без прыжков layout.

## E6.3 — Остаток i18n до паритета ru/kk/en (~1100 строк)
- Аудит хардкод-строк в JSX по `src/pages/**` и `src/components/**`. Известные крупные:
  **BehaviorSensory.tsx, AssetPicker.tsx, ImageUpload.tsx**, а также любые оставшиеся в
  parent/child/tutor/specialist, которые не попали в E1–E5.
- Вынести все видимые строки в `i18n/locales/ru.json`, затем **добить kk и en до полного
  паритета ключей** (никаких пустых/отсутствующих ключей; проверить программно — скрипт,
  сверяющий наборы ключей 3 файлов, положить в `test/i18nParity.test.ts`).
- Даты/числа/множественное число — через `utils/dateFormat` и i18n-плюрализацию.
- Проверить переключатель языка в профиле: меняет все экраны, персистится.

## E6.4 — VoiceObservation (центральный сценарий родителя) — вычистить 22 TODO/mock
- Полный путь: **запись → STT (`/api/stt`) → AI-parse (`/api/ai/parse`) → правка событий →
  сохранение в стор**. На реальном прод-бэке (`VITE_API_BASE_URL`), с честным офлайн-fallback
  на мок (пометить `DemoBadge`, когда fallback).
- Состояния: idle / запись (таймер, лимит) / обработка (skeleton) / результат / ошибка
  (`ErrorState` + повторить). Убрать все 22 TODO/mock-заглушки или заменить реальной логикой.
- ВАЖНО (урок бэка): транскрипт слать корректным UTF-8 JSON (fetch/axios это делают —
  не ломать кодировку кириллицы). Проверить, что RU/KK текст доходит целым.
- Тесты: happy-path (mock STT+AI), офлайн-fallback, ошибка сети.

## E6.5 — Детские под-экраны + консистентность
- `ChildWater.tsx`, `ChildFood.tsx`, `ChildToilet.tsx`, `ChildCategoryPage.tsx`, `NeedCard.tsx`
  — единый паттерн с ChildHome: таргеты ≥112px, TTS на тап, гаптик по сенсорному регулятору,
  лейблы по режиму (calm/standard/playful), токены, создание события в стор.
- Прогнать регресс D-фич (ConfirmSheet, медиа-обложки, fallback-карточки) — не сломаны.

---

## Общие требования (из раздела 0 базовой спеки — держать во всех подшагах)
0 хардкод-hex; a11y (aria, focus-ring, контраст, reduced-motion); тач-таргеты; дисклеймеры
на аналитике; 0 ошибок/warning в консоли; отзывчивость мобайл-first.

## QA-матрица (обязательно в отчёте)
Для каждой роли (4): все вкладки открываются; каждый экран показывает 4 состояния корректно;
каждая кнопка работает; назад/закрыть везде; **0 ошибок в консоли**; ru→kk→en полностью
переведено; офлайн (баннер + локальные данные); онлайн (голос/AI на прод-бэке).

## Проверки / отчёт
```
cd apps/prototype && npm run typecheck && npm test && npm run build
git push -u origin feature/v1.5-E6-states-i18n
```
Отчёт: файлы по подшагам; QA-матрица; typecheck/test(до/после)/build; подтверждения —
(1) ErrorBoundary ловит краши; (2) 4 состояния на всех перечисленных экранах; (3) i18n
паритет ru/kk/en (тест сверки ключей зелёный); (4) VoiceObservation без TODO, полный путь
работает + офлайн-fallback; (5) детские под-экраны консистентны; (6) 0 хардкод-hex, 0
консоль-ошибок. Что осталось (E7+) — честно.
