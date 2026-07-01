# Icon System — Qoldau AI

> Единая система flat-иконок, иллюстраций и связанных компонентов.
> Все иконки в проекте рисуются в одном стиле: outline-only, 2px stroke, 32×32 viewBox.

## 1. Главные принципы

1. **Один стиль** — все иконки flat outline (без заливки), `currentColor` для цвета.
2. **Один размер viewBox** — 32×32 по умолчанию. Размер задаётся через `size` prop.
3. **Минимум анимации** — иконки статичны по умолчанию; `animated={true}` опционально вешает `qoldau-breathe`.
4. **Доступность** — каждая иконка имеет `role="presentation"` или `role="img"` + `aria-label`.
5. **Mobile-first** — оптимизированы под 32-44px touch-targets, чётко видны при `size={24}`.

## 2. Структура

| Папка | Содержит | Размер |
|-------|----------|--------|
| `src/components/icons/` | flat SVG-иконки | ~25 штук, в одном файле `index.tsx` |
| `src/components/illustrations/` | SVG-персонажи | `CloudMascot`, `DinoMascot`, `SuccessSparkle` |
| `src/components/ui/QoldauIconCard.tsx` | универсальная карточка | props: icon/label/color/state/size |
| `src/components/ui/QoldauActionCard.tsx` | большая child-кнопка | min-h-110, 6 цветов |
| `src/components/game/` | геймификация | `AchievementCard`, `ProgressBadge`, `DailyProgressStrip` |

## 3. Базовый API — `IconProps`

```ts
export interface IconProps {
  size?: number;             // default 32
  className?: string;        // text-* для цвета
  animated?: boolean;        // default false
  strokeWidth?: number;      // default 2
  'aria-label'?: string;     // если передан — role="img"
}
```

Использование:

```tsx
<WaterIcon size={42} className="text-[#1c6cb8]" />
<SparkleIcon size={14} animated aria-label="Успех" />
```

## 4. Каталог иконок

### Basic needs
`WaterIcon`, `FoodIcon`, `ToiletIcon`, `TiredIcon`, `SadIcon`

### Communication
`SpeakIcon` (a.k.a. `MicIcon`), `HugIcon`, `HelpIcon`, `YesIcon`, `NoIcon`, `OtherIcon`

### Activities & navigation
`MusicIcon`, `BreathIcon`, `HeadphonesIcon`, `MoonIcon`, `PauseIcon`, `PlayIcon`, `FavoritesIcon`, `HomeIcon`

### Utility
`SparkleIcon`, `CheckIcon`, `ArrowRightIcon`, `BellIcon`, `SettingsIcon`, `SunIcon`, `ChartIcon`, `CalendarIcon`, `PlusIcon`

## 5. Иллюстрации (`src/components/illustrations/`)

### `CloudMascot`
- Спокойное облачко. Mood: `calm` / `happy` / `sleepy`.
- `animated={true}` по умолчанию (qoldau-breathe).
- Где: CalmMode hero, EmptyState, EmptyState (mood="sleepy").

### `DinoMascot`
- Дружелюбный динозаврик.
- `animated={true}` по умолчанию (qoldau-float).
- Где: ChildHome hero, PhraseBuilder.

### `SuccessSparkle`
- Мягкая success-галочка в pastel-круге.
- Всегда one-shot `qoldau-success-pop` (420ms).
- Где: ChildCards feedback, PhraseBuilder success, ChildProgress hero, CallMom feedback.

## 6. Универсальные карточки

### `QoldauIconCard`

Универсальная плоская карточка с иконкой. Используется для:
- AAC-карточек (ChildCards): 11 в сетке 3-4 колонки.
- Calm options (CalmMode): 6 опций.
- Choice варианты (ChildChoice).

Props:
```ts
{
  icon: IconComponent;
  label: string;
  subtitle?: string;
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'teal' | 'coral';
  state: 'default' | 'pressed' | 'selected' | 'success';
  size: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}
```

Цвета берутся из спек-палитры (см. [`SENSORY_SAFE_DESIGN_GUIDE.md` § 4](./SENSORY_SAFE_DESIGN_GUIDE.md)).

### `QoldauActionCard`

Большая child-кнопка (min-h-110px). Используется для ChildHome 6 actions.

## 7. Геймификация (`src/components/game/`)

### `AchievementCard`
Карточка достижения с иконкой + статус (сделано / Скоро!).

### `ProgressBadge`
Маленький badge для горизонтального стрипа.

### `DailyProgressStrip`
Горизонтальная полоса из выполненных сегодня достижений. Если ни одно не выполнено — ничего не рендерит.

## 8. Правила использования

### Цвета через `currentColor`

Не задавайте иконкам цвет через `style`. Используйте Tailwind `text-*`:

```tsx
// ✅ Правильно
<WaterIcon size={42} className="text-[#1c6cb8]" />

// ❌ Неправильно
<WaterIcon size={42} style={{ color: '#1c6cb8' }} />
```

### Размер

- Action-кнопки на child home: `size={42}`.
- AAC-карточки: `size={36}` (через QoldauIconCard size="md").
- Top cards list: `size={26}`.
- Hero mascot: `size={64-96}`.

### Анимация

Только когда она помогает:
- **Mascot** — всегда `qoldau-breathe` / `qoldau-float` (мягкая живость).
- **Микрофон перед записью** — `qoldau-soft-pulse` (привлекает внимание).
- **Success feedback** — `qoldau-success-pop` один раз (подтверждение).
- **Никогда** — на обычных action-кнопках.

### `prefers-reduced-motion`

Все `qoldau-*` анимации отключаются через CSS media query (см. `src/styles/animations.css`). Не нужно отдельно проверять — работает автоматически.

## 9. Чек-лист перед добавлением новой иконки

- [ ] 32×32 viewBox.
- [ ] Outline-only (без заливки), `stroke="currentColor"`.
- [ ] `stroke-width="2"` (или другой, но осмысленный).
- [ ] `stroke-linecap="round"` и `stroke-linejoin="round"`.
- [ ] `aria-label` через props, или `aria-hidden="true"` если декоративная.
- [ ] Добавлена в каталог (§ 4) с описанием.
- [ ] Используется минимум в одном месте в коде (иначе удалить).