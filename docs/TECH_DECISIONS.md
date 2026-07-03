# TECH_DECISIONS.md

## Решения по стеку и архитектуре

### Почему Vite (а не Next.js)

На первом этапе не нужен SSR, SEO, API routes. Vite даёт:
- Быструю разработку (HMR)
- Простую структуру
- Лёгкий переход в Expo/React Native

### Почему Zustand (а не Context)

- Проще API: `useStore(state => state.field)`
- Меньше boilerplate
- Перформанс: перерисовывается только нужный компонент
- Легко разделять на домены (useEventStore, useRoleStore)

### Почему Tailwind (а не CSS modules)

- Быстрая итерация в mockup-фазе
- Дизайн-токены в одном месте
- Легко адаптировать под mobile
- Можно вынести в design-tokens package

### Почему Lucide React (а не свои SVG)

- Готовые, качественные иконки
- Единый стиль
- Tree-shaking
- Легко заменить на кастомные

### Архитектура Event Timeline

Все сущности — события в единой ленте:
- `food` → питание
- `toilet` → туалет
- `behavior` → поведение
- `communication` → коммуникация
- `state` → состояние

Это обеспечивает:
- Консистентность данных
- Лёгкое добавление фильтров
- Единую аналитику

### STT — реально реализовано (v0.6.3+)

**STT = OpenAI Whisper**, opt-in через `WHISPER_API_KEY` (mock fallback без ключа).

- Backend: `apps/api/src/services/sttService.ts` — вызывает
  `https://api.openai.com/v1/audio/transcriptions` (`whisper-1`, override через
  `WHISPER_MODEL`). `sttService.status()` → `source: 'whisper' | 'mock'`.
- Frontend абстракция (mock/demo path) сохранена: `src/lib/stt/sttClient.*` +
  `useSpeechRecognition` (Web Speech API как браузерный fallback).

### AI Parser (LLM) — реально реализовано (v0.6.0+)

**LLM = Anthropic Claude**, opt-in через `ANTHROPIC_API_KEY` (mock fallback без ключа).

- Backend: `apps/api/src/services/llmService.ts` — `@anthropic-ai/sdk`, модель
  `claude-3-5-haiku-20241022` (override через `ANTHROPIC_MODEL`), structured
  output через `tool_use`. `llmService.status()` → `source: 'claude' | 'mock'`.
- Возвращает: parsed events, AI insight, clarification questions.
- Frontend mock-парсер (`src/lib/ai/aiParser.mock.ts`) остаётся для demo/offline.

> ⚠️ OpenAI используется **только** для Whisper STT. LLM-парсинг идёт через
> Anthropic Claude, не через OpenAI. `ANTHROPIC_API_KEY` ≠ `WHISPER_API_KEY`.

### Дизайн-токены

Цвета определены в:
- `tailwind.config.js` (extend.colors)
- `src/styles/globals.css` (CSS variables)
- `src/styles/tokens.ts` (consolidated: palette, roleColors, eventTypeColors, eventStatusColors, radii, spacing, shadow, motion, typography, layout)

Для mobile:
- Вынести в `/packages/design-tokens`
- Использовать Style Dictionary для iOS/Android

## Qoldau Child UI Principles

Принципы, по которым строится **детский UI** (роль `child` в `useRoleStore`).
Это не дизайн для всех экранов — только для поверхностей, на которые смотрит
ребёнок (ChildHome, ChildCards, CalmMode, ChildSpeak, NowNext, ChildFavorites,
PhraseBuilder, ChildProgress, CallMom).

### 1. Mobile-first, телефон в руке
- Max-width 430px, portrait. Имитируем iPhone (390×844 / 430×932).
- Bottom safe area под BottomNav ≥ 80px.
- Touch-targets:
  - **Adult** (parent/tutor/specialist): 44-48px.
  - **Child main action**: 96-128px.
  - **Child primary CTA** («Позвать маму»): 68px+ высота, 56-84px иконка.

### 2. Soft 3D Care UI — визуальный язык
- Мягкий светлый фон (`#F7FAFA`) с тонкими radial-gradient ассетами
  (`#07958B 13% / #2385D6 10%` opacity).
- Крупные rounded карточки (`rounded-2xl` = 24px, `rounded-3xl` = 28px).
- Палитра — **тёплая** + **тёмно-синие чернила** (`ink #071B3A`), без медицинских
  зелёных/красных в больших количествах.
- Тени — мягкие (`shadow-card = 0 8px 30px rgba(7, 27, 58, 0.06)`).
- Hero в child-экранах часто имеет gradient bg (blue → soft white → purple),
  чтобы выглядел «safe place», а не как пустая страница.

