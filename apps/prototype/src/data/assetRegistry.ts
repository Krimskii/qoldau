import type { QoldauAsset, AssetCategory } from '@/types/assets';

/**
 * Built-in asset registry — все встроенные ассеты Qoldau AI.
 *
 * Содержит ~30 ассетов, разбитых по 8 категориям:
 * - need, feeling, activity, person, calm, media, navigation, achievement
 *
 * Каждый ассет:
 * - ссылается на builtin-иконку (которую рендерит IconRenderer через
 *   BUILTIN_ICONS map);
 * - имеет label и category;
 * - имеет color (для QoldauIconCard pastel-фона).
 *
 * Чтобы добавить новый ассет — добавь запись сюда + иконку в BUILTIN_ICONS
 * + helper в IconRenderer.
 */

export interface BuiltinAsset extends Omit<QoldauAsset, 'id' | 'createdAt' | 'isCustom'> {
  /** Имя built-in SVG в src/components/assets/icons/ (CamelCase, без суффикса Icon). */
  builtinKey: string;
}

export const BUILTIN_ASSETS: BuiltinAsset[] = [
  // ===== Need (базовые потребности) =====
  { type: 'builtin_svg', category: 'need', label: 'Вода', builtinKey: 'Water', color: 'blue' },
  { type: 'builtin_svg', category: 'need', label: 'Еда', builtinKey: 'Food', color: 'coral' },
  { type: 'builtin_svg', category: 'need', label: 'Туалет', builtinKey: 'Toilet', color: 'purple' },
  { type: 'builtin_svg', category: 'need', label: 'Помощь', builtinKey: 'Help', color: 'green' },
  { type: 'builtin_svg', category: 'need', label: 'Пауза', builtinKey: 'Pause', color: 'yellow' },
  { type: 'builtin_svg', category: 'need', label: 'Домой', builtinKey: 'Home', color: 'yellow' },

  // ===== Feeling (состояния) =====
  { type: 'builtin_svg', category: 'feeling', label: 'Больно', builtinKey: 'Sad', color: 'coral' },
  { type: 'builtin_svg', category: 'feeling', label: 'Устал', builtinKey: 'Sleep', color: 'blue' },
  { type: 'builtin_svg', category: 'feeling', label: 'Радость', builtinKey: 'Sparkle', color: 'yellow' },
  { type: 'builtin_svg', category: 'feeling', label: 'Спокойно', builtinKey: 'Moon', color: 'teal' },
  { type: 'builtin_svg', category: 'feeling', label: 'Нет', builtinKey: 'No', color: 'coral' },
  { type: 'builtin_svg', category: 'feeling', label: 'Да', builtinKey: 'Yes', color: 'green' },

  // ===== Activity (активности) =====
  { type: 'builtin_svg', category: 'activity', label: 'Играть', builtinKey: 'Play', color: 'green' },
  { type: 'builtin_svg', category: 'activity', label: 'Музыка', builtinKey: 'Music', color: 'purple' },
  { type: 'builtin_svg', category: 'activity', label: 'Наушники', builtinKey: 'Headphones', color: 'green' },
  { type: 'builtin_svg', category: 'activity', label: 'Сон', builtinKey: 'Sleep', color: 'blue' },
  { type: 'builtin_svg', category: 'activity', label: 'Гулять', builtinKey: 'Walk', color: 'green' },
  { type: 'builtin_svg', category: 'activity', label: 'Учиться', builtinKey: 'Study', color: 'teal' },

  // ===== Person (люди) =====
  { type: 'builtin_svg', category: 'person', label: 'Мама', builtinKey: 'Mom', color: 'coral' },
  { type: 'builtin_svg', category: 'person', label: 'Папа', builtinKey: 'Dad', color: 'blue' },
  { type: 'builtin_svg', category: 'person', label: 'Тьютор', builtinKey: 'Tutor', color: 'purple' },
  { type: 'builtin_svg', category: 'person', label: 'Специалист', builtinKey: 'Tutor', color: 'blue' },

  // ===== Calm (спокойствие) =====
  { type: 'builtin_svg', category: 'calm', label: 'Дыхание', builtinKey: 'Breath', color: 'blue' },
  { type: 'builtin_svg', category: 'calm', label: 'Объятие', builtinKey: 'Hug', color: 'coral' },
  { type: 'builtin_svg', category: 'calm', label: 'Темно', builtinKey: 'Moon', color: 'blue' },

  // ===== Media (медиа) =====
  { type: 'builtin_svg', category: 'media', label: 'Мультик', builtinKey: 'Cartoon', color: 'yellow' },
  { type: 'builtin_svg', category: 'media', label: 'Песенка', builtinKey: 'Music', color: 'purple' },
  { type: 'builtin_svg', category: 'media', label: 'Животные', builtinKey: 'Animals', color: 'green' },
  { type: 'builtin_svg', category: 'media', label: 'Машинки', builtinKey: 'Cars', color: 'blue' },
  { type: 'builtin_svg', category: 'media', label: 'Спокойное видео', builtinKey: 'Video', color: 'blue' },
  { type: 'builtin_svg', category: 'media', label: 'Планшет', builtinKey: 'Tablet', color: 'teal' },

  // ===== Navigation (навигация) =====
  { type: 'builtin_svg', category: 'navigation', label: 'Домой', builtinKey: 'Home', color: 'teal' },
  { type: 'builtin_svg', category: 'navigation', label: 'События', builtinKey: 'Calendar', color: 'blue' },
  { type: 'builtin_svg', category: 'navigation', label: 'Аналитика', builtinKey: 'Chart', color: 'purple' },
  { type: 'builtin_svg', category: 'navigation', label: 'Профиль', builtinKey: 'User', color: 'blue' },
  { type: 'builtin_svg', category: 'navigation', label: 'Назад', builtinKey: 'ArrowLeft', color: 'blue' },
  { type: 'builtin_svg', category: 'navigation', label: 'Плюс', builtinKey: 'Plus', color: 'teal' },

  // ===== Achievement (достижения) =====
  { type: 'builtin_svg', category: 'achievement', label: 'Звезда', builtinKey: 'Star', color: 'yellow' },
  { type: 'builtin_svg', category: 'achievement', label: 'Кубок', builtinKey: 'Trophy', color: 'yellow' },
  { type: 'builtin_svg', category: 'achievement', label: 'Галочка', builtinKey: 'Check', color: 'green' },
  { type: 'builtin_svg', category: 'achievement', label: 'Фраза', builtinKey: 'Phrase', color: 'purple' },
  { type: 'builtin_svg', category: 'achievement', label: 'Голос', builtinKey: 'Speak', color: 'teal' },
  { type: 'builtin_svg', category: 'achievement', label: 'SOS', builtinKey: 'SOS', color: 'coral' },
];

