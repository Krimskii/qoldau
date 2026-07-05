/**
 * Qoldau AI — Design Tokens (consolidated)
 *
 * Single source of truth for colors, spacing, typography and motion.
 * All visual constants must come from this file or Tailwind tokens.
 *
 * See docs/DESIGN_SYSTEM.md for the full system documentation.
 */

// =============================================================================
// Surface
// =============================================================================

export const surface = {
  bg: '#F7FAFA', // warm soft white — основной фон
  bgAlt: '#EEF5F4', // мягкий alternate для секций
  surface: '#FFFFFF',
  surfaceSoft: '#F9FCFC',
  surfaceTint: '#F2F8F7',
} as const;

// =============================================================================
// Ink (text)
// =============================================================================

export const ink = {
  DEFAULT: '#071B3A',
  soft: '#344B68',
  muted: '#6B7C8F',
  inverse: '#FFFFFF',
} as const;

// =============================================================================
// Brand (teal primary)
// =============================================================================

export const brand = {
  teal: '#009688',
  tealDark: '#00796F',
  tealSoft: '#DDF5F0',
  tealTint: '#EAF8F6',
  mint: '#BFECE4',
} as const;

// =============================================================================
// Accent colors (semantic)
// =============================================================================

export const accent = {
  blue: '#2385D6',
  blueSoft: '#EAF5FF',

  purple: '#7C5CCB',
  purpleSoft: '#F1EDFF',

  yellow: '#F7C948',
  yellowSoft: '#FFF6DF',

  coral: '#E56F5D',
  coralSoft: '#FFEAEA',

  green: '#4EC28A',
  greenSoft: '#EAF8F0',
} as const;

// =============================================================================
// Status
// =============================================================================

export const status = {
  success: '#4EC28A',
  warning: '#F7C948',
  danger: '#E56F5D',
  info: '#2385D6',
} as const;

// =============================================================================
// Role colors
// =============================================================================

export const roleColors = {
  overview: '#344B68',
  parent: '#009688',
  child: '#00796F',
  tutor: '#7C5CCB',
  specialist: '#2385D6',
} as const;

export type RoleKey = keyof typeof roleColors;

// =============================================================================
// EventType colors — для иконок/badges Event Timeline
// =============================================================================

export const eventTypeColors = {
  food: { tone: 'coral', emoji: '🍎', label: 'Питание' },
  water: { tone: 'blue', emoji: '💧', label: 'Вода' },
  toilet: { tone: 'purple', emoji: '🚽', label: 'Туалет' },
  sleep: { tone: 'blue', emoji: '🌙', label: 'Сон' },
  behavior: { tone: 'yellow', emoji: '⚡', label: 'Поведение' },
  sensory: { tone: 'yellow', emoji: '👂', label: 'Сенсорика' },
  communication: { tone: 'purple', emoji: '💬', label: 'Коммуникация' },
  aac_card: { tone: 'teal', emoji: '🃏', label: 'AAC' },
  voice_observation: { tone: 'teal', emoji: '🎙', label: 'Голос' },
  phrase: { tone: 'purple', emoji: '💬', label: 'Фраза' },
  media_request: { tone: 'yellow', emoji: '⭐', label: 'Медиа' },
  sos: { tone: 'coral', emoji: '🆘', label: 'SOS' },
  calm_mode: { tone: 'green', emoji: '☁️', label: 'Спокойствие' },
  tutor_note: { tone: 'purple', emoji: '📝', label: 'Заметка тьютора' },
  specialist_note: { tone: 'blue', emoji: '📋', label: 'Заметка специалиста' },
  state: { tone: 'blue', emoji: '😐', label: 'Состояние' },
} as const;

export type EventType =
  | 'food'
  | 'water'
  | 'toilet'
  | 'sleep'
  | 'behavior'
  | 'sensory'
  | 'communication'
  | 'aac_card'
  | 'voice_observation'
  | 'phrase'
  | 'media_request'
  | 'sos'
  | 'calm_mode'
  | 'tutor_note'
  | 'specialist_note'
  | 'state';

