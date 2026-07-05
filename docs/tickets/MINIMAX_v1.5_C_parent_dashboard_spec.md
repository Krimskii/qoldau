# Ticket — MiniMax — v1.5 Дизайн C: взрослый мир — Родительский дашборд + Прогресс (пиксель-в-пиксель)

> Дизайн: [DESIGN_RESEARCH.md](../DESIGN_RESEARCH.md) + [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md).
> Зона: **только `apps/prototype/src/pages/parent/**`** (+ при нужде общие `components/ui/**`,
> но без ломающих правок для других ролей). База: `integration/v1.5` **после** merge B.
> Цель: довести взрослый мир до продуманного финального вида — как это сделали для ребёнка
> в A/B. Экраны уже есть и работают; здесь точная иерархия, размеры, состояния, токены и
> два обязательных фикса-дефекта.
>
> **Взрослый мир ≠ детский.** Сенсорный регулятор (calm/standard/playful) — детская фича,
> сюда НЕ тянем. Тон взрослого: «тихая уверенность» — спокойно, читаемо, без диагнозов.
> Тач-таргеты по взрослому токену (`adultTouchTarget: 48`, `iconButtonSize: 44`), НЕ 112px.

```
git switch integration/v1.5 && git pull   # B уже влит
git switch -c feature/v1.5-parent-dashboard-polish
```

Экраны в scope: `ParentHome.tsx` (дашборд) и `ParentAnalytics.tsx` (прогресс/аналитика).
Контейнер уже задаётся layout-обёрткой роли; внутри — `flex flex-col gap-5`.

---

## A. ParentHome — дашборд (структура сверху вниз)
```
[ Hero — карточка ребёнка ]      QoldauCard tinted-teal
[ CTA «Сказать наблюдение» ]     teal→teal-dark, min-h ≥ 76px
[ Строка-сводка дня (НОВОЕ) ]    3 мини-метрики
[ Быстрые действия 3×2 ]         min-h 88px
[ AI-наблюдение ]                AIInsightCard
[ Сегодня — последние события ]  SectionCard
[ Дисклеймер ]
```

### A1. Hero — карточка ребёнка
- Оставить `QoldauCard variant="tinted-teal"`, аватар `w-16 h-16 rounded-3xl`.
- **Фикс тач-таргета:** кнопка настроек сейчас `w-9 h-9` (36px) — поднять до **`w-11 h-11`
  (44px)**, `rounded-2xl`, иконка `w-5 h-5`. (Взрослый icon-button ≥ 44, токен `iconButtonSize`.)
- `StatusBadge` состояния ребёнка — оставить, но `kind` выбирать по `child.currentState`
  (ok/warn), не хардкодить `kind="ok"`.

### A2. CTA «Сказать наблюдение» — главное действие
- Оставить градиент `from-teal to-teal-dark` (токены), `rounded-3xl p-5`, `active:scale-[0.98]`.
- Тень при hover — `shadow-card-hover`; в покое `shadow-card`. **Никаких inline-hex.**
- Мин-высота фактически ~88px (иконка 56 + padding) — оставить, это ≥ 48 adult-target. ОК.

### A3. Строка-сводка дня (НОВОЕ) — 3 мини-метрики
- Под CTA, `grid grid-cols-3 gap-2.5`. Каждая ячейка — `QoldauCard padding="sm"`,
  внутри: крупное число `text-2xl font-black` + подпись `text-[11px] text-muted`.
- Метрики из `todayEvents` (уже считаются в компоненте):
  | ячейка | значение | подпись | цвет числа |
  |---|---|---|---|
  | 1 | `todayEvents.length` | Событий сегодня | `text-teal` |
  | 2 | кол-во `communication`+`aac_card` | Коммуникация | `text-purple` |
  | 3 | кол-во `sensory` | Сенсорика | `text-yellow` |
- Пустой день (0) — число `0`, подпись та же, без спец-состояния (сводка честная).

### A4. Быстрые действия — 3×2
- Оставить сетку `grid grid-cols-3 gap-2.5`, `min-h-[88px] rounded-2xl border border-line`.
- **Фикс консистентности иконок/цветов** — привести к семантике `eventTypeColors` (tokens.ts),
  сейчас «Туалет» и «Вода» обе `Droplet`+blue (неразличимы), а sleep/toilet цвета разошлись
  с токенами. Целевая таблица (порядок фиксирован):
  | # | label | иконка (lucide) | tone (из eventTypeColors) | path |
  |---|---|---|---|---|
  | 1 | Еда | `Utensils` | coral | /parent/care |
  | 2 | Вода | `Droplet` | blue | /parent/care |
  | 3 | Туалет | `Toilet` | purple | /parent/care |
  | 4 | Сон | `Moon` | blue | /parent/care |
  | 5 | Поведение | `Zap` | yellow | /parent/behavior |
  | 6 | Коммуникация | `MessageCircle` | purple | /parent/events |
