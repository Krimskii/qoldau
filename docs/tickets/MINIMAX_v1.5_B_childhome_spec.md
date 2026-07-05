# Ticket — MiniMax — v1.5 Дизайн B: детская Главная (ChildHome) пиксель-в-пиксель

> Дизайн: [DESIGN_RESEARCH.md](../DESIGN_RESEARCH.md) + Child UI Principles ([TECH_DECISIONS.md](../TECH_DECISIONS.md)).
> Зона: **только `apps/prototype/**`.** База: `integration/v1.5` **после** merge A
> (`feature/v1.5-sensory-responsive`) — B опирается на регулятор и паттерн тапа из A.
> Цель: довести ChildHome до продуманного финального вида. Текущая минимал-версия —
> хорошая база; здесь точные размеры, состояния, лейблы, токены и связка с регулятором.

```
git switch integration/v1.5 && git pull   # после того как A влит
git switch -c feature/v1.5-childhome-polish
```

## Структура экрана (сверху вниз), контейнер max-w-[430px], mx-auto
```
[ TopBar        ]  ~48px
[ 3×2 сетка карточек ]  gap 14px, px-5
[ «Позвать маму» CTA ]  min-h 76px, mx-5, mt-4
[ «Собрать фразу»    ]  min-h 88px, mx-5, mt-2
[ safe-bottom 12px + BottomNav ]
```

## 1. TopBar (минимальный)
- Высота ~48px, `px-4 pt-1.5 pb-1`.
- **calm/standard:** слева — mute-toggle (Volume2/VolumeX, 36×36), справа — выйти (LogOut, 36×36). Больше ничего.
- **playful:** слева добавить аватар 26px (инициал на цветном круге, акцентный цвет ребёнка) + имя (12px, `font-medium`), справа — выйти. (Персонализация из D2.)

## 2. Сетка карточек — 3 столбца × 2 ряда
- Контейнер: `grid grid-cols-3 gap-3.5 px-5` (gap 14px).
- **Карточка** (`HomeCard`): `aspect-square min-h-[112px]`, `rounded-[28px]`, белый фон,
  `shadow-card`. Внутри:
  - плитка `w-[84px] h-[84px] rounded-[22px]` с фоном семьи (`CHILD_FAMILY_STYLES.icoBg`),
    по центру иконка `size 64`;
  - **лейбл под иконкой** (1–2 слова, `text-[12px] font-black`, цвет из семьи, `mt-1`) —
    **виден в standard/playful, скрыт в calm** (через регулятор / `data-sensory`).
    (AAC-практика: символ+текст помогает учить; calm — чище без текста.)
- **6 карточек** (порядок фиксирован — моторная память, НЕ перетасовывать):
  | # | label | иконка | семья | go |
  |---|---|---|---|---|
  | 1 | Хочу пить | Water2DIcon | need | /child/water |
  | 2 | Хочу кушать | Food2DIcon | do | /child/food |
  | 3 | Туалет | Toilet2DIcon | need | /child/toilet |
  | 4 | Отдохнуть | Pause2DIcon | feel | /child/calm |
  | 5 | Любимые | Fav2DIcon | fav | /child/favorites |
  | 6 | Сказать | Mic2DIcon | do | /child/speak |
- **4 состояния (обязательны, Child UI Principles §9):**
  - default — как выше;
  - pressed — `active:scale-[0.94]` + `opacity-90` (≤200мс), + `speak(label)` + гаптик (по режиму);
  - selected — `ring-2 ring-teal/40 scale-[0.97]` (если карточка ведёт в под-выбор);
  - disabled — `opacity-40 cursor-not-allowed`.
- Hover (десктоп-превью): `-translate-y-1 shadow-card-lg`.

## 3. «Позвать маму» — главная CTA
- `mx-5 mt-4`, `rounded-[24px]`, `min-h-[76px]`, `flex items-center justify-center gap-3`.
- **Фон/цвет из ТОКЕНОВ** (`coral-soft`/`coral`), НЕ хардкод-hex/градиент.
- Содержимое: `Heart2DIcon size 30` + **текст «Позвать маму» `text-[16px] font-black`**
  (сейчас только иконка — добавить слово: узнаваемость + контекст).
- **«Дышащее» состояние** (из D1): `qoldau-soft-pulse` opacity+scale ≤1.05, гейт по
  `--child-motion` + `prefers-reduced-motion`. pressed: `active:scale-[0.97]`.

## 4. «Собрать фразу»
- `mx-5 mt-2`, `rounded-[24px]`, `min-h-[88px]`. Фон из токенов (`blue-soft`→`purple-soft`
  допускается мягкий tint, но токенами). `Puzzle2DIcon size 52` + текст «Собрать фразу»
  `text-[15px] font-bold`. pressed `active:scale-[0.98]` + `speak('Собрать фразу')`.

## 5. Поведение по регулятору (D2) — раскладка НЕ меняется
| Элемент | calm | standard | playful |
|---|---|---|---|
| Лейблы карточек | скрыты | видны | видны |
| Насыщенность | `saturate .72` (глобально из A) | 1 | 1.12 |
| Pulse на CTA | выкл | мягкий | мягкий |
| Аватар+имя в TopBar | скрыто | скрыто | видно |
| Звук/гаптик на тап | тихо/без | TTS | TTS+гаптик |

## 6. Токены (убрать хардкод)
- Заменить inline-hex (`#fdecec`, `#c95f5f`, `#eef4fb`…) на дизайн-токены из `tokens.ts`
  (coral/teal/blue/purple families, `shadow-card`, радиусы). Никаких `#hex` в JSX.

## 7. Доступность
- Тач-таргеты: карточки ≥112px, CTA ≥76px, вторичная ≥88px.
- `aria-label` на каждой кнопке (уже есть) + видимый лейбл в standard/playful.
- Контраст текста лейбла на плитке ≥ AA. TTS на тап (из D1).

## Тесты / проверки / отчёт
- Снапшот ChildHome: 6 карточек в порядке, CTA с текстом, лейблы по режиму.
```
cd apps/prototype && npm run typecheck && npm test && npm run build
git push -u origin feature/v1.5-childhome-polish
```
Отчёт: файлы; вывод проверок; скрин/описание calm vs playful; подтверждение — токены (0 хардкод-hex), 4 состояния, лейблы по регулятору, тексты на CTA.
