import React from 'react';

interface CloudMascotProps {
  mood?: 'calm' | 'happy' | 'sleepy';
  animated?: boolean;
  className?: string;
}

/**
 * CloudMascot — спокойное облачко для CalmMode и EmptyState.
 *
 * Три настроения:
 *  - calm  — открытые глаза, лёгкая улыбка
 *  - happy — закрытые глаза-дуги
 *  - sleepy — закрытые прямые глаза
 *
 * По умолчанию дышит (qoldau-breathe). Если animated=false — статичен.
 */
export const CloudMascot: React.FC<CloudMascotProps> = ({
  mood = 'calm',
  animated = true,
  className = '',
}) => {
  const eyes =
    mood === 'happy'
      ? (
        <>
          <path d="M33 43c2 3 6 3 8 0" stroke="#071B3A" strokeWidth="3" strokeLinecap="round" />
          <path d="M59 43c2 3 6 3 8 0" stroke="#071B3A" strokeWidth="3" strokeLinecap="round" />
        </>
      )
      : mood === 'sleepy'
        ? (
          <>
            <path d="M32 43h10" stroke="#071B3A" strokeWidth="3" strokeLinecap="round" />
            <path d="M58 43h10" stroke="#071B3A" strokeWidth="3" strokeLinecap="round" />
          </>
        )
        : (
          <>
            <circle cx="37" cy="43" r="3" fill="#071B3A" />
            <circle cx="63" cy="43" r="3" fill="#071B3A" />
          </>
        );

  return (
    <svg
      className={`${animated ? 'qoldau-breathe' : ''} ${className}`}
      width="120"
      height="96"
      viewBox="0 0 120 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Спокойное облачко"
    >
      <path
        d="M35 72h48c14 0 25-10 25-23 0-12-10-22-22-23C81 14 70 7 57 7 42 7 30 17 27 31 17 34 10 42 10 52c0 11 10 20 25 20Z"
        fill="#EAF5FF"
        stroke="#BFDDF5"
        strokeWidth="3"
      />
      <path
        d="M28 36c4-13 15-21 29-21 12 0 22 7 27 18"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.8"
      />
      {eyes}
      <path
        d="M48 56c6 5 18 5 24 0"
        stroke="#071B3A"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="26" cy="52" r="5" fill="#FFD9D3" opacity="0.75" />
      <circle cx="82" cy="52" r="5" fill="#FFD9D3" opacity="0.75" />
    </svg>
  );
};