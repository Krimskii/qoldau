import React from 'react';
import clsx from 'clsx';
import { QoldauCard } from './QoldauCard';

interface SectionCardProps {
  /** Заголовок секции. */
  title?: string;
  /** Subtitle / пояснение под заголовком. */
  subtitle?: string;
  /** Действие справа от заголовка (ссылка, кнопка). */
  action?: React.ReactNode;
  /** Контент секции. */
  children: React.ReactNode;
  /** Цветовой акцент секции (tinted фон + цвет заголовка). */
  accent?: 'teal' | 'blue' | 'purple' | 'yellow' | 'coral' | 'green' | 'warm';
  className?: string;
}

/**
 * SectionCard — структурный блок: заголовок + содержимое в QoldauCard.
 *
 * Использование:
 *   <SectionCard title="Сейчас важно" accent="teal">
 *     <Card>...</Card>
 *   </SectionCard>
 *
 * - Заголовок в font-black, единый стиль.
 * - Опциональный tinted фон через accent.
 * - Опциональное действие справа (например, "Все" → переход к списку).
 */
export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  subtitle,
  action,
  children,
  accent,
  className,
}) => {
  const variant: 'default' | 'soft' | 'elevated' | 'outline' =
    accent === 'warm' ? 'soft' : 'default';

  // Tailwind: full class names (не template literal — иначе JIT их не увидит).
  const tintClass = clsx({
    'bg-teal-soft/30': accent === 'teal',
    'bg-blue-soft/30': accent === 'blue',
    'bg-purple-soft/30': accent === 'purple',
    'bg-yellow-soft/30': accent === 'yellow',
    'bg-coral-soft/30': accent === 'coral',
    'bg-green-soft/30': accent === 'green',
  });

  return (
    <section className={clsx('flex flex-col gap-3', className)}>
      {(title || action) && (
        <header className="flex items-end justify-between gap-3 px-1">
          <div className="min-w-0 flex-1">
            {title && (
              <h2
                className={clsx(
                  'text-base font-black tracking-tight text-ink leading-tight',
                  accent === 'teal' && 'text-teal-dark',
                  accent === 'blue' && 'text-blue-dark',
                  accent === 'purple' && 'text-purple',
                  accent === 'yellow' && 'text-yellow',
                  accent === 'coral' && 'text-coral',
                  accent === 'green' && 'text-green-dark',
                )}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs text-muted mt-0.5 leading-snug">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </header>
      )}
      <QoldauCard variant={variant} padding="md" className={clsx(tintClass)}>
        {children}
      </QoldauCard>
    </section>
  );
};