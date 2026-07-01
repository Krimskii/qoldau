# Design System — Qoldau AI

> Single source of truth for visual decisions. See also `src/styles/tokens.ts` (primary) + `src/styles/designTokens.ts` (legacy alias) and `tailwind.config.js`.
>
> **Для детского UI обязательно прочитай:**
> - [`SENSORY_SAFE_DESIGN_GUIDE.md`](./SENSORY_SAFE_DESIGN_GUIDE.md) — палитра, анимация, touch-targets, reduced-motion.
> - [`ICON_SYSTEM.md`](./ICON_SYSTEM.md) — flat-иконки, иллюстрации, QoldauIconCard/ActionCard.
> - [`GAMIFICATION_PRINCIPLES.md`](./GAMIFICATION_PRINCIPLES.md) — мягкая геймификация без давления.

## 1. Принципы

1. **Mobile-first**, потом tablet и desktop
2. **Soft, тёплый, дружелюбный** — не «больничный»
3. **Иерархия через размер и цвет**, не через декорации
4. **Минимум текста** в детском UI, максимум иконок/эмодзи
5. **Консистентность** — единые компоненты, единые отступы
6. **Доступность** — focus rings, ARIA, keyboard navigation

## 2. Цвета

Все цвета определены в `tailwind.config.js` и `src/styles/tokens.ts` (consolidated). Старый `src/styles/designTokens.ts` сохранён как legacy alias (re-exports `palette` + `qoldauColors`). **Запрещено** использовать hex вне этих токенов.

### Surface

| Token | Hex | Назначение |
|-------|-----|-----------|
| `bg` | #F7FAFA | Основной фон |
| `bg-soft` | #F0F7F7 | Альтернативный фон, секции |
| `panel` | #FFFFFF | Карточки |
| `panel-soft` | #F8FCFB | Мягкие карточки |

### Ink (текст)

| Token | Hex | Назначение |
|-------|-----|-----------|
| `ink` | #071B3A | Заголовки, основной текст |
| `ink-2` | #334E68 | Вторичный текст |
| `muted` | #6B7C8F | Третичный текст, лейблы |

### Border

| Token | Hex |
|-------|-----|
| `line` | #DDE8EA |
| `line-soft` | #EAF1F2 |

### Primary teal

| Token | Hex |
|-------|-----|
| `teal` | #009688 |
| `teal-dark` | #008C8C |
| `teal-light` | #00AFA5 |
| `teal-soft` | #DDF5F0 |
| `teal-tint` | #EAF8F6 |

### Semantic

| Token | Hex | Использование |
|-------|-----|---------------|
| `blue` | #2385D6 | Информация |
| `blue-soft` | #EAF5FF | Фон информации |
| `purple` | #7C5CCB | Тьютор |
| `purple-soft` | #F1EDFF | Фон тьютора |
| `yellow` | #F7C948 | Внимание |
| `yellow-soft` | #FFF6DF | Фон внимания |
| `coral` | #E56F5D | SOS, предупреждения |
| `coral-soft` | #FFEAEA | Фон предупреждения |
| `green` | #4EC28A | Успех |
| `green-soft` | #EAF8F0 | Фон успеха |

## 3. Типографика

| Уровень | Размер | Вес | Использование |
|---------|--------|-----|---------------|
| display | 32px | 900 | Главный заголовок на Overview |
| h1 | 24px | 900 | Заголовок страницы (PageHeader) |
| h2 | 20px | 800 | Подзаголовок |
| h3 | 16px | 800 | Заголовок секции |
| body | 14px | 500 | Обычный текст |
| bodyBold | 14px | 700 | Акцент в теле |
| caption | 12px | 500 | Подписи, мета |
| tiny | 11px | 600 | Disclaimer, очень мелкие подписи |

## 4. Скругления

| Token | px | Использование |
|-------|-----|---------------|
| `rounded-md` | 16 | Маленькие элементы |
| `rounded-xl` | 20 | Кнопки, мелкие карточки |
| `rounded-2xl` | 24 | Карточки (основной) |
| `rounded-3xl` | 28 | Большие hero-карточки |
| `rounded-full` | 9999 | Бейджи, круглые кнопки |

