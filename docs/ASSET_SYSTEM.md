# Asset System — Qoldau AI

> Единая система ассетов для AAC-карточек, favorites, контактов и профиля.
> Built-in SVG + пользовательские загрузки. Всё локально, без backend.

## 1. Главные принципы

1. **Один источник истины** — все ассеты проходят через `QoldauAsset`.
2. **Один рендерер** — `IconRenderer` поддерживает все типы (builtin, emoji, uploaded).
3. **Локально** — загруженные изображения хранятся как `dataUrl` в `localStorage`. **Не отправляются на сервер**.
4. **Sensory-safe** — built-in иконки flat-outline, без деталей меньше 4px.
5. **Не medical** — никаких личных данных, никаких sensitive records.

## 2. Типы ассетов

| `AssetType` | Когда | Что внутри |
|-------------|-------|------------|
| `builtin_svg` | Все built-in из registry | `builtinKey: string` (имя SVG компонента) |
| `emoji` | (опц.) fallback | `emoji: string` |
| `uploaded_image` | Любое загруженное изображение | `dataUrl: string` |
| `uploaded_photo` | Фото человека | `dataUrl: string` |
| `app_icon` | Иконка приложения | `imageUrl?: string` или `dataUrl` |
| `media_cover` | Cover для media | `imageUrl?: string` или `dataUrl` |

## 3. Категории

`AssetCategory`:
- `need` — базовые потребности (вода, еда, туалет)
- `feeling` — состояния (больно, устал, радость)
- `activity` — активности (играть, музыка, прогулка)
- `person` — люди (мама, папа, тьютор)
- `calm` — спокойствие (дыхание, объятие)
- `media` — медиа (мультик, песенка)
- `navigation` — навигация (домой, события)
- `achievement` — достижения (звезда, кубок)

## 4. Built-in registry

`src/data/assetRegistry.ts` содержит ~40 встроенных ассетов по всем категориям.

Каждый имеет стабильный `id`: `builtin-{NNN}` (например, `builtin-000` для первой записи).

Built-in иконки находятся в `src/components/icons/index.tsx` (Water, Food, Toilet, etc.) и рендерятся через `IconRenderer.resolveBuiltinComponent()`.

## 5. Custom (загруженные) ассеты

Пользователь загружает PNG/JPEG/WebP/SVG через `ImageUpload`. Файл:
1. Читается через `FileReader.readAsDataURL` → получаем `dataUrl`.
2. Сохраняется в `useAssetStore.assets` с `isCustom: true`.
3. Persist в `localStorage` (ключ `qoldau-assets-v1`).

**Лимит:** 2 MB на файл. Превышение → warning, файл не сохраняется.

**Privacy disclaimer** показывается в ImageUpload:

> В demo-режиме изображение сохраняется только в этом браузере и не отправляется на сервер. Не используйте личные фото в публичной демонстрации без согласия.

## 6. AACCardConfig

```ts
interface AACCardConfig {
  id: string;
  childId: string;
  label: string;        // "Вода"
  phrase: string;        // "Хочу пить воду"
  assetId: string;       // ссылка на QoldauAsset.id
  eventType: 'aac_card' | 'media_request' | 'sos' | 'calm_mode';
  category: AssetCategory;
  order: number;
  isFavorite?: boolean;
}
```

Каждая AAC-карточка — это `AACCardConfig`. Рендерится через `IconRenderer` (по `assetId`). При нажатии создаётся `Event` с `payload.assetId` / `payload.assetType`.

## 7. Использование в коде

### Чтение ассетов

```tsx
import { useAssetStore } from '@/store/useAssetStore';

const assets = useAssetStore((s) => s.assets);
const cardConfigs = useAssetStore((s) => s.cardConfigs);

const asset = assets.find((a) => a.id === config.assetId);
```

### Рендер

```tsx
import { IconRenderer } from '@/components/assets/IconRenderer';

<IconRenderer asset={asset} size={48} />
```

### AssetPicker

```tsx
import { AssetPicker } from '@/components/assets/AssetPicker';

const [open, setOpen] = useState(false);
<AssetPicker
  isOpen={open}
  selectedAssetId={card.assetId}
  onSelect={(asset) => {
    setCardAsset(card.id, asset.id);
    setOpen(false);
  }}
  onClose={() => setOpen(false)}
/>
```

### ImageUpload

```tsx
import { ImageUpload } from '@/components/assets/ImageUpload';

<ImageUpload
  defaultCategory="person"
  onAssetCreated={(asset) => {
    setCardAsset(card.id, asset.id);
  }}
/>
```

## 8. Как добавить новый built-in asset

1. Добавь SVG-компонент в `src/components/icons/index.tsx`.
2. Зарегистрируй его в `IconRenderer.resolveBuiltinComponent()` map.
3. Добавь запись в `BUILTIN_ASSETS` в `src/data/assetRegistry.ts` (category, label, color, builtinKey).
4. Опционально: добавь в `buildDefaultCardConfigs()` если это AAC-карточка.

## 9. Reset и persistence

`useAssetStore.persist`:
- Persist **только custom assets + cardConfigs**.
- Built-in ассеты пересоздаются при загрузке из `buildInitialAssets()`.
- При `resetAssets()` — очищаются и built-in, и custom; восстанавливаются defaults.

`useDemoControlsStore.resetEvents()` пока НЕ сбрасывает assets. Это намеренно — пользовательские загрузки не должны теряться при reset demo. При будущем полном reset — `useAssetStore.resetCustomAssets()` отдельно.

## 10. Что НЕ делает система (privacy / safety)

- ❌ Не отправляет файлы на сервер (`fetch` нигде не используется в asset-коде).
- ❌ Не хранит audio blobs.
- ❌ Не хранит реальные sensitive records.
- ❌ Не использует реальные логотипы YouTube/Netflix/etc.
- ❌ Не использует medical / health claims.

## 11. Future (когда будет backend)

Когда подключим backend с реальным asset storage:
1. `asset.dataUrl` останется fallback для offline.
2. `asset.imageUrl` будет основным (CDN URL).
3. `IconRenderer` уже поддерживает оба варианта (см. `asset.dataUrl` + `asset.imageUrl` ветки).
4. Persist в localStorage можно будет отключить через флаг.

## 12. Чек-лист перед релизом

- [ ] Нет `fetch`/`XHR` в `src/components/assets/`, `src/store/useAssetStore.ts`.
- [ ] ImageUpload показывает disclaimer.
- [ ] File size limit 2 MB enforced.
- [ ] Built-in иконки flat-outline, читаются на 32px.
- [ ] AAC-card → Event содержит `payload.assetId` и `payload.assetType`.
- [ ] Reset demo НЕ теряет пользовательские загрузки.