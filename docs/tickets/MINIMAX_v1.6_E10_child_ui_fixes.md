# Ticket — MiniMax — v1.6 E10: Child UI fixes (по GPT-аудиту скринов APK, скорректировано под код)

> Зона: **только `apps/prototype/**`.** База: `integration/v1.5`. Ветка: `feature/v1.6-E10-child-ui`.
> Источник — дизайн-аудит по скринам APK. **ВАЖНО: аудит делался по картинкам, имена файлов/
> типов в нём выдуманы — ниже ПРАВИЛЬНЫЕ привязки. Часть находок уже сделана (не трогать/только
> проверить).** Делить на E10.1 (критичная база) и E10.2 (упрощение/честность).

## Карта: реальные файлы и типы (использовать ЭТИ, не из аудита)
- «Позвать взрослого» = `pages/child/CallMom.tsx` (НЕ CallAdult). ConfirmSheet «Срочно» уже
  подключён (Дизайн D) — не переписывать, чинить только safe-area/визуал.
- «Хочу пить» = `pages/child/ChildWater.tsx` (+ `NeedCard.tsx`). (НЕ PhraseIntent.)
- Сборщик фраз = `pages/child/PhraseBuilderPage.tsx`.
- «Сказать»/микрофон = `pages/child/ChildSpeak.tsx`.
- Спокойный режим/таймер = `pages/child/CalmMode.tsx`, расписание = `pages/child/NowNext.tsx`.
- Layout = `components/layout/AppShell.tsx` (НЕТ ChildShell), навбар = `components/layout/BottomNav.tsx`.
- События = `store/useEventStore.ts` (`addEvent`). Токены = `styles/tokens.ts`.
- Компоненты УЖЕ есть: `DataState`, `EmptyState`, `ErrorState`, `ConfirmSheet`, `DemoBadge`,
  `QoldauCard`, `SectionCard`, `PageHeader`, `StatusBadge` — переиспользовать.
- **Сенсорный регулятор УЖЕ есть** (`store/useChildSettingsStore.ts`, `styles/sensory.css`,
  calm/standard/playful) — finding #21 НЕ делать, только проверить, что новые элементы его уважают.
- **Канонические типы событий (использовать ТОЛЬКО их, НЕ выдуманные safety_call/now_next):**
  `aac_card`, `communication`, `phrase`, `voice_observation`, `sos` (=срочный вызов),
  `calm_mode`, `media_request`, `water`/`food`/`toilet`. (Таксономию закрепляет Codex-тикет
  event-taxonomy — при сомнении сверяйся с `styles/tokens.ts` eventTypeColors.)

---

## E10.1 — Критичная база (P0/P1: layout, safe-area, sheets)
1. **Bottom-sheet safe-area (P0).** ConfirmSheet (z-60 > nav z-40 — это НЕ z-index-баг) и
   message-sheet: добавить нижний `padding` = safe-area-inset-bottom (жест-бар) + запас, чтобы
   кнопки ✓/✕ и быстрые фразы НЕ прижимались к краю/не уходили под жест-бар. Проверить на
   390–430px: весь лист и кнопки видны, лист закрывается. Файлы: `components/ui/ConfirmSheet.tsx`,
   message-sheet в `CallMom.tsx`.
2. **Нижний padding контента под BottomNav (P1).** Убедиться, что во ВСЕХ детских экранах
   контент прокручивается выше навбара (последняя карточка/сетка слов видна). E8 добавил pb в
   AppShell — проверить, что этого хватает для PhraseBuilderPage (нижняя сетка слов) и списков;
   при нехватке — увеличить нижний отступ детских экранов (учесть `bottomNavClearance` из tokens).
3. **PhraseBuilderPage горизонтальный overflow (P1).** «Частые фразы» — горизонтальный
   scroll-контейнер с корректными отступами/snap, без обрезания текста на 390/430px.
4. **CallMom «Срочно» — визуальное отделение (P1).** Карточка «Срочно» должна отличаться от
   обычных (мягкий tone из токенов — coral-soft, иконка замка «нужно подтверждение»), но без
   тревожного красного. Действие только через ConfirmSheet (уже так — проверить). Цвета контактов
   Мама/Папа/Тьютор — из токенов (family/tutor/teal), 0 хардкод-hex.