export type EventTone = 'coral' | 'blue' | 'purple' | 'yellow' | 'teal' | 'green';

export function toneToColor(tone: EventTone): string {
  switch (tone) {
    case 'coral':
      return accent.coral;
    case 'blue':
      return accent.blue;
    case 'purple':
      return accent.purple;
    case 'yellow':
      return accent.yellow;
    case 'teal':
      return brand.teal;
    case 'green':
      return accent.green;
  }
}

export function eventTypeTone(type: string): EventTone {
  const cfg = (eventTypeColors as Record<string, { tone: EventTone }>)[type];
  return cfg?.tone ?? 'blue';
}

export function eventTypeLabel(type: string): string {
  const cfg = (eventTypeColors as Record<string, { label: string }>)[type];
  return cfg?.label ?? type;
}

// =============================================================================
// Event status
// =============================================================================

export const eventStatusColors = {
  draft: { tone: 'muted', label: 'Черновик' },
  needs_review: { tone: 'yellow', label: 'Нужно подтвердить' },
  ai_parsed: { tone: 'blue', label: 'AI-наблюдение' },
  confirmed: { tone: 'green', label: 'Подтверждено' },
  corrected: { tone: 'yellow', label: 'Исправлено' },
  rejected: { tone: 'coral', label: 'Отклонено' },
} as const;

export function eventStatusLabel(status: string): string {
  return (eventStatusColors as Record<string, { label: string }>)[status]?.label ?? status;
}

// =============================================================================
// Geometry
// =============================================================================

export const radii = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 32,
  full: 9999,
} as const;

export const spacing = {
  pageX: 16,
  pageY: 16,
  cardPadding: 20,
  cardPaddingLg: 24,
  sectionGap: 16,
} as const;

// =============================================================================
// Shadow — мягкие, плоские
// =============================================================================

export const shadow = {
  /** Самый слабый — для inline элементов. */
  xs: '0 1px 2px rgba(7, 27, 58, 0.04)',
  /** Soft — для карточек. */
  sm: '0 2px 8px rgba(7, 27, 58, 0.05)',
  /** Default — для крупных блоков. */
  md: '0 4px 16px rgba(7, 27, 58, 0.06)',
  /** Lifted — для nav, модалок. */
  lg: '0 8px 24px rgba(7, 27, 58, 0.08)',
  /** Glow — для hero/CTA. */
  glow: '0 12px 32px rgba(0, 150, 136, 0.18)',
} as const;

// =============================================================================
// Layout
// =============================================================================

export const layout = {
  phoneMaxWidth: 430,
  tabletMaxWidth: 900,
  desktopMaxWidth: 1100,
  mobileFrameWidth: 390,
  mobileFrameHeight: 844,
  /** Clearance to keep fixed elements above BottomNav — update together if BottomNav's height changes. */
  bottomNavClearance: 80,
} as const;

// =============================================================================
// Motion
// =============================================================================

export const motion = {
  duration: {
    fast: 160,
    base: 240,
    slow: 360,
  },
  easing: {
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
    soft: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  },
} as const;

// =============================================================================
// Typography
// =============================================================================

export const typography = {
  display: { size: 32, lineHeight: 1.15, weight: 900 },
  h1: { size: 24, lineHeight: 1.2, weight: 900 },
  h2: { size: 20, lineHeight: 1.25, weight: 800 },
  h3: { size: 16, lineHeight: 1.3, weight: 800 },
  body: { size: 14, lineHeight: 1.5, weight: 500 },
  bodyBold: { size: 14, lineHeight: 1.5, weight: 700 },
  caption: { size: 12, lineHeight: 1.4, weight: 500 },
  tiny: { size: 11, lineHeight: 1.3, weight: 600 },
} as const;

// =============================================================================
// Components
// =============================================================================

export const components = {
  childTouchTarget: 96,
  childTouchTargetLarge: 120,
  adultTouchTarget: 48,
  iconButtonSize: 44,
} as const;

// Re-export для удобства — `import { iconButtonSize } from '@/styles/tokens'`.
export const iconButtonSize = components.iconButtonSize;
export const adultTouchTarget = components.adultTouchTarget;
export const childTouchTarget = components.childTouchTarget;