// =============================================================================
// Helpers
// =============================================================================

/**
 * Резолвит built-in ассет по builtinKey. Возвращает undefined, если не найден.
 */
export function getBuiltinByKey(key: string): BuiltinAsset | undefined {
  return BUILTIN_ASSETS.find((a) => a.builtinKey === key);
}

/**
 * Возвращает все встроенные ассеты по категории.
 */
export function getBuiltinsByCategory(category: AssetCategory): BuiltinAsset[] {
  return BUILTIN_ASSETS.filter((a) => a.category === category);
}

/**
 * Конвертирует BuiltinAsset в полный QoldauAsset с id/createdAt/isCustom.
 */
export function toQoldauAsset(builtin: BuiltinAsset, id: string): QoldauAsset {
  return {
    ...builtin,
    id,
    isCustom: false,
    createdAt: new Date(0).toISOString(), // fixed epoch для deterministic seed
  };
}

/**
 * Seed built-in ассетов — для инициализации useAssetStore.
 * Стабильные id чтобы можно было ссылаться из cardConfigs.
 */
export const BUILTIN_IDS: Record<string, string> = BUILTIN_ASSETS.reduce(
  (acc, a, i) => {
    acc[`${a.category}/${a.builtinKey}`] = `builtin-${i.toString().padStart(3, '0')}`;
    return acc;
  },
  {} as Record<string, string>,
);

export function getBuiltinId(builtinKey: string, category: AssetCategory): string {
  return BUILTIN_IDS[`${category}/${builtinKey}`] ?? `builtin-${builtinKey}`;
}