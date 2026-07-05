/**
 * useCurrentChild — единый источник выбранного ребёнка (v1.5 E7.3).
 *
 * Заменяет хардкод `DEMO_PRIMARY_CHILD` в parent-страницах на динамическое
 * значение из `useDemoControlsStore.selectedChildId`. Так фильтры событий
 * и все метрики автоматически консистентны между страницами.
 *
 * Если в store нет выбранного ребёнка — фолбэк на DEMO_PRIMARY_CHILD.
 */
import { useMemo } from 'react';
import { useDemoControlsStore } from '@/store/useDemoControlsStore';
import { DEMO_CHILDREN, DEMO_PRIMARY_CHILD } from '@/data/demoDataset';

export interface CurrentChild {
  id: string;
  name: string;
  age: number;
  avatar: string;
  /** Весь child-объект из DEMO_CHILDREN. */
  child: (typeof DEMO_CHILDREN)[number];
}

export function useCurrentChild(): CurrentChild {
  const selectedChildId = useDemoControlsStore((s) => s.selectedChildId);
  return useMemo(() => {
    const found = DEMO_CHILDREN.find((c) => c.id === selectedChildId);
    const child = found ?? DEMO_PRIMARY_CHILD;
    return {
      id: child.id,
      name: child.name,
      age: child.age,
      avatar: child.avatar ?? '',
      child,
    };
  }, [selectedChildId]);
}