## 5. Тени

| Token | Использование |
|-------|---------------|
| `shadow-card` | Основная карточка |
| `shadow-card-soft` | Мягкая карточка, hover |
| `shadow-card-hover` | Hover-усиление |
| `shadow-inner` | Внутренняя подсветка (pastel-карточки) |
| `shadow-ring-teal` | Focus-ring на teal-кнопках |
| `shadow-ring-coral` | Focus-ring на SOS-кнопках |

## 6. Отступы

| Token | px |
|-------|-----|
| `pageX` | 16 (мобильный) / 24 (desktop) |
| `pageY` | 16 |
| `cardPadding` | 20 |
| `cardPaddingLg` | 24 |
| `sectionGap` | 16 |

## 7. Layout

| Контекст | max-width |
|----------|-----------|
| Child / Parent / Tutor (phone panel) | 430px |
| Specialist (tablet dashboard) | 1100px |
| Overview (investor deck) | 1100px |

Desktop центрирует phone-panel, как мокап приложения.

## 8. Компоненты

### Button (основной)

| Variant | Использование |
|---------|---------------|
| `primary` | Главные CTA (teal градиент) |
| `secondary` | Второстепенные (outline teal) |
| `outline` | Нейтральные outline |
| `ghost` | Текстовые |
| `danger` | SOS, удаление (coral) |
| `success` | Подтверждения (green) |
| `icon` | Круглые иконочные (44×44) |

### Card (`src/components/ui/QoldauCard.tsx`)

Единая карточка для ВСЕХ страниц. Заменяет inline `<div className="bg-white rounded-2xl ...">`.

| Variant | Назначение |
|---------|-----------|
| `default` | Белая с тонкой границей (основной) |
| `soft` | Серый фон |
| `elevated` | Белая с тенью (hero/CTA) |
| `tinted-teal` / `tinted-blue` / `tinted-purple` / `tinted-yellow` / `tinted-coral` / `tinted-green` | Pastel-фон с тонкой границей |
| `tinted-warm` | Нейтральный тёплый фон |
| `outline` | Пунктирная граница (placeholder, demo state) |

**Padding:** `none` / `sm` (p-3) / `md` (p-4) / `lg` (p-6).

**Props:** `variant`, `padding`, `hoverable` (cursor + hover shadow), `liftOnHover` (translate + усиленная тень), `onClick` (превращает в button с Enter/Space), `ariaLabel`, `className`.

### AppIcon (`src/components/ui/AppIcon.tsx`)

Wrapper для SVG/lucide компонентов. Нормализует size/color/stroke/aria-label/filled.

```tsx
<AppIcon icon={VoiceWaveIcon} size={24} colorClass="text-teal" />
<AppIcon icon={Settings} size={20} strokeWidth={2.5} ariaLabel="Настройки" />
```

Props: `icon: ComponentType<Record<string, unknown>>`, `size`, `colorClass`, `color`, `strokeWidth`, `ariaLabel`, `filled`. Lucide ForwardRef подходит благодаря permissive типизации.

### Primitives (`src/components/ui/Primitives.tsx`)

Переиспользуемые примитивы:

| Component | Назначение |
|-----------|-----------|
| `PrimaryAction` | Главная CTA-кнопка (teal градиент, full-width, size lg/md, onClick + variant + className) |
| `RoleBadge` | Бейдж роли (parent / child / tutor / specialist) с role-color |
| `EventTypeBadge` | Бейдж типа события (тон + эмодзи + label через `eventTypeColors`) |
| `EventStatusBadge` | Бейдж статуса события (draft / needs_review / ai_parsed / confirmed / corrected / rejected) |
| `MobileFrame` | Рамка мокапа приложения для десктопа (max-width 430, border-radius) |

### Badge

Маленький chip для статусов, тегов, источников. Цветные варианты.

