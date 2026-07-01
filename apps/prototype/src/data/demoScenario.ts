/**
 * Demo scenario — публичный API для Guided Demo и seed данных.
 * Реализация живёт в src/data/demoDataset.ts.
 *
 * Здесь оставлена обратная совместимость со старыми импортами
 * (например, в useEventStore.ts) и helper для Step 7.
 */

import { QoldauEvent } from '@/types/qoldau';

export { DEMO_EVENTS, DEMO_CHILDREN, DEMO_PRIMARY_CHILD } from './demoDataset';
export {
  seedDemoEvents,
  resetDemoData,
  getDemoChild,
  getDemoEventsByChild,
  getDemoTimelineSummary,
  getDemoCommunicationProfile,
  getDemoTutorReport,
  getDemoSpecialistSummary,
  DEMO_PRIMARY_CHILD_ID,
} from './demoDataset';

import type { ChildProfile } from '@/types/qoldau';
import { getDemoChild as _getDemoChild, getDemoEventsByChild as _getDemoEventsByChild, getDemoTimelineSummary as _getDemoTimelineSummary, getDemoCommunicationProfile as _getDemoCommunicationProfile, getDemoTutorReport as _getDemoTutorReport, getDemoSpecialistSummary as _getDemoSpecialistSummary, resetDemoData as _resetDemoData } from './demoDataset';

// Re-export alias with the same names Guided Demo expects
export const getDemoChild_ = (id: string): ChildProfile | undefined => _getDemoChild(id);

// Stable event id for Guided Demo Step 7 — must exist after seedDemoEvents()
export const DEMO_DETAILS_EVENT_ID = 'evt-1-5';

// Convenience helpers used by DemoIndicator
export function ensureDemoEventsSeeded(existing: QoldauEvent[]): QoldauEvent[] {
  return _resetDemoData().length > existing.length ? _resetDemoData() : existing;
}