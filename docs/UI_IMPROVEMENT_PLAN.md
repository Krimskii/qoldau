# Frontend Improvement Plan — Qoldau AI

> Документ описывает поэтапный план визуального и UX улучшения frontend MVP.
> Цель: довести визуальный и UX уровень до presentation-ready.
> Версия: v0.4.0 roadmap

## Референс

В качестве визуального ориентира используется изображение `Интерфейс устройства ребёнка` (10 экранов + нижняя панель принципов).

Ключевые черты референса:
- Тёплая палитра (teal/turquoise primary, soft pastel backgrounds)
- Крупные иллюстрированные кнопки
- Дружелюбный детский персонаж (динозавр, облако)
- Мягкие градиенты
- Эмодзи + текст везде
- «Я в порядке» как эмоциональный статус
- Now/Next как визуальное расписание
- Таймер «Сейчас / Потом» со стрелкой
- Достижения с эмодзи и цветными плашками

## Глобальные принципы (из референса)

1. **Крупные кнопки и большие зоны касания** — min 86px, желательно 100–120px
2. **Минимум текста** — короткие слова, эмодзи, иллюстрации
3. **Визуальные подсказки** — везде иконки, не только текст
4. **Голосовой ввод** — крупная круглая кнопка
5. **Выбор по оболочкам** — выбор из 2–4 крупных опций
6. **Сборка фраз** — из карточек-слов
7. **Спокойный режим** — как отдельный экран
8. **Безопасный вызов взрослого** — крупная SOS-кнопка

## Поэтапный план

### Этап 1 — Child interface (текущий)

**Приоритет: высокий.** Детский интерфейс — самый заметный и должен быть полированным.

| # | Задача | Сложность |
|---|--------|-----------|
| 1.1 | ChildHome — статус-бейдж «Я в порядке», аватар, 6 кнопок в правильной сетке | M |
| 1.2 | ChildCards — категоризация, крупные иллюстрированные карточки | M |
| 1.3 | ChildFavorites — full-bleed тайлы с градиентами | S |
| 1.4 | ChildSpeak — крупная круглая кнопка с волной | M |
| 1.5 | PhraseBuilder — фразы в чипах, динозавр-аватар | M |
| 1.6 | **Choice** — НОВЫЙ экран «Что ты хочешь?» (выбор 2x2) | S |
| 1.7 | NowNext — таймер + стрелка между «сейчас» и «потом» | M |
| 1.8 | CalmMode — спящее облако + таймер + опции | M |
| 1.9 | CallMom — контакт-карточки + SOS + сообщение | S |
| 1.10 | ChildProgress — карточка «Сегодня получилось!» + достижения | S |
| 1.11 | **ChildInterfaceGuide** — блок «Что важно» в настройках | S |
| 1.12 | Детские эмодзи/иллюстрации в карточках | S |

### Этап 2 — Parent interface

| # | Задача | Сложность |
|---|--------|-----------|
| 2.1 | ParentHome — карточка ребёнка с иллюстрацией, быстрые действия | M |
| 2.2 | VoiceObservation — плавная волна, таймер, крупная кнопка | M |
| 2.3 | AIReview — распарсенные события с иконками | S |
| 2.4 | EventTimeline — таймлайн с цветными точками | M |
| 2.5 | CareDiary — табы с цветными категориями | M |
| 2.6 | BehaviorSensory — эмоциональные индикаторы | M |
| 2.7 | ParentProfile — единый профиль с командой | S |

### Этап 3 — Tutor interface

| # | Задача | Сложность |
|---|--------|-----------|
| 3.1 | TutorHome — расписание + быстрые заметки | M |
| 3.2 | TutorVoice — упрощённый ввод | S |
| 3.3 | TutorReport — отчёт в формате сводки | M |
| 3.4 | TutorChildProfile — карточка ребёнка | S |

### Этап 4 — Specialist interface

| # | Задача | Сложность |
|---|--------|-----------|
| 4.1 | SpecialistDashboard — KPI карточки с трендами | M |
| 4.2 | ABCAnalysis — визуальные A/B/C колонки | M |
| 4.3 | CommunicationProfile — сигналы с confidence | M |
| 4.4 | SupportPlan — структурированный план | S |