Для событий: используй `EventTypeBadge` + `EventStatusBadge` из Primitives (тип/status-driven цвет и label через tokens). Для ролей: `RoleBadge`. Для остальных случаев: кастомный badge с pastel-палитрой из токенов.

### PageHeader

Заголовок страницы (h1, ink) + опциональный subtitle + опциональный back-кнопка + rightAction.

### AIInsightCard

Pastel teal-карточка с Sparkles-иконкой. Всегда включает disclaimer.

### BottomNav

Floating rounded card внизу. Для Parent — центральная floating teal-кнопка с микрофоном.

### AppShell

Wrapper для всех экранов кроме Overview. Phone-panel (max-width 430) на desktop, full-width на mobile.

### ChildSelector

Переключатель ребёнка для specialist-страниц.

## 9. Карточки детского UI

Детский интерфейс использует:
- `min-h-[128px]` для кнопок (touch target ≥ 96px, фактически 128px)
- **white bg + цветная рамка + цветной текст** (вместо pastel-фонов) для лучшего различения категорий
- минимум текста (1–2 слова)
- **soft 3D PNG иконки** (см. Hybrid Icon System ниже) вместо эмодзи/flat
- in-app feedback вместо alert
- **универсальные компоненты:**
  - `QoldauActionCard` (alias `ActionCard`) — 6 actions на ChildHome. `min-h 128px`, icon `56px`, border-2.
  - `QoldauIconCard` (alias `IconTile`) — AAC-карточки, calm options, choice варианты. Sizes: sm `88px/40 icon` / md `128px/56 icon` / lg `160px/72 icon`.
  - `QoldauCard` — обёртка для контента (timer, feedback, examples).
  - `SectionCard` — заголовок секции + QoldauCard.
  - `StatusBadge` — pill состояния (ok/help/calm/tired/focus/neutral).
  - `CalmPanel` — calming wrapper для CalmMode (CloudMascot + gradient bg + footer).

### Правила карточек ребёнка (v0.3.13)

Все child-карточки следуют единым правилам:

| Параметр | ActionCard | IconTile md | IconTile lg |
|----------|-----------|-------------|-------------|
| min-h | 128px | 128px | 160px |
| icon size | 56px | 56px | 72px |
| icon-text gap | 8px | 8px | 8px |
| border | 2px | 2px | 2px |
| border-radius | 24px | 24px | 24px |
| padding | 12px | 10px | 12px |
| label font | text-base font-black | text-base font-black | text-lg font-black |
| bg | white + цветная рамка | white + цветная рамка | white + цветная рамка |

**Spacing между карточками в сетке:** `gap-2.5` (10px).

**Цветовая схема (6-токен):** blue `#1c6cb8` / green `#158647` / purple `#5a3eb4` / yellow `#9a7820` / teal `#00796F` / coral `#cc251d`. Border и text берут один и тот же токен.

**States (обязательны все 4):**
- `default` — без модификаторов
- `pressed` — `scale-[0.96] opacity-90`
- `selected` — `ring-2 ring-offset-2 ring-teal/40 scale-[0.97]`
- `disabled` — `opacity-40 cursor-not-allowed` (не реагирует на click)

**Hover/active:** `active:scale-[0.96]`, focus `ring-2 ring-teal/40`.

### SVG-иллюстрации (v0.3.8)

- `src/components/illustrations/CloudMascot.tsx` — спокойное облачко (mood: `calm` / `happy` / `sleepy`).
- `src/components/illustrations/DinoMascot.tsx` — дружелюбный динозаврик.
- `src/components/illustrations/SuccessSparkle.tsx` — success-галочка после действия.

Все принимают `animated?: boolean` (по умолчанию `true`) и `className?`. Все имеют `aria-label`. Используются в ChildHome, CalmMode, PhraseBuilder, ChildCards, ChildProgress, EmptyState, CallMom.

## 10. Hybrid Icon System (v0.3.13)

Два разных стиля иконок, два разных назначения. **Не смешивать** в одном экране.

