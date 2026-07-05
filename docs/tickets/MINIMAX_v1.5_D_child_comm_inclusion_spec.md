# Ticket — MiniMax — v1.5 Дизайн D: коммуникация и инклюзия (CallMom · Speak · Favorites)

> Дизайн: [DESIGN_RESEARCH.md](../DESIGN_RESEARCH.md) + Child UI Principles ([TECH_DECISIONS.md](../TECH_DECISIONS.md)).
> Методики: AAC, FCT (Functional Communication Training), Visual Supports.
> Зона: **только `apps/prototype/src/pages/child/**`** + общие `components/ui/**`,
> `components/assets/**`, `store/useAssetStore.ts`, `types/assets.ts`.
> База: `integration/v1.5` (после C). Цель: закрыть 3 gap'а из анализа референса —
> безопасный вызов взрослого, инклюзия для невокализующих детей, свои медиа-обложки.
>
> **Не строить с нуля — дожать существующее.** Загрузка/выбор/рендер кастомных
> ассетов УЖЕ работают: `ImageUpload` (PNG/JPEG/WebP/SVG, 2 МБ, FileReader→dataUrl),
> `AssetPicker` (табы+поиск+upload), `addCustomAsset` (persist), `IconRenderer`
> (рендерит `dataUrl` как object-cover). Переиспользуй их, не дублируй.

```
git switch integration/v1.5 && git pull
git switch -c feature/v1.5-D-child-comm
```

---

## 0. Общий компонент — `ConfirmSheet` (единый паттерн подтверждения)

Новый переиспользуемый компонент `components/ui/ConfirmSheet.tsx`. **Везде, где нужно
подтверждение действия — используем его** (не одноразовые оверлеи).

- Всплывает **снизу** (slide-up, `translate-y` + fade, ≤240мс, гейт `prefers-reduced-motion`).
- Полупрозрачный backdrop (`rgba(7,27,58,0.28)`), тап по backdrop = отмена.
- Карточка: `rounded-t-[28px]`/`rounded-[28px]`, белый фон, `mx-3 mb-3`, `shadow-card-lg`.
- Контент: заголовок-вопрос `text-[18px] font-black text-ink` по центру + опц. подпись
  `text-sm text-muted`.
- **Две большие круглые кнопки** (как визуальный язык выбора карточки):
  - **✓ подтвердить** — `w-16 h-16 rounded-full bg-green text-white`, `active:scale-[0.92]`;
  - **✕ отмена** — `w-16 h-16 rounded-full bg-white border-2 border-line text-muted`.
- `role="dialog"`, `aria-label` из заголовка; ✓ и ✕ с `aria-label` «Подтвердить»/«Отмена».
- Props: `{ open, title, subtitle?, confirmTone?: 'green'|'coral', onConfirm, onCancel }`.
  Для «Срочно» — `confirmTone="coral"` (кнопка ✓ становится coral).

Применение в D: **«Срочно»** (CallMom). На будущее — им же заменять точечные confirm'ы
(удаление записи в Speak, «Очистить фразу» и т.п.) — но в этом тикете трогаем только Срочно.

---

## 1. CallMom — Позвать взрослого (`ChildCall.tsx`)

Сейчас: Мама+Тьютор, только «☎», SOS срабатывает **мгновенно** ([CallMom.tsx:63](../../apps/prototype/src/pages/child/CallMom.tsx)).

### 1.1 Контакты — Мама / Папа / Тьютор
- Три карточки, порядок фиксирован: **Мама, Папа, Тьютор**.
- Иконки: `Mom2DIcon` / `Dad2DIcon` / `Tutor2DIcon` (все есть в child2d).
- Layout карточки как сейчас: `min-h-[96px] rounded-2xl bg-{tone}-soft border-2`,
  аватар `w-16 h-16` слева, канал-бейдж справа `w-12 h-12 rounded-full`.
- **Канал-бейдж** (per contact): звонок — `Phone` (lucide), видео — `Video`. Задаётся в
  `ContactDef.channel: 'call'|'video'`. По умолчанию Мама/Папа = call, Тьютор = video
  (зеркалит референс). Цвет бейджа — `bg-green` (call) / `bg-blue` (video).
- Тап → создаёт event (как сейчас `handleCall`) + `speak('Зову ' + имя)` + ✓-feedback
  (существующий `SuccessSparkle` тост оставить).

