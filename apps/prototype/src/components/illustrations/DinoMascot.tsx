import React from 'react';

interface DinoMascotProps {
  animated?: boolean;
  className?: string;
}

/**
 * DinoMascot — дружелюбный динозаврик для ChildHome и PhraseBuilder.
 * По умолчанию медленно «парит» (qoldau-float, 5s loop).
 */
export const DinoMascot: React.FC<DinoMascotProps> = ({
  animated = true,
  className = '',
}) => {
  return (
    <svg
      className={`${animated ? 'qoldau-float' : ''} ${className}`}
      width="132"
      height="132"
      viewBox="0 0 132 132"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Дружелюбный динозаврик"
    >
      <path
        d="M36 79c0-27 18-48 42-48 18 0 32 13 32 30 0 24-17 43-42 43H48c-7 0-12-5-12-12V79Z"
        fill="#DDF5F0"
        stroke="#82CFC4"
        strokeWidth="3"
      />
      <path
        d="M60 31l-5-13 14 8 3-15 10 13 10-9-1 16"
        fill="#BFECE4"
        stroke="#82CFC4"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle cx="78" cy="57" r="4" fill="#071B3A" />
      <circle cx="100" cy="57" r="4" fill="#071B3A" />
      <path
        d="M82 73c6 4 15 4 21-1"
        stroke="#071B3A"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="69" cy="67" r="5" fill="#FFD9D3" opacity="0.8" />
      <path
        d="M45 101c-8 9-18 13-28 13 4-8 8-14 19-20"
        fill="#DDF5F0"
        stroke="#82CFC4"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M58 104v12M86 102v14"
        stroke="#82CFC4"
        strokeWidth="8"
        strokeLinecap="round"
      />
    </svg>
  );
};