5. **Success-честность (P1).** Убрать любые «успешные» блоки/галочки, видимые ДО действия
   (частично видимая зелёная карточка). Success — только после реального действия (DataState/
   toast) либо `DemoBadge`, если демо.

## E10.2 — Упрощение и честность (P1/P2)
6. **ChildWater «Хочу пить» — один сценарий (P1).** Сейчас мешаются заголовок + пустое поле +
   голос + сбор слов + отключённая «Озвучить фразу». Свести к: заголовок «Я хочу пить», один
   primary CTA («Сказать голосом»), secondary («Собрать из слов»); «Сказать вслух» активна
   только когда фраза собрана, с понятным disabled-объяснением. Действие → `addEvent`
   (`communication`/`aac_card`).
7. **ChildSpeak — убрать «взрослое» управление аудио (P1).** Список «Недавние записи» с
   play/clock/delete/таймингом — для child mode перегружен. В детском режиме: скрыть управление
   историей (или заменить спокойным DataState «Фраза отправлена взрослому»); демо-запись —
   `DemoBadge`; empty → `EmptyState`. История записей — прерогатива parent/tutor. После записи →
   `addEvent('voice_observation'|'communication')`.
8. **ChildSpeak — helper-текст по-детски (P2).** «Можно задать время воспроизведения ↓» →
   «Нажми и скажи» / «или выбери карточку». Без технических формулировок; влезает ru/kk/en.
9. **CalmMode — ясность + подписи (P1).** Экран «1:00» непонятен (таймер? покой?). Дать понятный
   заголовок; **каждой из 4 плиток — иконка + текст** (нет icon-only в детском режиме):
   «Пауза», «Дыхание», «Тихая музыка/Наушники», «Позвать взрослого». `aria-label` = видимый
   текст. Таргеты ≥112px. Выбор → `addEvent('calm_mode')`.
10. **PhraseBuilderPage — уровни сложности (P1).** Ввести `communicationLevel`
    (`beginner|basic|advanced`) в `useChildSettingsStore`: beginner — только быстрые фразы
    (≤4–6), basic — категории (6–9), advanced — полный сборщик. Режим из настроек ребёнка.
11. **UX-writing: убрать капс (P2).** «ЧАСТЫЕ ФРАЗЫ — ОДНО КАСАНИЕ» → «Частые фразы» (+подпись
    «Одно касание»); «СОБРАТЬ ИЗ СЛОВ» → «Собрать из слов». Sentence case, low-stimulation.
12. **Event Timeline полнота (P1).** Проверить, что КАЖДОЕ детское действие создаёт event через
    `addEvent` каноническим типом (карточка→`aac_card`, фраза→`communication`/`phrase`, голос→
    `voice_observation`, позвать→`communication`, срочно после подтверждения→`sos`, покой→
    `calm_mode`, медиа→`media_request`). Нет действий «в никуда». Срочный — только после ConfirmSheet.

## Общее (раздел 0 — во всех подшагах)
0 хардкод-hex (токены); i18n ru/kk/en (вынести любые новые строки, проверить длину kk/en в
карточках/навбаре); a11y (aria-label=видимый текст, focus-ring, контраст AA, reduced-motion +
сенсорный регулятор); тач-таргеты детские ≥112px; DataState на экранах с данными.

## Проверки / отчёт
```
cd apps/prototype && npm run typecheck && npm test && npm run build
git push -u origin feature/v1.6-E10-child-ui
```
Отчёт: файлы; до/после на 390 и 430px (sheets/overflow/nav-padding); подтверждение —
(1) sheets полностью видны + safe-area; (2) ничего не под BottomNav; (3) ChildWater — один CTA;
(4) ChildSpeak без взрослого аудио-управления; (5) CalmMode подписи; (6) уровни PhraseBuilder;
(7) канонические event-типы на все действия; (8) 0 хардкод-hex, i18n, a11y. Что осталось (E11).
