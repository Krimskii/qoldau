import React from 'react';
import clsx from 'clsx';
import { ChevronLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getFallbackPath } from '@/config/navigation';

interface BackButtonProps {
  /**
   * Override fallback. По умолчанию — fallback для текущего pathname
   * из navigation config.
   */
  fallbackPath?: string;
  label?: string;
  variant?: 'icon' | 'text' | 'pill';
  className?: string;
}

/**
 * BackButton — безопасная кнопка «Назад».
 *
 * - Если есть browser history (`index > 0`) → navigate(-1).
 * - Иначе → переход на fallbackPath (по умолчанию из navigation config).
 *
 * Использовать вместо inline `navigate(-1)` во всех страницах,
 * чтобы пользователь НИКОГДА не оказывался в тупике.
 */
export const BackButton: React.FC<BackButtonProps> = ({
  fallbackPath,
  label,
  variant = 'icon',
  className,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    // Browser history есть, если index > 0 (т.е. пользователь
    // пришёл сюда не первым в этой сессии).
    const hasHistory = window.history.length > 1 && window.history.state?.idx > 0;

    if (hasHistory) {
      navigate(-1);
      return;
    }

    // Fallback: либо переданный, либо из config.
    const target = fallbackPath ?? getFallbackPath(location.pathname);
    navigate(target);
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        className={clsx(
          'w-11 h-11 rounded-2xl bg-white border border-line flex items-center justify-center hover:bg-teal-soft transition-colors shadow-card-soft flex-shrink-0',
          className,
        )}
        aria-label={label ?? 'Назад'}
      >
        <ChevronLeft className="w-5 h-5 text-ink" />
      </button>
    );
  }

  if (variant === 'pill') {
    return (
      <button
        onClick={handleClick}
        className={clsx(
          'inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-line text-sm font-bold text-ink hover:bg-teal-soft hover:border-teal/40 transition-colors shadow-card-soft',
          className,
        )}
        aria-label={label ?? 'Назад'}
      >
        <ChevronLeft className="w-4 h-4" />
        {label ?? 'Назад'}
      </button>
    );
  }

  // 'text' — минималистичный, без рамки
  return (
    <button
      onClick={handleClick}
      className={clsx(
        'inline-flex items-center gap-1 text-sm font-bold text-muted hover:text-teal-dark transition-colors',
        className,
      )}
      aria-label={label ?? 'Назад'}
    >
      <ChevronLeft className="w-4 h-4" />
      {label ?? 'Назад'}
    </button>
  );
};