### Этап 5 — Overview

| # | Задача | Сложность |
|---|--------|-----------|
| 5.1 | Overview — главная цепочка как интерактивная диаграмма | M |
| 5.2 | Overview — секция «Заложенные методики» | S |
| 5.3 | Overview — CTA для каждой роли крупные | S |

### Этап 6 — Global polish

| # | Задача | Сложность |
|---|--------|-----------|
| 6.1 | Унифицированные loading/skeleton состояния | M |
| 6.2 | Анимации переходов между экранами | M |
| 6.3 | Empty states с иллюстрациями | S |
| 6.4 | Toast — цветные варианты для разных типов | S |
| 6.5 | Accessibility — focus rings, ARIA, контраст | M |

## Текущий фокус — Этап 1 (Child interface)

Референс определил следующие экраны:

1. **Главная** — приветствие, статус, 6 кнопок, Now/Next
2. **Быстрые карточки** — 4×3 сетка AAC-карточек
3. **Любимые мультики** — 2 колонки full-bleed тайлов
4. **Сказать** — крупная зелёная кнопка с волной
5. **Сборщик фразы** — словесные чипы + готовая фраза
6. **Выбор** — 2×2 крупных варианта
7. **Сейчас/Потом** — таймер + стрелка
8. **Спокойный режим** — спящее облако + опции
9. **Позвать маму** — контакты + SOS
10. **Прогресс общения** — праздничная карточка + достижения

### Текущий статус

| Экран | Статус | Что сделать |
|-------|--------|-------------|
| ChildHome | Базовая версия | Добавить статус-бейдж «Я в порядке», иллюстрированный header |
| ChildCards | Базовая версия | Категоризация, более крупные карточки |
| ChildFavorites | Базовая версия | Full-bleed тайлы с градиентами |
| ChildSpeak | Базовая версия | Анимация волны при записи |
| PhraseBuilder | Базовая версия | Чипы как в референсе, динозавр-аватар |
| **Choice** | ❌ Отсутствует | Создать с нуля |
| NowNext | Базовая версия | Таймер + стрелка между блоками |
| CalmMode | Базовая версия | Облако-маскот, мягкая анимация |
| CallMom | Базовая версия | Улучшить SOS-секцию |
| ChildProgress | Базовая версия | Карточка «Сегодня получилось!» |

### План реализации (Этап 1)

**Сессия 1 (текущая):**
1. ✅ Создать план
2. ChildHome — статус-бейдж, иллюстрированный header
3. ChildCards — категоризация, крупные карточки
4. ChildSpeak — улучшенная волна и кнопка

**Сессия 2:**
5. PhraseBuilder — чипы + динозавр
6. Choice (новый) — 2×2 выбор
7. NowNext — таймер + стрелка

**Сессия 3:**
8. CalmMode — облако-маскот
9. CallMom — полированный SOS
10. ChildProgress — праздничная карточка

**Сессия 4:**
11. ChildInterfaceGuide (настройки «Что важно»)
12. Итоговая проверка build + commit + push

## Принципы визуального стиля

### Палитра

| Token | Цвет | Назначение |
|-------|------|-----------|
| teal | #07958B | Primary, кнопки, ссылки |
| teal-dark | #075E59 | Hover, градиенты |
| teal-soft | #DDF5F0 | Фоны, бейджи |
| mint | #BFECE4 | Акценты, иллюстрации |
| blue | #2385D6 | Информационные блоки |
| blue-soft | #E8F3FF | Информационные фоны |
| purple | #7C5CCB | тьютор, спокойный режим |
| purple-soft | #F0EBFF | Фоны |
| yellow | #E3A62F | Светофоры, тултип |
| yellow-soft | #FFF3D8 | Фоны |
| coral | #E56F5D | SOS, предупреждения |
| coral-soft | #FFEDEA | Фоны |
| green | #2E9F6E | Успех, подтверждения |
| green-soft | #E9F8F0 | Фоны |

### Типографика

- Заголовки: `font-black` или `font-extrabold`, от 14px до 24px
- Тело: `text-xs` (12px) до `text-base` (16px)
- Кнопки: `font-bold`, минимум `text-xs`