### 3. Иерархия через размер и цвет
- Главный CTA = большой + coral (`#E56F5D`) для SOS-семантики или teal для действий.
- Secondary actions = 6 action карточек (QoldauActionCard) в сетке 3×2.
- Tertiary = секции в `SectionCard` с tinted фоном.
- Никаких декоративных иконок, иконки всегда функциональны.

### 4. Карточки ребёнка — единые правила
- **ActionCard** (QoldauActionCard, 6 на ChildHome):
  - `min-h 128px`, icon `56px`, label `text-base font-black`.
  - Border 2px + цветной (`border-[#1c6cb8]`).
  - White bg + цветная рамка + цветной текст + цветная иконка.
  - States: default / pressed (scale 0.96, opacity 90) / selected (ring teal) / disabled (opacity 40).
  - Active state через `active:scale-[0.96]` + focus ring.
- **IconTile** (QoldauIconCard, AAC в ChildCards / CalmMode):
  - Size: sm `88px/40 icon` / md `128px/56 icon` / lg `160px/72 icon`.
  - Те же правила border + bg + icon, что и у ActionCard.
  - Color через 6-токен палитру: blue / green / purple / yellow / teal / coral.
- **Spacing**: `gap-2.5` (10px) между карточками в сетке 4×N.
- **Section card** (SectionCard): `gap-3` между header и содержимым.
- **Padding**: cardPadding `20px` (md), cardPaddingLg `24px` (lg).

### 5. Hybrid Icon System
- **Action / event / mascot icons** — soft 3D PNG ассеты (ChatGPT-generated).
  - 30 файлов в `public/assets/icons/{actions,events,mascots}/`.
  - Registry: `SOFT_FIRST_REGISTRY` в `src/components/icons/soft3d.tsx`.
  - Resolution: `IconRenderer` сначала ищет soft версию, потом flat fallback.
  - Это автоматически подменяет flat SVG на soft 3D везде, где используется
    `IconRenderer` (ChildCards AAC, asset picker, asset registry).
- **System icons** (navigation, header bell, settings, mic) — Lucide React.
  - Tree-shaking через named imports.
  - Единый стиль (`strokeWidth 2-2.5`).
- **Не смешивать** стили в одном экране: soft 3D только для child-action,
  lucide только для chrome и navigation.

### 6. Минимум текста
- В детском UI — максимум иконок, минимум слов.
- Подписи — 1-3 слова: «Хочу пить», «Позвать маму», «Стало спокойнее».
- Без длинных фраз, без medical claims («Похоже, это вода» вместо «Возможно
  ребёнок испытывает жажду»).
- Disclaimer «Это наблюдение, не диагноз» — мелким текстом под результатом,
  не в CTA.

### 7. Sensory-safe анимации
- Длительность ≤ 360ms (`motion.duration.slow`).
- Easing `cubic-bezier(0.4, 0, 0.2, 1)` — standard, не bouncy.
- Pulse / breathe — opacity + scale ≤ 1.05, не bounce.
- Reduced-motion respected через `qoldau-soft-pulse` (если есть prefers-reduced-motion).

### 8. Safety wording
- `«Похоже…»`, `«Возможно…»` вместо утверждений.
- `«Я рядом»`, `«Ты в безопасности»` — поддержка, не давление.
- `«Это наблюдение, не диагноз»` — после AI-результата в child UI.
- `«Мама увидит запрос»` — прозрачность, ребёнок знает что произойдёт.

### 9. Состояния как UI-паттерн
- `pressed` — scale 0.96, opacity 90, обратная связь через 200ms.
- `selected` — ring teal/40 + scale 0.97.
- `success` — ring green/50.
- `disabled` — opacity 40 + cursor not-allowed.
- Все 4 состояния обязательны в `QoldauActionCard` и `QoldauIconCard`.

### 10. Что НЕ делать
- Не использовать медицинские иконки/цвета (больничный зелёный, кресты).
- Не использовать эмодзи для статусов (только в eventTypeColors как data).
- Не делать > 6 primary actions на одном экране (cognitive load).
- Не делать длинные предложения в CTA кнопках.
- Не использовать Alert/Confirm диалоги для child UI — только toast + safe-навигация.
- Не использовать emoji-кнопки в AAC карточках (только icon assets через IconRenderer).

## Hybrid Icon System — детали

Подробнее про hybrid icon system, см. `docs/DESIGN_SYSTEM.md` секция «Hybrid Icon System».
