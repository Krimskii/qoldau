/**
 * Qoldau AI — Design Tokens
 *
 * Central source of truth for colors, spacing, typography and motion.
 * All visual constants must come from this file or Tailwind tokens.
 *
 * See docs/DESIGN_SYSTEM.md for the full system documentation.
 */

export const palette = {
  // Surface
  surface: '#FFFFFF',
  background: '#F7FAFA',
  backgroundSoft: '#F0F7F7',

  // Ink
  ink: '#071B3A',
  inkSecondary: '#334E68',
  muted: '#6B7C8F',

  // Border
  border: '#DDE8EA',
  borderSoft: '#EAF1F2',

  // Primary teal
  teal: '#009688',
  tealDark: '#008C8C',
  tealLight: '#00AFA5',
  tealSoft: '#DDF5F0',
  tealTint: '#EAF8F6',

  // Semantic
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

/**
 * qoldauColors — короткий alias под спеку v0.3.8.
 * Использовать в новых компонентах для удобства:
 *   import { qoldauColors } from '@/styles/designTokens';
 *   <div style={{ color: qoldauColors.teal }} />
 */
export const qoldauColors = {
  bg: '#F7FAFA',
  surface: '#FFFFFF',
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
} as const;

export const radii = {
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

export const layout = {
  phoneMaxWidth: 430,
  tabletMaxWidth: 900,
  desktopMaxWidth: 1100,
} as const;

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

export const typography = {
  // Заголовки — тёмно-синие (ink), font-black
  display: { size: 32, lineHeight: 1.15, weight: 900 },
  h1: { size: 24, lineHeight: 1.2, weight: 900 },
  h2: { size: 20, lineHeight: 1.25, weight: 800 },
  h3: { size: 16, lineHeight: 1.3, weight: 800 },
  body: { size: 14, lineHeight: 1.5, weight: 500 },
  bodyBold: { size: 14, lineHeight: 1.5, weight: 700 },
  caption: { size: 12, lineHeight: 1.4, weight: 500 },
  tiny: { size: 11, lineHeight: 1.3, weight: 600 },
} as const;

export const components = {
  childTouchTarget: 96, // px, минимальная высота кнопки для ребёнка
  childTouchTargetLarge: 120,
  adultTouchTarget: 48,
  iconButtonSize: 44,
} as const;

export const roleAccents = {
  parent: 'teal',
  child: 'teal',
  tutor: 'purple',
  specialist: 'blue',
} as const;

export type PaletteKey = keyof typeof palette;
export type RoleKey = keyof typeof roleAccents;