### Скругления

- Кнопки: `rounded-2xl` или `rounded-xl`
- Карточки: `rounded-2xl`
- Бейджи: `rounded-full`

### Тени

- `shadow-card-soft` — основная
- `shadow-card` — усиленная

## Связь с другими документами

- `MVP_SCOPE.md` — что входит в Demo MVP
- `UX_WRITING_GUIDE.md` — формулировки
- `SAFETY_WORDING.md` — что нельзя писать
- `EVENT_MODEL.md` — какие события создаются
- `CHILD_INTERFACE_GUIDE.md` — правила детского интерфейса
- `SENSORY_SAFE_DESIGN_GUIDE.md` — палитра, анимация, reduced-motion, SVG-иллюстрации

## v0.3.8 — Sensory-safe SVG visual polish

**Цель:** мягкие animated SVG-иллюстрации вместо/рядом с эмодзи, спокойная палитра, безопасные анимации.

### Что сделано

- **`src/components/illustrations/`** — новые компоненты:
  - `CloudMascot` (mood: `calm` / `happy` / `sleepy`) — для CalmMode и EmptyState.
  - `DinoMascot` — для ChildHome hero и PhraseBuilder.
  - `SuccessSparkle` — success-обратная связь.
- **CSS-анимации в `src/styles/globals.css`** — `qoldau-breathe`, `qoldau-float`, `qoldau-soft-pulse`, `qoldau-check`. Поддержка `prefers-reduced-motion: reduce`.
- **`EmptyState`** теперь может показывать `CloudMascot` вместо эмодзи (`useCloud` / `cloudMood` props).
- **`ChildHome`** — DinoMascot в hero, мягкий gradient-фон, спокойные pressed states.
- **`CalmMode`** — CloudMascot, поддерживающие тексты, 6 спокойных опций (без тревожного красного).
- **`PhraseBuilderPage`** — DinoMascot маленький сбоку, мягкая подсветка выбранных слов, SuccessSparkle после сборки.
- **`ChildCards`** — success-карточка с SuccessSparkle вместо alert. Не сломано создание `aac_card` event.
- **`ChildProgress`** — SuccessSparkle в hero, мягкие supporting copy («У тебя получается», «Спасибо, что показал»).
- **`docs/SENSORY_SAFE_DESIGN_GUIDE.md`** — новый документ с принципами, палитрой, правилами анимации, touch-targets.

### Что НЕ меняли

- Event Timeline logic, `useEventStore`, `useVoiceObservationStore`, STT/AI abstraction, routes, demo dataset, product logic.
- Создание событий (ChildCards → `aac_card`, PhraseBuilder → `phrase`, CalmMode → `calm_mode`, CallMom → `sos`) работает как раньше.

## v0.3.8 — Icon system + soft gamification

**Цель:** единый flat-icon-стек, минимальная анимация и мягкая геймификация для child UI.

### Foundation

- **`src/styles/designTokens.ts`** — добавлен export `qoldauColors` (короткий alias под спеку).
- **`src/styles/animations.css`** (новый файл) — все `qoldau-*` keyframes + utility classes + `prefers-reduced-motion: reduce`. Импортируется через `main.tsx`.
- **`src/styles/globals.css`** — убраны `qoldau-*` (теперь в `animations.css`).

### Иконки

- **`src/components/icons/index.tsx`** — 25 flat SVG-иконок (Water/Food/Toilet/Sad/Tired/Speak/Hug/Help/Yes/No/Other/Music/Breath/Headphones/Moon/Pause/Play/Favorites/Home/Sparkle/Check/ArrowRight/Bell/Settings/Sun/Chart/Calendar/Plus).
- Все: outline-only, 2px stroke, `currentColor` через `text-*`, 32×32 viewBox, optional `animated`.

### Универсальные компоненты

