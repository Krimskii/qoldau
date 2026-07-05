/**
 * Barrel exports для design system.
 *
 * Содержит канонические имена + алиасы для соответствия дизайн-спеку:
 * - IconTile ↔ QoldauIconCard
 * - ActionCard ↔ QoldauActionCard
 */

export { QoldauCard, type QoldauCardProps } from './QoldauCard';
export { ConfirmSheet, type ConfirmSheetProps } from './ConfirmSheet';
export {
  QoldauIconCard,
  COLOR_MAP,
  type QoldauIconColor,
  type QoldauIconState,
  type QoldauIconSize,
} from './QoldauIconCard';
export { QoldauActionCard, type QoldauActionState } from './QoldauActionCard';

// Design spec aliases
export { QoldauIconCard as IconTile } from './QoldauIconCard';
export { QoldauActionCard as ActionCard } from './QoldauActionCard';

export { Button } from './Button';
export { Badge } from './Badge';
export { StatusBadge, type StatusKind } from './StatusBadge';
export { SectionCard } from './SectionCard';
export { CalmPanel } from './CalmPanel';

export { Card } from './Card';
export { EmptyState } from './EmptyState';
export { MetricCard } from './MetricCard';
export { AIInsightCard } from './AIInsightCard';
export { TimelineItem } from './TimelineItem';
export { AppIcon } from './AppIcon';
export { MicButton } from './MicButton';
export { ToastContainer } from './ToastContainer';
export { VoiceWave } from './VoiceWave';
export { PrimaryAction, RoleBadge, EventTypeBadge, EventStatusBadge, MobileFrame } from './Primitives';