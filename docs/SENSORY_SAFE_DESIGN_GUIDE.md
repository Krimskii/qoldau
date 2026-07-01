# Sensory-safe Design Guide

> Принципы дизайна для детей с РАС (расстройствами аутистического спектра).
> Применяются ко всем child screens и ко всему, что ребёнок видит на устройстве.

## 1. Формула Qoldau

```
спокойно + понятно + крупно + предсказуемо + немного волшебно
```

Не «яркий детский сад», а **мягкий интерфейс поддержки**.

## 2. Должно быть

- Крупные карточки (touch-target ≥ 88×88px, желательно 110×110px).
- **1 действие на карточку** — никаких двойных тапов, swipe-жестов в одном элементе.
- Максимум **2–3 слова** на карточке.
- Мягкие пастельные цвета (см. § 4).
- Простые иллюстрации (CloudMascot, DinoMascot, SuccessSparkle).
- Плавная анимация (см. § 5).
- Понятный feedback после нажатия (success-карточка, не `alert`).
- Минимум текста, минимум отвлекающих элементов.
- Предсказуемая навигация (назад всегда возвращает туда, откуда пришли).

## 3. Не должно быть

- Мигания, strobe-эффектов, быстрых вспышек.
- Резких переходов, shake-loops.
- Слишком яркого красного (только как alert-critical, и то в small inline).
- Сложных фонов (градиенты — мягкие, не более 2 цветов).
- Мелких кнопок (< 72px).
- Частой анимации (> 1 loop-анимации на экране).
- Перегруза emoji (> 1 на карточку).
- «Весёлой суеты» — много одновременных движущихся элементов.

## 4. Палитра

`src/styles/globals.css` уже задаёт CSS-переменные. В SVG-иллюстрациях
используются те же hex-значения.

```ts
export const qoldauColors = {
  bg: '#F7FAFA',
  surface: '#FFFFFF',
  surfaceSoft: '#F9FCFC',

  ink: '#071B3A',
  inkSoft: '#344B68',
  muted: '#6B7C8F',
  line: '#DDE8EA',

  teal: '#009688',
  tealDark: '#00796F',
  tealSoft: '#DDF5F0',

  skySoft: '#EAF5FF',
  greenSoft: '#EAF8F0',
  lavenderSoft: '#F1EDFF',
  yellowSoft: '#FFF6DF',
  coralSoft: '#FFEAEA',

  success: '#4EC28A',
  warning: '#F7C948',
  calmBlue: '#DCEEFF',
  calmPurple: '#ECE7FF',
};
```

**Правило:** на одном child screen не больше **3–4 акцентных цветов** одновременно.
Базовый фон + surface всегда нейтральные.

## 5. Правила анимации

### 5.1 Allowed

| Тип | Длительность | Где используется |
|---|---|---|
| `qoldau-breathe` | 4s loop | CloudMascot, спокойные state-плашки |
| `qoldau-float` | 5s loop | DinoMascot |
| `qoldau-soft-pulse` | 3.2s loop | Мягкий glow вокруг активного элемента (опц.) |
| `qoldau-check` | 420ms one-shot | SuccessSparkle после действия |
| Transition transform | 120–180ms | Button press, card hover |
| Card transition | 200–300ms | Page entrance, modal |
| Page element entrance | 250–400ms | List item fade-in |

### 5.2 Forbidden

- Flashing (любые `0%/50%/100%` keyframes с `opacity 0 → 1` быстрее 800ms).
- Strobe (периодические резкие изменения яркости).
- Shake loops.
- Fast bounce (любой `cubic-bezier` с overshoot > 1.05).
- Aggressive zoom (scale > 1.15).
- Rapid color switching.
- Infinite sparkles everywhere (максимум 1 success-элемент на действие).

### 5.3 Motion duration

- Button press: **120–180ms** (`transition-transform duration-200`).
- Card transition: **200–300ms**.
- Page element entrance: **250–400ms**.
- Calm looping motion: **3–5s** (breathe, float).

### 5.4 Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  .qoldau-breathe,
  .qoldau-float,
  .qoldau-soft-pulse,
  .qoldau-check {
    animation: none !important;
  }
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
  }
}
```

**Поведение при `prefers-reduced-motion: reduce`:**

- Отключить все loop-анимации (breathe, float, soft-pulse).
- Отключить decorative transitions (qoldau-check оставить, т.к. это essential feedback).
- Сохранить essential state changes (pressed state, navigation transitions).

## 6. Touch targets

| Элемент | Минимум | Рекомендуется |
|---|---|---|
| Action card | 72×72 | 110×110 |
| AAC card | 88×88 | 110×110 |
| Back button | 40×40 | 44×44 |
| Close button | 40×40 | 44×44 |

Между активными элементами минимум **8px** пустого пространства.

## 7. Правило «1 действие на карточку»

Каждая карточка/кнопка должна иметь **ровно одно** действие:

- Tap → ровно один эффект (навигация / отправка события / toggle).
- Никаких вложенных кнопок.
- Никаких context-menu по long-press на child screens.

## 8. Copy

- Короткие, конкретные слова: «Вода», «Туалет», «Помощь», «Пауза».
- Поддерживающие формулировки на CalmMode: «Ты в безопасности», «Можно отдохнуть», «Я рядом».
- Никаких оценок: «Молодец!» — да, «Ты плохо себя ведёшь» — никогда.
- Success-тексты короткие: «Мама увидит запрос», «Событие сохранено».

## 9. Компоненты-иллюстрации (v0.3.8)

| Компонент | Файл | Когда использовать |
|---|---|---|
| `CloudMascot` | `src/components/illustrations/CloudMascot.tsx` | CalmMode hero, EmptyState (mood="sleepy") |
| `DinoMascot` | `src/components/illustrations/DinoMascot.tsx` | ChildHome hero, PhraseBuilder, EmptyState |
| `SuccessSparkle` | `src/components/illustrations/SuccessSparkle.tsx` | После выбора карточки, после сборки фразы, в ChildProgress |

Все три компонента:
- Принимают `animated?: boolean` (по умолчанию `true`).
- Имеют `aria-label`.
- Поддерживают `prefers-reduced-motion` автоматически (через CSS-классы).

## 10. Чек-лист перед релизом child UI

- [ ] Нет flashing / shake / strobe / fast bounce.
- [ ] Каждая анимация имеет осмысленную причину.
- [ ] Touch-targets ≥ 88×88 (action cards) / ≥ 40×40 (chrome).
- [ ] Не более 1 loop-анимации на экране.
- [ ] Не более 3–4 акцентных цветов на экране.
- [ ] Все success-состояния — soft card, не `alert`.
- [ ] Все SVG-иллюстрации имеют `aria-label`.
- [ ] Тестируется с `prefers-reduced-motion: reduce` (DevTools → Rendering → Emulate).
- [ ] Тестируется в Safari iOS + Chrome Android (touch).