- **`QoldauIconCard`** (`src/components/ui/QoldauIconCard.tsx`) — универсальная карточка (AAC, calm options, choice). Props: icon/label/color/state/size.
- **`QoldauActionCard`** (`src/components/ui/QoldauActionCard.tsx`) — большая child-кнопка (min-h-110px).
- **`game/AchievementCard`** — карточка достижения.
- **`game/ProgressBadge`** — маленький badge для стрипа.
- **`game/DailyProgressStrip`** — горизонтальный strip из выполненных.

### Геймификация (без давления)

- **`lib/game/achievementRules.ts`** — 6 правил достижений, чистые `match()` функции над `QoldauEvent[]`:
  - `aac_card + cardLabel="Вода"` → «Попросил воду»
  - `aac_card + cardLabel="Туалет"` → «Попросил туалет»
  - `phrase` → «Собрал фразу»
  - `communication + source=voice` → «Попробовал сказать»
  - `calm_mode` → «Сделал паузу»
  - `sos` → «Позвал взрослого»
- **Без streaks / рейтингов / «проигрышей».** Подробно — [`GAMIFICATION_PRINCIPLES.md`](./GAMIFICATION_PRINCIPLES.md).

### Обновлённые child screens

- **`ChildHome`** — CTA «Позвать маму» в hero, `QoldauActionCard` для 6 actions.
- **`ChildCards`** — 11 AAC-карточек через `QoldauIconCard`, success feedback с `qoldau-success-pop`.
- **`CalmMode`** — 6 calm options через `QoldauIconCard` (цвета blue/green/purple/yellow/teal/coral).
- **`PhraseBuilderPage`** — `SuccessSparkle` overlay после отправки.
- **`ChildSpeak`** — `SpeakIcon` (flat) + `qoldau-soft-pulse` на микрофоне + `YesIcon`/`NoIcon` в feedback.
- **`CallMom`** — flat icons (`HugIcon`/`SpeakIcon`), SOS через `coralSoft` (не пугающий), `SuccessSparkle` feedback.
- **`ChildProgress`** — `AchievementCard` для 6 достижений + `DailyProgressStrip` для выполненных сегодня.

### Документация

- `docs/ICON_SYSTEM.md` (new) — каталог иконок, иллюстраций, универсальных компонентов.
- `docs/GAMIFICATION_PRINCIPLES.md` (new) — мягкая геймификация без давления.
- `docs/SENSORY_SAFE_DESIGN_GUIDE.md` (обновлён) — ссылка на icon system.
- `docs/DESIGN_SYSTEM.md` (обновлён) — упоминание QoldauIconCard/ActionCard.
- `docs/CHILD_INTERFACE_GUIDE.md` (обновлён) — ссылки на icon system и gamification.

## v0.3.12 — Visual refresh: design system consolidation

**Цель:** консолидировать визуальный слой. Каждый экран использует одни и те же компоненты, токены и badges — без inline-цветов и дублей.

### Phase A — Foundation

- **`src/styles/tokens.ts`** (new, consolidated) — single source of truth: `surface`, `ink`, `brand`, `accent`, `status`, `roleColors`, `eventTypeColors` (tone/emoji/label), `eventStatusColors`, `radii`, `spacing`, `shadow`, `motion`, `typography`, `layout`, `components`. Helpers: `eventTypeTone`, `eventTypeLabel`, `toneToColor`, `eventStatusLabel`. Re-exports `palette` + `qoldauColors` для обратной совместимости со старым `designTokens.ts`.
- **`src/components/icons/brand.tsx`** (new) — `QoldauLogoMark`, `QoldauLogoLockup`, `VoiceWaveIcon`, `EventTimelineIcon`, `AACCardIcon`, `CalmModeIcon`.
- **`src/components/icons/index.ts`** (renamed from `index.tsx`) — unified entry: brand + flat + lucide-react. `_flat.tsx` → `flat.tsx` (underscore prefix мешал re-export).
- **`src/components/ui/AppIcon.tsx`** (new) — wrapper для SVG/lucide. Нормализует size/color/strokeWidth/ariaLabel/filled. Lucide ForwardRef подходит благодаря permissive типизации `ComponentType<Record<string, unknown>>`.
- **`src/components/ui/QoldauCard.tsx`** (new) — единая карточка. Variants: `default` / `soft` / `elevated` / `tinted-{teal,blue,purple,yellow,coral,green,warm}` / `outline`. Padding: `none` / `sm` / `md` / `lg`. `hoverable` + `liftOnHover`. Заменяет inline `<div className="bg-white rounded-2xl ...">` ВЕЗДЕ.
- **`src/components/ui/Primitives.tsx`** (new) — `PrimaryAction`, `RoleBadge`, `EventTypeBadge`, `EventStatusBadge`, `MobileFrame`. EventTypeBadge и EventStatusBadge сами ходят в `tokens.ts` за тоном/лейблом — никаких magic strings в consumers.