- Фон ячейки — `bg-{tone}-soft`, иконка — `text-{tone}`, подпись `text-xs font-bold text-ink-2`.
- Состояния: `hover:scale-[0.97] active:scale-[0.94]`, `focus-visible:ring-2 ring-teal/40`.

### A5. AI-наблюдение
- Оставить `AIInsightCard` с текстом-наблюдением. Убедиться, что empty-текст (0 событий)
  ведёт на голос. Формулировки — наблюдение, не диагноз (уже так).

### A6. «Сегодня» — последние события
- Оставить `SectionCard` со списком `lastEvents` (4) и `action` «Все →».
- Разделители `border-b border-line-soft`, последняя строка без бордера (`last:border-0`).
- Пустое состояние: `text-sm text-muted text-center py-3` — оставить.

### A7. Дисклеймер
- `text-[11px] text-muted italic` — «Профиль наблюдений …. Не медицинский диагноз.» Оставить.

---

## B. ParentAnalytics — прогресс/аналитика

### B1. ⚠️ ФИКС-ДЕФЕКТ — donut «Распределение событий»
- **Сейчас баг:** `gradientStops` собирает `conic-gradient(${item.color} …)`, где `item.color`
  — это **имя Tailwind-класса** (`'bg-green'`), а не цвет. В CSS-строке `conic-gradient`
  это невалидно → сегменты не красятся (серый круг).
- **Фикс:** в `summary` хранить не класс, а **токен-цвет** (hex из `tokens.ts` через
  `toneToColor(tone)`), и подставлять его в градиент. Для легенды-точек рядом использовать
  тот же tone (`bg-{tone}` через className, а сам круг — через `style` с hex).
- Центр donut (`{total} событий`) и топ-3 легенда — оставить.

### B2. Тепловая карта недели
- Оставить как есть — логика корректна (`dayHourHeatmap`, 4 уровня `bg-teal/30…teal`,
  empty-state, легенда «Меньше→Больше», дисклеймер). Не трогать.

### B3. Сенсорный контекст
- Оставить (`grid grid-cols-5`, `bg-yellow-soft`, empty-state, дисклеймер).

### B4. Триггеры / Что помогало / Динамика
- Демо-данные — оставить значения, но пометить блоки подписью «демо» там, где её нет
  (у «Что помогало» уже есть; у «Триггеры»/«Динамика» добавить `text-[11px] muted italic`
  «Демо-пример. В след. версии — реальные подсчёты.»), чтобы не выдавать демо за факт.
- Прогресс-бары триггеров — ширина через `style={{ width }}`, цвет `bg-yellow` (токен). ОК.

### B5. PageHeader
- Оставить `PageHeader title="Аналитика" subtitle="Демо-данные за 7 дней"`.

---

## Поведение / общее для взрослого мира
| Аспект | Правило |
|---|---|
| Тач-таргет | кнопки/строки ≥ 48px; icon-button ≥ 44px |
| Focus | `focus-visible:ring-2 ring-teal/40` на всех интерактивных |
| Движение | `active:scale-[0.94–0.98]`; уважать `prefers-reduced-motion` |
| Тон | наблюдение, не диагноз; дисклеймер на каждом аналитическом блоке |
| Плотность | взрослая (компактнее ребёнка), НО скан-читаемая — `gap-5` между секциями |

## Токены (убрать хардкод)
- 0 inline-`#hex` в JSX. Все цвета — Tailwind-токены (`bg-*-soft`, `text-*`, `border-line`)
  или значения из `tokens.ts` (`toneToColor`, `eventTypeColors`) там, где нужен `style`
  (donut-градиент, прогресс-ширины).
- Радиусы/тени — только `rounded-{sm..3xl}`, `shadow-card/-hover` (никаких произвольных).

## Доступность
- `aria-label` на всех кнопках без видимого текста (settings, quick-actions уже есть).
- Donut — `aria-hidden`, данные дублируются текстом в легенде (уже так) — сохранить.
- Контраст текста метрик/подписей ≥ AA на своих фонах.

## Тесты / проверки / отчёт
- Обновить/добавить снапшоты: ParentHome (hero, CTA, сводка дня 3-метрики, 6 quick-actions
  в порядке, список «Сегодня»), ParentAnalytics (donut красится, легенда, heatmap/сенсорика).
- Тест на фикс donut: сегменты имеют не-серый `background` (проверка, что в градиенте hex,
  а не `bg-`-класс).
```
cd apps/prototype && npm run typecheck && npm test && npm run build
git push -u origin feature/v1.5-parent-dashboard-polish
```
Отчёт: файлы; вывод проверок; скрин/описание дашборда и аналитики; подтверждение —
(1) donut чинится, (2) settings-кнопка ≥44px, (3) quick-actions по семантике токенов,
(4) 0 хардкод-hex, (5) сводка дня добавлена, (6) все дисклеймеры на месте.
