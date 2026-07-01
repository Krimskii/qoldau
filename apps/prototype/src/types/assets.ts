/**
 * Asset system — типы для встроенных и пользовательских ассетов.
 *
 * Все ассеты в Qoldau AI проходят через QoldauAsset. Это позволяет:
 * - AAC-карточкам использовать встроенный SVG, эмодзи или загруженное фото;
 * - Единообразно рендерить через IconRenderer;
 * - Хранить пользовательские загрузки локально (data URL).
 *
 * ВАЖНО: никаких реальных medical / sensitive данных. Все ассеты — это
 * только иконки и картинки для UI.
 */

export type AssetType =
  | 'builtin_svg'
  | 'emoji'
  | 'uploaded_image'
  | 'uploaded_photo'
  | 'app_icon'
  | 'media_cover';

export type AssetCategory =
  | 'need'
  | 'feeling'
  | 'person'
  | 'activity'
  | 'calm'
  | 'media'
  | 'navigation'
  | 'achievement';

export type AssetColor = 'blue' | 'green' | 'teal' | 'yellow' | 'purple' | 'coral';

export interface QoldauAsset {
  id: string;
  type: AssetType;
  category: AssetCategory;
  label: string;
  description?: string;
  /** Ссылка на built-in иконку в assetRegistry (только для type=builtin_svg). */
  builtinKey?: string;
  /** Эмодзи-фолбэк (если не используется SVG). */
  emoji?: string;
  /** URL для app/media cover. */
  imageUrl?: string;
  /** Локальный data URL (только для uploaded_image / uploaded_photo / media_cover). */
  dataUrl?: string;
  /** Цвет в палитре QoldauIconCard. */
  color?: AssetColor;
  /** Пользовательский (true) или built-in (false). */
  isCustom: boolean;
  createdAt: string;
}

export type AACEventType = 'aac_card' | 'media_request' | 'sos' | 'calm_mode';

/**
 * AACCardConfig — конфигурация AAC-карточки.
 * Связывает UI-карточку с QoldauAsset (иконка) и фразой, которую ребёнок
 * "говорит" при нажатии.
 */
export interface AACCardConfig {
  id: string;
  childId: string;
  label: string;
  phrase: string;
  assetId: string;
  eventType: AACEventType;
  category: AssetCategory;
  order: number;
  isFavorite?: boolean;
}

/**
 * Payload, который сохраняется в Event.payload при нажатии карточки.
 */
export interface AACEventPayload {
  cardId: string;
  cardLabel: string;
  assetId: string;
  assetType: AssetType;
  source: string;
}