### Phase B1 — Parent Event Timeline + Event Details

- **`EventTimeline`** — фильтры-чипсы с counts через `EventTypeBadge` (horizontal scroll). Day-grouped `<section>`. Hero с `EventTimelineIcon` + AI observation в `tinted-teal` QoldauCard.
- **`EventDetails`** — hero с tone-tinted icon container (`VoiceWaveIcon` для `voice_observation`, `EventTimelineIcon` иначе). AI hypothesis в `tinted-yellow` + «не диагноз». Suggestions в `tinted-warm` + явный disclaimer.

### Phase B2 — Parent voice flow

- **`VoiceObservation`** — полный state machine UI через `useVoiceObservationStore`. Idle: большая mic-кнопка 192×192 + «Использовать demo-текст» + «Ввести вручную». Recording: VoiceWave анимация + таймер + auto-stop hint. Transcript card через QoldauCard elevated. Editing mode: textarea + «Revert». Processing: tinted-teal card со спиннером. Demo disclaimer всегда сверху (tinted-warm).
- **`AIReview`** — transcript наверху с «Изменить» → `/parent/voice`. Parsed events: EventTypeBadge + confidence % + tone-tinted icon + «нужно подтвердить». AI insight в tinted-yellow + disclaimer «не диагноз». PrimaryAction + ghost fallback.
- **`ClarifyingQuestions`** — динамические вопросы из `parsedObservation.clarificationQuestions`, fallback на 3 default. Per-question QoldauCard tinted-blue + chip-ответы. Save через `createEventsFromAIReview` с answers payload.

### Phase B3 — Child UI

- **`CalmMode`** — 6 calm options через `QoldauIconCard` (purple/blue/green/yellow/teal/coral). Timer/start через QoldauCard elevated. PrimaryAction для start. Новый «Вернуться на главную» (interrupt с payload).
- **`PhraseBuilderPage`** — phrase card через QoldauCard tinted-blue. Send button через PrimaryAction. Success overlay через QoldauCard elevated. Lucide `ChevronLeft` + `Eraser` вместо unicode glyphs.
- **`ChildProgress`** — celebratory hero через QoldauCard tinted-yellow + SuccessSparkle. Top cards list через QoldauCard default. Footer «У тебя получается» через QoldauCard tinted-green.
- **`ChildFavorites`** — edit banner через QoldauCard tinted-yellow. Success toast (fixed bottom) через QoldauCard tinted-teal.
- **`ChildSpeak`** — heard card через QoldauCard tinted-teal + role/aria-live wrapper. Examples card через QoldauCard tinted-blue.

### Документация

- `docs/DESIGN_SYSTEM.md` — обновлён: tokens.ts как primary source, новые секции для QoldauCard, AppIcon, Primitives.
- `docs/UI_IMPROVEMENT_PLAN.md` — добавлена эта секция.
- `CHANGELOG.md` — запись v0.3.12.
- `VERSIONING.md` — Current Version → v0.3.12.
- `apps/prototype/package.json` → version `0.3.12`.

### Build

- `npm run build` passes — 1665 modules, 0 errors.
- 12 коммитов на `feature/v0.3.0-full-demo-mvp` ahead of origin.

### Что НЕ меняли

- Event Timeline data model, store-логика (`useEventStore`, `useVoiceObservationStore`, `useAssetStore`).
- Routes, demo flow, demo dataset.
- STT / AI abstraction (mock / future / types).
- Asset system (v0.3.10) — без изменений.
- Tutor и Specialist страницы — вне scope этого рефреша (можно сделать в v0.3.13+ при необходимости).