# Design System — Qoldau AI

> Single source of truth for visual decisions. See also `src/styles/designTokens.ts` and `tailwind.config.js`.

## 1. Принципы

1. **Mobile-first**, потом tablet и desktop
2. **Soft, тёплый, дружелюбный** — не «больничный»
3. **Иерархия через размер и цвет**, не через декорации
4. **Минимум текста** в детском UI, максимум иконок/эмодзи
5. **Консистентность** — единые компоненты, единые отступы
6. **Доступность** — focus rings, ARIA, keyboard navigation

## 2. Цвета

Все цвета определены в `tailwind.config.js` и `src/styles/designTokens.ts`. **Запрещено** использовать hex вне этих токенов.

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

### Card

| Variant | Назначение |
|---------|-----------|
| `default` | Белая с тенью (основной) |
| `soft` | Серый фон |
| `tinted-*` | Pastel-фон (teal, blue, purple, yellow, coral, green) |

### Badge

Маленький chip для статусов, тегов, источников. Цветные варианты.

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
- `min-h-[110px]` для кнопок (touch target ≥ 96px)
- `text-3xl`–`text-4xl` для эмодзи
- pastel-фоны (`bg-[#E5F4FF]`, `bg-[#FFEDEA]` и т.д.)
- минимум текста (1–2 слова)
- большие иконки эмодзи
- in-app feedback вместо alert

## 10. Accessibility

- Все кнопки имеют `aria-label` если иконка без текста
- Семантические HTML (`<button>`, `<nav>`, `<header>`, `<main>`)
- Контраст текста ≥ 4.5:1
- Focus rings на интерактивных элементах
- Keyboard navigation работает

## 11. Анимации

| Анимация | Использование |
|----------|---------------|
| `animate-fade-in` | Появление toast, feedback |
| `animate-breathe` | Calm mode cloud |
| `animate-pulse-soft` | Recording indicator |
| `animate-slideUp` | Modal transitions |

Все анимации ≤ 1 секунды, без агрессивных таймингов.

## Связь с другими документами

- `UX_WRITING_GUIDE.md` — формулировки
- `SAFETY_WORDING.md` — запрещённые фразы
- `EVENT_MODEL.md` — данные
- `MVP_SCOPE.md` — что входит