### 1.2 «Написать сообщение»
- Строка-кнопка под контактами: `min-h-[64px] rounded-2xl bg-white border border-line`,
  иконка `MessageCircle` + текст «Написать сообщение» `text-[15px] font-bold`.
- Тап → **bottom-sheet композер** с **пресет-фразами** (чипы, тап = отправить):
  «Скучаю», «Когда придёшь?», «Всё хорошо», «Люблю тебя».
- Отправка чипа: `communication` event (payload `{source:'child_message', text}`) +
  `speak(text)` + ✓-feedback. Закрыть sheet.
- Пресеты редактирует **родитель** (см. §4 — храним в сторе, как обложки). Свободный
  ввод с клавиатуры — только в parent/edit-режиме (ребёнку — только чипы).

### 1.3 «Срочно» — с подтверждением (главное)
- Заменить мгновенный SOS. Карточка «Срочно»: `bg-coral-soft border-2 border-coral/30`,
  слева «!» в кружке, текст **«Срочно»** `text-2xl font-black text-coral` + подпись
  `text-[11px] text-muted` «Нужно подтверждение», справа **замок** `Lock` (lucide) —
  визуальный сигнал «это не случайное нажатие».
- Тап → **`ConfirmSheet`** `confirmTone="coral"`, title «Позвать срочно?», subtitle
  «Взрослый получит сигнал сразу». ✓ → текущий `handleSOS` (event type `sos`) +
  ✓-feedback. ✕ → закрыть, ничего не отправлять.
- **Важно (трактовка замка):** замок = защита от случайного тапа, а НЕ разрешение
  взрослого. Ребёнок в кризисе **должен дозваться сам** — подтверждение делает он же,
  двумя касаниями. Никаких PIN/родительских гейтов на Срочно.

---

## 2. Speak — fallback «или выбери карточку» (`ChildSpeak.tsx`)

Сейчас: только большой микрофон + список записей.

- Под блоком статуса микрофона (перед «Недавние записи») добавить секцию:
  - разделитель-подпись по центру `text-sm text-muted` — «или выбери карточку»;
  - **ряд из 4 карточек**: **Вода / Мама / Туалет / Домой** (частотные, FCT).
    Иконки `Water2DIcon` / `Mom2DIcon` / `Toilet2DIcon` / `Home2DIcon`.
  - Сетка `grid grid-cols-4 gap-3 px-5`, карточка `bg-white rounded-[22px] shadow-card-soft
    aspect-square min-h-[88px]`, внутри плитка-иконка `w-[56px] h-[56px] rounded-[16px]`
    с семейным фоном, `active:scale-[0.96]` + `qoldau-tap-ring`.
- Тап карточки = **выражение потребности без голоса**: `speak(label)` + `aac_card` event
  (payload `{source:'speak_fallback', label}`) + короткий ✓-feedback (переиспользовать
  существующий success-паттерн Speak/тост). **Без навигации** — ребёнок остаётся на Speak.
- Скрывать этот ряд во время активной записи (`isRecording`) — не отвлекать.

---

## 3. Favorites — медиа-обложки + свои обложки (`ChildFavorites.tsx`)

### 3.1 Затык, который надо снять первым
Сейчас плитка рисуется по **хардкод-`FAVORITE_ICON_MAP`** (2D-иконки по `config.id`) —
загруженная обложка не показывается. **Переключить рендер плитки на `IconRenderer(asset)`**
(asset берётся `assets.find(a => a.id === config.assetId)`), fallback на иконку из карты,
если у ассета нет `dataUrl`/`imageUrl`.

### 3.2 Плитка-обложка (2 колонки, когда есть картинка)
- Сетка **`grid-cols-2 gap-3`** для медиа-обложек (крупнее, «читаются» как в референсе);
  плитки без картинки (иконочные) — тот же размер, иконка по центру.
- Плитка: `rounded-[24px] shadow-card overflow-hidden aspect-[4/3] min-h-[120px]`,
  картинка `IconRenderer rounded object-cover` заполняет плитку **edge-to-edge**.
- **Лейбл — чип снизу поверх картинки**: `absolute bottom-2 left-2 right-2`,
  `bg-white/85 backdrop-blur rounded-[14px] px-2.5 py-1.5`, текст `text-sm font-black text-ink`.
- **Play-бейдж** (см. 3.3): `absolute top-2 right-2 w-9 h-9 rounded-full bg-black/45`,
  иконка `Play`/`Volume2` белая — **только для `mediaKind` video/audio**.
