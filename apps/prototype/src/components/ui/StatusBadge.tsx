import React from 'react';
import clsx from 'clsx';
import { Badge } from './Badge';

/**
 * Семантические состояния ребёнка для StatusBadge.
 * В UX-копи — нейтральные, не диагностические, без medical claims.
 */
export type StatusKind =
  | 'ok' // Сейчас всё хорошо
  | 'help' // Нужна поддержка
  | 'calm' // Спокойствие
  | 'tired' // Устал
  | 'focus' // Сосредоточен
  | 'neutral';

interface StatusBadgeProps {
  kind: StatusKind;
  label: string;
  icon?: React.ReactNode;
  className?: string;
}

const KIND_TO_VARIANT: Record<
  StatusKind,
  'green' | 'coral' | 'teal' | 'blue' | 'yellow' | 'purple' | 'outline'
> = {
  ok: 'green',
  help: 'coral',
  calm: 'teal',
  tired: 'blue',
  focus: 'purple',
  neutral: 'outline',
};

/**
 * StatusBadge — компактный pill, показывающий состояние ребёнка.
 *
 * Используется в:
 * - ChildHome hero («Я в порядке», «Нужна помощь»).
 * - Specialist dashboard (как сводный индикатор).
 *
 * Содержит иконку (опционально) + label. Цвет берётся из kind.
 *
 * Без medical claims — это наблюдение, а не диагноз.
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  kind,
  label,
  icon,
  className,
}) => {
  const variant = KIND_TO_VARIANT[kind];
  return (
    <Badge variant={variant} icon={icon} className={clsx('px-3 py-1.5 text-sm', className)}>
      {label}
    </Badge>
  );
};