// =============================================================================
// Child family palette — для сетки 3×2 на ChildHome (v1.5+ polish)
// =============================================================================
//
// Семьи: need (потребности), do (действия), feel (состояние), fav (любимое),
// help (помощь). Каждая: icoBg — фон плитки, lbl — цвет лейбла под иконкой,
// ico — цвет самой иконки.
//
// Эти цвета — те же что в child2d.tsx CHILD_FAMILY_STYLES, но определены
// здесь как hex-значения (для inline style). Сами имена семей и их
// маппинг на компоненты — в child2d.tsx (один источник правды для UI).
export const childFamily = {
  need:  { icoBg: '#EAF5FB', lbl: '#1F5F7D', ico: '#3A9FD4' },
  do:    { icoBg: '#EAF6EF', lbl: '#276B48', ico: '#3AA06B' },
  feel:  { icoBg: '#FBF3E6', lbl: '#8A5D17', ico: '#D9A24E' },
  fav:   { icoBg: '#F1EEFB', lbl: '#5B47A0', ico: '#8A6FC9' },
  help:  { icoBg: '#FBEDED', lbl: '#A24545', ico: '#D97A7A' },
} as const;

// =============================================================================
// ChildHome CTA palette (v1.5+ polish)
// =============================================================================
//
// Два нижних CTA на ChildHome — крупные заметные кнопки. Градиенты,
// цвета и тени вынесены сюда из ChildHome.tsx (где они раньше были
// inline hex).
export const ctaChildHome = {
  /** Coral — «Позвать маму». Мягкий soft-pulse (1.8s loop, гейт по
   *  --child-motion и prefers-reduced-motion). */
  callMom: {
    bgFrom: '#FDEBEC',
    bgTo: '#FBE0E0',
    text: '#C95F5F',
    shadow: '0 6px 16px rgba(229,111,93,0.18)',
  },
  /** Blue → purple — «Собрать фразу». Нейтральный, не привлекает
   *  избыточного внимания. */
  phrase: {
    bgFrom: '#EEF4FB',
    bgTo: '#F3EEFB',
    text: '#1F5F7D',
  },
} as const;

// =============================================================================
// ChildHome sizes (v1.5+ polish)
// =============================================================================
//
// Геометрия элементов главного экрана ребёнка. Все размеры в px.
export const childHomeSizes = {
  /** TopBar высота (включая padding). */
  topBarHeight: 48,
  /** Размер плитки-иконки в карточке 3×2. */
  tileSize: 84,
  /** Размер иконки внутри плитки. */
  tileIcon: 64,
  /** Иконка на CTA «Позвать маму». */
  callMomIcon: 30,
  /** Иконка на CTA «Собрать фразу». */
  phraseIcon: 52,
  /** Минимальная высота CTA «Позвать маму» — touch-target ≥ 76px. */
  callMomMinHeight: 76,
  /** Минимальная высота CTA «Собрать фразу». */
  phraseMinHeight: 88,
  /** Размер кнопок в TopBar (mute / exit). */
  topBarButton: 36,
  /** Размер аватара в TopBar (playful). */
  topBarAvatar: 26,
} as const;

// =============================================================================
// Bundle alias — обратная совместимость
// =============================================================================

export const palette = {
  ...surface,
  ...ink,
  ...brand,
  ...accent,
  ...status,
  border: '#DDE8EA',
  borderSoft: '#EAF1F2',
} as const;

export const qoldauColors = {
  bg: surface.bg,
  surface: surface.surface,
  ink: ink.DEFAULT,
  inkSoft: ink.soft,
  muted: ink.muted,
  line: '#DDE8EA',
  teal: brand.teal,
  tealDark: brand.tealDark,
  tealSoft: brand.tealSoft,
  skySoft: accent.blueSoft,
  greenSoft: accent.greenSoft,
  lavenderSoft: accent.purpleSoft,
  yellowSoft: accent.yellowSoft,
  coralSoft: accent.coralSoft,
  success: status.success,
  warning: status.warning,
} as const;