- Состояния: `active:scale-[0.94]`, `hover:-translate-y-1 hover:shadow-card-lg`,
  selected — `ring-2 ring-teal/50`.

### 3.3 Тип медиа + бейдж — схема
- В `AACCardConfig` (types/assets.ts) добавить **`mediaKind?: 'video'|'audio'|'photo'|'app'`**.
- Бейдж: `video`/`audio` → play-оверлей; `photo`/`app`/undefined → без бейджа.
- Дефолтам проставить kind в `buildDefaultCardConfigs`: cartoon=video, calm-video=video,
  songs=audio, animals=video, cars=photo (пример — уточнишь при реализации).

### 3.4 Authoring — собирает РОДИТЕЛЬ (edit-режим)
- Edit-режим уже гейтится `currentRole !== 'child'` — сохранить. Ребёнок только пользуется.
- В edit-режиме:
  - тап по плитке → `AssetPicker` (выбор built-in ИЛИ «＋ Загрузить своё изображение»
    → `ImageUpload`) — **уже реализовано**, оставить; после выбора `setCardAsset`.
  - **добавить поля** при настройке карточки: **название** (`setCardLabel`) и **тип медиа**
    (`setCardMediaKind` — новый экшен, см. §4).
  - **«＋ Добавить любимое»** — плитка-кнопка в конце сетки (пунктирная,
    `border-2 border-dashed border-line`, иконка `Plus`). Создаёт новый `AACCardConfig`
    (`addFavoriteCard`, см. §4) → сразу открывает `AssetPicker`. Лимит **12** карточек.
  - **удаление** карточки в edit-режиме — через `ConfirmSheet` (title «Убрать из любимых?»),
    экшен `removeFavoriteCard`.
- Плашка-инструкция в edit-режиме — оставить/обновить текст.

---

## 4. Store / schema (useAssetStore.ts, types/assets.ts)
- `AACCardConfig.mediaKind?: 'video'|'audio'|'photo'|'app'` — новое опц. поле.
- Новые экшены:
  - `setCardMediaKind(cardId, kind)`;
  - `addFavoriteCard(childId)` → создаёт config (`eventType:'media_request'`,
    `isFavorite:true`, `category:'media'`, дефолтный assetId-иконка, `order` = max+1);
  - `removeFavoriteCard(cardId)`.
- Пресет-сообщения для §1.2: массив в сторе (напр. `messagePresets: string[]` +
  `setMessagePresets`) — persist, дефолт из 4 фраз. Родитель редактирует.
- Всё новое — в `partialize` (persist), миграция версии стора (`version: 2` + `migrate`
  для старых записей без `mediaKind`).

## Токены / доступность
- 0 хардкод-`#hex` в JSX — токены (`bg-*-soft`, `text-*`, `shadow-card`, радиусы).
- Тач-таргеты: карточки ≥112px, строки ≥64px, кнопки ✓/✕ 64px, канал-бейджи ≥44px.
- `aria-label` на всех кнопках; `ConfirmSheet` — `role="dialog"` + focus на ✓ при открытии.
- Контраст лейбл-чипа на картинке ≥ AA (белая подложка 85% + `text-ink`).
- Движение (slide-up, pulse) — гейт `prefers-reduced-motion`.

## Тесты / проверки / отчёт
- `ConfirmSheet`: рендер, ✓ вызывает onConfirm, ✕/backdrop — onCancel.
- CallMom: 3 контакта в порядке; «Срочно» НЕ шлёт event до ✓; ✓ создаёт `sos`.
- Speak: fallback-ряд из 4 карточек; тап создаёт `aac_card` event, без навигации;
  ряд скрыт при записи.
- Favorites: плитка рендерит `dataUrl`-обложку (не icon-map); play-бейдж по `mediaKind`;
  «＋ Добавить» создаёт config; удаление через ConfirmSheet.
- Snapshot Favorites (2-кол обложки + чип-лейблы).
```
cd apps/prototype && npm run typecheck && npm test && npm run build
git push -u origin feature/v1.5-D-child-comm
```
Отчёт: файлы; вывод проверок; скрины CallMom(Срочно-лист)/Speak(fallback)/Favorites(обложки
+ edit); подтверждение — (1) ConfirmSheet переиспользуемый, (2) Срочно за подтверждением,
(3) 4 fallback-карточки, (4) обложки через IconRenderer + upload родителем, (5) play-бейдж,
(6) 0 хардкод-hex, (7) миграция стора без потери данных.