### Soft 3D PNG (action / event / mascot)

**Где:** `public/assets/icons/{actions,events,mascots}/*.png`.

**Что:** child-friendly 3D PNG ассеты (ChatGPT-generated, вручную отобраны по смыслу). 24 actions + 4 events + 2 mascots = 30 файлов.

**Имена файлов = функция:** `water.png`, `food.png`, `music.png`, `cloud-mascot.png` и т.д. — не `icon-001.png`.

**Использование в коде:** через `SOFT_FIRST_REGISTRY` в `src/components/icons/soft3d.tsx`. Ключи — это `builtinKey` из `assetRegistry` (`Water`, `Food`, `Music`, `Animals`, `Cartoon`, `Speak`, `Video`, `CloudMascot`, ...).

**Где используется:**
- `IconRenderer` — auto-fallback если soft версия есть.
- `ChildCards` — AAC карточки (auto через IconRenderer).
- `ChildHome` — 6 actions (явно импорт `WaterSoftIcon` etc.).
- `CalmMode` — 6 опций (явно импорт).
- `ChildProgress` — top cards.
- `AssetPicker` — выбор builtin ассетов.

### Lucide React (system icons)

**Где:** `node_modules/lucide-react`.

**Что:** tree-shakeable named imports. Используется для:
- `Bell` (уведомления в TopBar)
- `Home`, `Calendar`, `BarChart3`, `User`, `MessageCircle` (BottomNav)
- `Mic`, `Plus` (floating action buttons)
- `Settings`, `ChevronLeft` (header buttons)

**Стиль:** `strokeWidth 2-2.5`, size 20-24px, цвет через text-ink / text-muted.

### Граница ответственности

| Стиль | Где |
|-------|-----|
| Soft 3D PNG | Child-action кнопки, AAC карточки, маскоты, event icons |
| Lucide SVG | Navigation, header, settings, mic, system controls |
| Brand SVG (custom) | Логотип Qoldau, VoiceWave, EventTimeline, AAC, CalmMode |

### Запрещено

- Использовать emoji-кнопки в AAC (только asset icons через `IconRenderer`).
- Использовать flat SVG в child UI, если есть soft 3D версия для этого `builtinKey`.
- Использовать Lucide для иконок действий ребёнка (вода, еда, игры и т.д.).
- Смешивать стили в одной карточке (например, soft PNG + lucide accent).

## 10. Accessibility

- Все кнопки имеют `aria-label` если иконка без текста
- Семантические HTML (`<button>`, `<nav>`, `<header>`, `<main>`)
- Контраст текста ≥ 4.5:1
- Focus rings на интерактивных элементах
- Keyboard navigation работает

## 11. Анимации

| Класс | Где использовать | Длительность |
|-------|------------------|--------------|
| `qoldau-breathe` | CloudMascot, спокойные state-плашки | 4s loop |
| `qoldau-float` | DinoMascot | 5s loop |
| `qoldau-soft-pulse` | Мягкий glow вокруг активного элемента (опц.) | 3.2s loop |
| `qoldau-check` | SuccessSparkle после действия | 420ms one-shot |
| `animate-fade-in` | Toast, feedback | 250ms |
| `animate-pulse-soft` | Recording indicator | 1.6s |
| `animate-slideUp` | Modal transitions | 300ms |

**Sensory-safe правила (см. [`SENSORY_SAFE_DESIGN_GUIDE.md` § 5](./SENSORY_SAFE_DESIGN_GUIDE.md)):**

- Запрещены: flashing, strobe, shake loops, fast bounce, aggressive zoom.
- Loop-анимации на одном экране — максимум 1.
- При `prefers-reduced-motion: reduce` все `qoldau-*` loop-анимации отключаются через CSS.

## Связь с другими документами

- `UX_WRITING_GUIDE.md` — формулировки
- `SAFETY_WORDING.md` — запрещённые фразы
- `EVENT_MODEL.md` — данные
- `MVP_SCOPE.md` — что входит