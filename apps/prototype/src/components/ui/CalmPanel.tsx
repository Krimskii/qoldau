import React from 'react';
import clsx from 'clsx';
import { CloudMascot } from '@/components/illustrations/CloudMascot';

interface CalmPanelProps {
  /** Заголовок-успокоение ("Можно отдохнуть"). */
  title: string;
  /** Подпись-поддержка ("Ты в безопасности · Я рядом"). */
  subtitle?: string;
  /** Mood для маскота CloudMascot (по умолчанию calm). */
  mood?: 'calm' | 'happy';
  /** Размер маскота. */
  mascotSize?: 'sm' | 'md' | 'lg';
  /** Контент под hero (таймер, опции, кнопки). */
  children: React.ReactNode;
  /** Доп. текст внизу панели (например, "Я рядом ♥"). */
  footerNote?: React.ReactNode;
  className?: string;
}

/**
 * CalmPanel — самый спокойный экран в Qoldau.
 *
 * Используется в CalmMode и любых safety-ориентированных surfaces.
 *
 * Особенности:
 * - Мягкий gradient фон (blue → soft white → purple), не вызывает тревоги.
 * - CloudMascot как объект безопасности.
 * - Поддерживающий текст ("Ты в безопасности").
 * - Footer note с теплотой.
 *
 * Без анимаций > 360ms (sensory-safe).
 */
export const CalmPanel: React.FC<CalmPanelProps> = ({
  title,
  subtitle,
  mood = 'calm',
  mascotSize = 'md',
  children,
  footerNote,
  className,
}) => {
  const mascotClass = clsx(
    mascotSize === 'sm' && 'w-20 h-20',
    mascotSize === 'md' && 'w-28 h-auto',
    mascotSize === 'lg' && 'w-36 h-auto',
  );

  return (
    <div
      className={clsx(
        'flex flex-col gap-5 min-h-[calc(100vh-80px)]',
        'bg-gradient-to-br from-[#EAF5FF] via-[#F9FCFC] to-[#F1EDFF]',
        '-mx-5 -mt-2 px-5 pt-3 pb-5 rounded-t-3xl',
        className,
      )}
    >
      {/* Hero — маскот + поддерживающие тексты */}
      <div className="flex flex-col items-center pt-2">
        <CloudMascot mood={mood} animated className={mascotClass} />
        <h2 className="text-xl font-black text-ink mt-3 text-center">{title}</h2>
        {subtitle && (
          <p className="text-sm text-muted mt-1 text-center">{subtitle}</p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-4">{children}</div>

      {/* Footer note */}
      {footerNote && (
        <div className="text-center pt-2">
          {typeof footerNote === 'string' ? (
            <p className="font-black text-ink-2 text-sm">{footerNote}</p>
          ) : (
            footerNote
          )}
        </div>
      )}
    </div>
  );
};