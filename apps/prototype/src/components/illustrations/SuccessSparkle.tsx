import React from 'react';

interface SuccessSparkleProps {
  className?: string;
}

/**
 * SuccessSparkle — мягкая success-галочка в круге.
 * Используется после выбора карточки, сборки фразы и в ChildProgress.
 * Один раз проигрывает qoldau-check (420ms) и остаётся статичной.
 */
export const SuccessSparkle: React.FC<SuccessSparkleProps> = ({ className = '' }) => {
  return (
    <svg
      className={`qoldau-check ${className}`}
      width="88"
      height="88"
      viewBox="0 0 88 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Готово"
    >
      <circle cx="44" cy="44" r="36" fill="#EAF8F0" stroke="#4EC28A" strokeWidth="3" />
      <path
        d="M28 45l11 11 22-25"
        stroke="#2E9F6E"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M20 18l3-7 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill="#F7C948" />
      <path d="M68 62l2-5 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="#BFECE4" />
    </svg>
  );
};