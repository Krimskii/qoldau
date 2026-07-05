import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/layout/PageHeader';
import { QoldauCard } from '@/components/ui/QoldauCard';
import { Badge } from '@/components/ui/Badge';
import { ChildSelector } from '@/components/layout/ChildSelector';
import { useDemoControlsStore } from '@/store/useDemoControlsStore';
import { DEMO_CHILDREN } from '@/data/demoDataset';

export const SupportPlan: React.FC = () => {
  const { t } = useTranslation();
  const { selectedChildId } = useDemoControlsStore();
  const child = DEMO_CHILDREN.find((c) => c.id === selectedChildId) ?? DEMO_CHILDREN[0];

  // Локализованные массивы
  const schedule = t('specialist.supportPlan.schedule', { returnObjects: true }) as string[];
  const sensory = t('specialist.supportPlan.sensory', { returnObjects: true }) as Array<{
    label: string;
    desc: string;
  }>;
  const whatHelps = t('specialist.supportPlan.whatHelpsList', { returnObjects: true }) as string[];
  const toTry = t('specialist.supportPlan.toTryList', { returnObjects: true }) as string[];
  const toConfirm = t('specialist.supportPlan.toConfirmList', { returnObjects: true }) as string[];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={t('specialist.supportPlan.title')}
        subtitle={t('specialist.supportPlan.subtitle', {
          name: child.name,
          age: child.age,
        })}
        showBack
      />

      <ChildSelector />

      <QoldauCard variant="default" className="bg-yellow-soft border-yellow/30">
        <p className="text-sm text-ink-2">
          <strong>{t('specialist.supportPlan.warning')}</strong>
        </p>
      </QoldauCard>

      {/* Visual Schedule */}
      <QoldauCard variant="default">
        <h4 className="text-sm font-bold mb-3">{t('specialist.supportPlan.visualSchedule')}</h4>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {schedule.map((s, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-20 h-16 rounded-xl bg-gradient-to-br from-teal-soft to-white border border-teal/30 flex items-center justify-center text-xs font-bold text-teal-dark"
            >
              {s}
            </div>
          ))}
        </div>
      </QoldauCard>

      {/* Sensory Support */}
      <QoldauCard variant="default">
        <h4 className="text-sm font-bold mb-3">{t('specialist.supportPlan.sensorySupport')}</h4>
        <div className="space-y-2">
          {sensory.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-1.5">
              <span className="text-sm font-bold">{s.label}</span>
              <Badge className="bg-blue-soft text-blue">{s.desc}</Badge>
            </div>
          ))}
        </div>
      </QoldauCard>

      {/* What helps */}
      <QoldauCard variant="default">
        <h4 className="text-sm font-bold mb-3">{t('specialist.supportPlan.whatHelps')}</h4>
        <div className="flex flex-wrap gap-2">
          {whatHelps.map((h) => (
            <Badge key={h} className="bg-green-soft text-green">{h}</Badge>
          ))}
        </div>
      </QoldauCard>

      {/* To try */}
      <QoldauCard variant="default">
        <h4 className="text-sm font-bold mb-3">{t('specialist.supportPlan.toTry')}</h4>
        <ul className="space-y-2">
          {toTry.map((item, i) => (
            <li key={i} className="text-sm text-ink-2 flex items-start gap-2">
              <span className="text-teal mt-1">•</span>
              {item}
            </li>
          ))}
        </ul>
      </QoldauCard>

      {/* To confirm */}
      <QoldauCard variant="default">
        <h4 className="text-sm font-bold mb-3">{t('specialist.supportPlan.toConfirm')}</h4>
        <ul className="space-y-2">
          {toConfirm.map((item, i) => (
            <li key={i} className="text-sm text-ink-2 flex items-start gap-2">
              <span className="text-yellow mt-1">•</span>
              {item}
            </li>
          ))}
        </ul>
      </QoldauCard>

      <QoldauCard variant="default" className="bg-blue-soft border-blue/20">
        <p className="text-sm text-ink-2">
          <strong>{t('specialist.supportPlan.discussTitle')}</strong> {t('specialist.supportPlan.discussBody')}
        </p>
      </QoldauCard>
    </div>
  );
};