import React from 'react';

/**
 * Flat SVG icon set for Qoldau AI.
 *
 * - Outline-only (stroke-based), no fills, 2px stroke by default.
 * - Single accent color via `currentColor` — wraps with `text-*` classes.
 * - 32x32 viewBox by default, scalable via `size` prop.
 * - Минимум анимации: иконки статичны, `animated` опционально вешает qoldau-breathe.
 *
 * Использование:
 *   <WaterIcon className="w-8 h-8 text-blue" />
 *   <SparkleIcon size={48} className="text-teal" animated />
 */

export interface IconProps {
  size?: number;
  className?: string;
  /** Если true — повесить qoldau-breathe для медленной "живой" иконки. По умолчанию false. */
  animated?: boolean;
  /** Stroke width override. По умолчанию 2. */
  strokeWidth?: number;
  'aria-label'?: string;
}

const IconBase: React.FC<
  IconProps & { children: React.ReactNode; viewBox?: string; filled?: boolean }
> = ({
  size = 32,
  className = '',
  animated = false,
  strokeWidth = 2,
  children,
  viewBox = '0 0 32 32',
  filled = false,
  'aria-label': ariaLabel,
}) => (
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    fill={filled ? 'currentColor' : 'none'}
    stroke={filled ? 'none' : 'currentColor'}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${animated ? 'qoldau-breathe' : ''} ${className}`}
    role={ariaLabel ? 'img' : 'presentation'}
    aria-label={ariaLabel}
    aria-hidden={ariaLabel ? undefined : true}
  >
    {children}
  </svg>
);

// =============================================================================
// Basic needs
// =============================================================================

export const WaterIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <path d="M16 4c-5 7-9 12-9 17a9 9 0 0 0 18 0c0-5-4-10-9-17Z" />
    <path d="M11 21c0 3 2 5 5 5" opacity="0.6" />
  </IconBase>
);

export const FoodIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <circle cx="16" cy="18" r="9" />
    <path d="M16 9c-1-3 1-5 3-5M11 11c-3-1-5 0-5 3M22 11c2-2 2-5 0-6" />
  </IconBase>
);

export const ToiletIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <rect x="6" y="6" width="20" height="6" rx="2" />
    <path d="M9 12v6a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4v-6" />
    <path d="M9 26h14" />
  </IconBase>
);

export const TiredIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <path d="M5 21h22" />
    <path d="M9 17l-2-2M23 17l2-2" />
    <path d="M19 11l-2 2 3 2-2 2" />
    <circle cx="14" cy="14" r="0.8" fill="currentColor" />
  </IconBase>
);

// =============================================================================
// Communication
// =============================================================================

export const SpeakIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <rect x="13" y="5" width="6" height="14" rx="3" />
    <path d="M9 14a7 7 0 0 0 14 0" />
    <path d="M16 21v5M12 26h8" />
  </IconBase>
);

export const HugIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <path d="M16 27s-9-5.5-9-13a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 7.5-9 13-9 13Z" />
  </IconBase>
);

export const HelpIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <path d="M16 4v13" />
    <path d="M9 9l7 8 7-8" />
    <circle cx="16" cy="24" r="1.6" fill="currentColor" />
  </IconBase>
);

export const YesIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <path d="M8 17l5 5 11-13" />
  </IconBase>
);

export const NoIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <path d="M9 9l14 14M23 9L9 23" />
  </IconBase>
);

export const OtherIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <circle cx="8" cy="16" r="1.5" fill="currentColor" />
    <circle cx="16" cy="16" r="1.5" fill="currentColor" />
    <circle cx="24" cy="16" r="1.5" fill="currentColor" />
  </IconBase>
);

export const SadIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <circle cx="16" cy="16" r="11" />
    <circle cx="12" cy="13" r="0.8" fill="currentColor" />
    <circle cx="20" cy="13" r="0.8" fill="currentColor" />
    <path d="M11 22c2-2 8-2 10 0" />
  </IconBase>
);

// =============================================================================
// Activities & navigation
// =============================================================================

export const MusicIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <path d="M11 24V8l14-3v16" />
    <circle cx="8" cy="24" r="3" />
    <circle cx="22" cy="21" r="3" />
  </IconBase>
);

export const BreathIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <path d="M3 16h4c2 0 2-4 4-4s2 8 4 8 2-4 4-4h4c2 0 2 4 4 4" />
  </IconBase>
);

export const HeadphonesIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <path d="M5 18a11 11 0 0 1 22 0" />
    <rect x="4" y="18" width="6" height="9" rx="2" />
    <rect x="22" y="18" width="6" height="9" rx="2" />
  </IconBase>
);

export const MoonIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <path d="M22 20a10 10 0 1 1-10-14 8 8 0 0 0 10 14Z" />
  </IconBase>
);

export const PauseIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <rect x="9" y="6" width="4" height="20" rx="1" />
    <rect x="19" y="6" width="4" height="20" rx="1" />
  </IconBase>
);

export const PlayIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <path d="M11 6v20l15-10L11 6Z" />
  </IconBase>
);

export const FavoritesIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <path d="M16 27s-10-5.5-10-13a5.5 5.5 0 0 1 10-3 5.5 5.5 0 0 1 10 3c0 7.5-10 13-10 13Z" />
  </IconBase>
);

export const HomeIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <path d="M5 14l11-9 11 9" />
    <path d="M8 13v13h16V13" />
    <path d="M14 26v-7h4v7" />
  </IconBase>
);

// =============================================================================
// Utility / decorative
// =============================================================================

export const SparkleIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <path d="M16 4l2 8 8 2-8 2-2 8-2-8-8-2 8-2Z" />
    <path d="M25 22l1 3 3 1-3 1-1 3-1-3-3-1 3-1Z" />
  </IconBase>
);

export const CheckIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <path d="M7 17l6 6 13-15" />
  </IconBase>
);

export const ArrowRightIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <path d="M6 16h20M19 8l8 8-8 8" />
  </IconBase>
);

export const BellIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <path d="M16 4a8 8 0 0 0-8 8v6l-3 5h22l-3-5v-6a8 8 0 0 0-8-8Z" />
    <path d="M13 26a3 3 0 0 0 6 0" />
  </IconBase>
);

export const SettingsIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <circle cx="16" cy="16" r="3" />
    <path d="M16 4v3M16 25v3M4 16h3M25 16h3M8 8l2 2M22 22l2 2M8 24l2-2M22 10l2-2" />
  </IconBase>
);

export const SunIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <circle cx="16" cy="16" r="5" />
    <path d="M16 3v3M16 26v3M3 16h3M26 16h3M6 6l2 2M24 24l2 2M6 26l2-2M24 8l2-2" />
  </IconBase>
);

export const ChartIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <path d="M5 27h22" />
    <rect x="8" y="16" width="4" height="9" rx="1" />
    <rect x="14" y="11" width="4" height="14" rx="1" />
    <rect x="20" y="6" width="4" height="19" rx="1" />
  </IconBase>
);

export const CalendarIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <rect x="5" y="7" width="22" height="20" rx="2" />
    <path d="M5 13h22M11 4v6M21 4v6" />
  </IconBase>
);

export const MicIcon: React.FC<IconProps> = SpeakIcon;

export const PlusIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <path d="M16 5v22M5 16h22" />
  </IconBase>
);

// =============================================================================
// Asset registry — дополнительные иконки по builtinKey
// =============================================================================

export const MomIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <circle cx="16" cy="11" r="5" />
    <path d="M6 27c0-6 4-10 10-10s10 4 10 10" />
    <path d="M11 8c1-2 3-3 5-3s4 1 5 3" />
  </IconBase>
);

export const DadIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <circle cx="16" cy="11" r="5" />
    <path d="M6 27c0-6 4-10 10-10s10 4 10 10" />
    <path d="M11 9c1-3 3-4 5-4s4 1 5 4" />
  </IconBase>
);

export const TutorIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <circle cx="16" cy="11" r="5" />
    <path d="M6 27c0-6 4-10 10-10s10 4 10 10" />
    <rect x="9" y="14" width="14" height="3" rx="1" />
  </IconBase>
);

export const SleepIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <path d="M5 22h22" />
    <path d="M19 11l-2 2 3 2-2 2" />
    <circle cx="13" cy="14" r="0.8" fill="currentColor" />
    <circle cx="11" cy="17" r="0.6" fill="currentColor" />
  </IconBase>
);

export const WalkIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <circle cx="18" cy="6" r="3" />
    <path d="M14 11l4 4-3 4 3 8M19 15l5 3-1 6" />
    <path d="M11 14l3 1" />
  </IconBase>
);

export const StudyIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <path d="M5 9l11-4 11 4-11 4L5 9Z" />
    <path d="M9 11v9c2 1.5 5 2 7 2s5-.5 7-2v-9" />
    <path d="M27 9v9" />
  </IconBase>
);

export const SOSIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p} strokeWidth={2.5}>
    <circle cx="16" cy="16" r="13" />
    <path d="M16 9v8M16 21v0.5" />
  </IconBase>
);

export const MessageIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <path d="M5 7h22v15H14l-6 5v-5H5z" />
    <path d="M11 13h10M11 17h6" />
  </IconBase>
);

export const StarIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <path d="M16 4l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z" />
  </IconBase>
);

export const TrophyIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <path d="M9 6h14v8a7 7 0 0 1-14 0V6Z" />
    <path d="M5 6h4v3a3 3 0 0 1-3 3M27 6h-4v3a3 3 0 0 0 3 3" />
    <path d="M12 21h8M14 26h4" />
  </IconBase>
);

export const PhraseIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <rect x="5" y="9" width="8" height="5" rx="1.5" />
    <rect x="14" y="9" width="8" height="5" rx="1.5" />
    <rect x="9" y="18" width="8" height="5" rx="1.5" />
    <rect x="18" y="18" width="6" height="5" rx="1.5" />
  </IconBase>
);

export const AnimalsIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <circle cx="16" cy="17" r="6" />
    <path d="M11 12c-2 1-3 3-3 5M21 12c2 1 3 3 3 5" />
    <circle cx="13" cy="16" r="0.8" fill="currentColor" />
    <circle cx="19" cy="16" r="0.8" fill="currentColor" />
    <path d="M14 20c1 1 3 1 4 0" />
  </IconBase>
);

export const CarsIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <path d="M5 19l2-7c1-2 3-3 5-3h8c2 0 4 1 5 3l2 7" />
    <rect x="4" y="19" width="24" height="6" rx="2" />
    <circle cx="10" cy="25" r="2.5" />
    <circle cx="22" cy="25" r="2.5" />
  </IconBase>
);

export const CartoonIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <rect x="5" y="9" width="22" height="14" rx="2" />
    <path d="M14 13l5 3-5 3v-6Z" fill="currentColor" stroke="none" />
  </IconBase>
);

export const TabletIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <rect x="5" y="4" width="22" height="22" rx="3" />
    <circle cx="16" cy="23" r="0.8" fill="currentColor" />
    <path d="M10 8h12v12H10z" />
  </IconBase>
);

export const UserIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <circle cx="16" cy="12" r="5" />
    <path d="M6 27c0-6 4-10 10-10s10 4 10 10" />
  </IconBase>
);

export const ArrowLeftIcon: React.FC<IconProps> = (p) => (
  <IconBase {...p}>
    <path d="M26 16H6M13 8l-8 8 8 8" />
  </IconBase>
);

export const CartIcon: React.FC<IconProps> = CalendarIcon;