import React from 'react';

interface BaseIconProps {
  size?: number;
  className?: string;
  'aria-label'?: string;
}

/**
 * QoldauLogoMark — фирменный знак Qoldau AI.
 * Минималистичный abstract: стилизованная буква Q, вписанная в мягкий круг.
 * Используется в AppShell, Overview, EmptyState.
 */
export const QoldauLogoMark: React.FC<BaseIconProps> = ({
  size = 40,
  className = '',
  'aria-label': ariaLabel = 'Qoldau AI',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role={ariaLabel ? 'img' : 'presentation'}
    aria-label={ariaLabel}
    aria-hidden={ariaLabel ? undefined : true}
  >
    <circle cx="20" cy="20" r="18" fill="#DDF5F0" />
    <circle cx="20" cy="20" r="18" stroke="#009688" strokeWidth="2" />
    <path
      d="M14 14a6 6 0 1 1 6 6M20 20l6 6"
      stroke="#00796F"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

/**
 * VoiceWaveIcon — декоративная иконка для voice observation.
 * Три волны с нарастающей амплитудой.
 */
export const VoiceWaveIcon: React.FC<BaseIconProps> = ({
  size = 48,
  className = '',
  'aria-label': ariaLabel = 'Голосовая волна',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role={ariaLabel ? 'img' : 'presentation'}
    aria-label={ariaLabel}
    aria-hidden={ariaLabel ? undefined : true}
  >
    <rect x="6" y="20" width="4" height="8" rx="2" fill="currentColor" opacity="0.5" />
    <rect x="14" y="14" width="4" height="20" rx="2" fill="currentColor" opacity="0.75" />
    <rect x="22" y="10" width="4" height="28" rx="2" fill="currentColor" />
    <rect x="30" y="14" width="4" height="20" rx="2" fill="currentColor" opacity="0.75" />
    <rect x="38" y="20" width="4" height="8" rx="2" fill="currentColor" opacity="0.5" />
  </svg>
);

/**
 * EventTimelineIcon — лента событий: вертикальная timeline с точкой.
 */
export const EventTimelineIcon: React.FC<BaseIconProps> = ({
  size = 48,
  className = '',
  'aria-label': ariaLabel = 'Лента событий',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role={ariaLabel ? 'img' : 'presentation'}
    aria-label={ariaLabel}
    aria-hidden={ariaLabel ? undefined : true}
  >
    <rect x="10" y="6" width="28" height="6" rx="2" fill="currentColor" opacity="0.15" />
    <circle cx="24" cy="9" r="3" fill="currentColor" />
    <rect x="10" y="21" width="28" height="6" rx="2" fill="currentColor" opacity="0.25" />
    <circle cx="24" cy="24" r="3" fill="currentColor" />
    <rect x="10" y="36" width="28" height="6" rx="2" fill="currentColor" opacity="0.4" />
    <circle cx="24" cy="39" r="3" fill="currentColor" />
  </svg>
);

/**
 * AACCardIcon — карточка с речью: прямоугольник с bubbles.
 */
export const AACCardIcon: React.FC<BaseIconProps> = ({
  size = 48,
  className = '',
  'aria-label': ariaLabel = 'AAC карточка',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role={ariaLabel ? 'img' : 'presentation'}
    aria-label={ariaLabel}
    aria-hidden={ariaLabel ? undefined : true}
  >
    <rect
      x="6"
      y="10"
      width="36"
      height="24"
      rx="3"
      fill="currentColor"
      opacity="0.15"
    />
    <rect
      x="6"
      y="10"
      width="36"
      height="24"
      rx="3"
      stroke="currentColor"
      strokeWidth="2"
    />
    <circle cx="14" cy="18" r="2" fill="currentColor" />
    <rect x="18" y="17" width="14" height="2" rx="1" fill="currentColor" opacity="0.6" />
    <rect x="18" y="22" width="20" height="2" rx="1" fill="currentColor" opacity="0.4" />
    <rect x="18" y="27" width="10" height="2" rx="1" fill="currentColor" opacity="0.3" />
    <path
      d="M14 34l2 4 2-2 2 2 2-4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

/**
 * CalmModeIcon — облако с мягкими линиями, ассоциация со спокойствием.
 */
export const CalmModeIcon: React.FC<BaseIconProps> = ({
  size = 48,
  className = '',
  'aria-label': ariaLabel = 'Спокойный режим',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role={ariaLabel ? 'img' : 'presentation'}
    aria-label={ariaLabel}
    aria-hidden={ariaLabel ? undefined : true}
  >
    <path
      d="M14 32h22a10 10 0 0 0 0-20c-1-7-6-12-13-12-9 0-16 7-16 16 0 6 5 12 12 12"
      fill="currentColor"
      opacity="0.15"
    />
    <path
      d="M14 32h22a10 10 0 0 0 0-20c-1-7-6-12-13-12-9 0-16 7-16 16 0 6 5 12 12 12Z"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <circle cx="18" cy="20" r="1.5" fill="currentColor" />
    <circle cx="30" cy="20" r="1.5" fill="currentColor" />
    <path
      d="M21 24c2 1.5 5 1.5 7 0"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

/**
 * QoldauLogoLockup — знак + текст рядом, для header/AppShell.
 */
export const QoldauLogoLockup: React.FC<{
  size?: number;
  className?: string;
  showText?: boolean;
}> = ({ size = 36, className = '', showText = true }) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    <QoldauLogoMark size={size} />
    {showText && (
      <div className="leading-none">
        <div className="text-xs font-medium text-muted tracking-wide">Qoldau</div>
        <div className="text-sm font-black text-ink tracking-tight">AI</div>
      </div>
    )}
  </div>
);