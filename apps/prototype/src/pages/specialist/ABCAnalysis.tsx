import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Brain, Sparkles, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { QoldauCard } from '@/components/ui/QoldauCard';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { ChildSelector } from '@/components/layout/ChildSelector';
import { useEventStore } from '@/store/useEventStore';
import { useDemoControlsStore } from '@/store/useDemoControlsStore';
import { DEMO_CHILDREN } from '@/data/demoDataset';
import { formatDate } from '@/utils/dateFormat';

interface AbcCard {
  id: string;
  title: string;
  description: string;
  timestamp: string;
}

export const ABCAnalysis: React.FC = () => {
  const { t } = useTranslation();
  const { events } = useEventStore();
  const { selectedChildId } = useDemoControlsStore();
  const currentChild = DEMO_CHILDREN.find((c) => c.id === selectedChildId) ?? DEMO_CHILDREN[0];

  const abc = useMemo(() => {
    const childEvents = events.filter((e) => e.childId === selectedChildId);

    const antecedent: AbcCard[] = childEvents
      .filter(
        (e) =>
          e.type === 'sensory' ||
          (e.tags && (e.tags.includes('шум') || e.tags.includes('переход'))),
      )
      .slice(-3)
      .map((e) => ({ id: e.id, title: e.title, description: e.description, timestamp: e.timestamp }));

    const behavior: AbcCard[] = childEvents
      .filter((e) => e.type === 'behavior')
      .slice(-3)
      .map((e) => ({ id: e.id, title: e.title, description: e.description, timestamp: e.timestamp }));

    const consequence: AbcCard[] = childEvents
      .filter((e) => e.type === 'calm_mode' || e.type === 'state')
      .slice(-3)
      .map((e) => ({ id: e.id, title: e.title, description: e.description, timestamp: e.timestamp }));

    return { antecedent, behavior, consequence };
  }, [events, selectedChildId]);

  const totalIncidents = abc.behavior.length;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={t('specialist.abc.title')}
        subtitle={t('specialist.abc.subtitle', { name: currentChild.name })}
        showBack
      />

      <ChildSelector />

      <QoldauCard variant="tinted-teal" padding="md">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center flex-shrink-0">
            <Brain className="w-5 h-5 text-teal" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-ink mb-1">{t('specialist.abc.whatIsAbc')}</p>
            <p className="text-xs text-ink-2 leading-snug">
              {t('specialist.abc.abcExplanation')}
            </p>
          </div>
        </div>
      </QoldauCard>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2.5">
        <QoldauCard variant="default" padding="sm" className="text-center">
          <p className="text-2xl font-black text-blue">{abc.antecedent.length}</p>
          <p className="text-[10px] text-muted mt-0.5 uppercase tracking-wide">
            {t('specialist.abc.triggersLabel')}
          </p>
        </QoldauCard>
        <QoldauCard variant="default" padding="sm" className="text-center">
          <p className="text-2xl font-black text-purple">{totalIncidents}</p>
          <p className="text-[10px] text-muted mt-0.5 uppercase tracking-wide">
            {t('specialist.abc.incidentsLabel')}
          </p>
        </QoldauCard>
        <QoldauCard variant="default" padding="sm" className="text-center">
          <p className="text-2xl font-black text-teal">{abc.consequence.length}</p>
          <p className="text-[10px] text-muted mt-0.5 uppercase tracking-wide">
            {t('specialist.abc.reactionsLabel')}
          </p>
        </QoldauCard>
      </div>

      {/* ABC Flow */}
      <QoldauCard variant="default" padding="md">
        <h3 className="text-sm font-black text-ink mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple" />
          {t('specialist.abc.chainTitle')}
        </h3>

        <div className="space-y-3">
          <AbcColumn
            letter="A"
            label={t('specialist.abc.beforeLabel')}
            bgClass="bg-blue-soft"
            borderClass="border-blue/30"
            textClass="text-blue-dark"
            items={abc.antecedent}
          />
          <div className="flex justify-center -my-1" aria-hidden="true">
            <div className="w-9 h-9 rounded-full bg-white border-2 border-line flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-ink-soft" />
            </div>
          </div>
          <AbcColumn
            letter="B"
            label={t('specialist.abc.whatLabel')}
            bgClass="bg-purple-soft"
            borderClass="border-purple/30"
            textClass="text-purple"
            items={abc.behavior}
          />
          <div className="flex justify-center -my-1" aria-hidden="true">
            <div className="w-9 h-9 rounded-full bg-white border-2 border-line flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-ink-soft" />
            </div>
          </div>
          <AbcColumn
            letter="C"
            label={t('specialist.abc.afterLabel')}
            bgClass="bg-teal-soft"
            borderClass="border-teal/30"
            textClass="text-teal-dark"
            items={abc.consequence}
          />
        </div>
      </QoldauCard>

      {/* Замеченные паттерны (явные гипотезы) — DEMO данные */}
      <QoldauCard variant="default" padding="md">
        <h3 className="text-sm font-black text-ink mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow" />
          {t('specialist.abc.patternsTitle')}
          <DemoBadge label={t('specialist.abc.demoBadge')} />
        </h3>
        <p className="text-[11px] text-muted italic mb-3">
          {t('specialist.abc.patternsHint')}
        </p>
        <div className="space-y-2.5">
          <PatternRow trigger={t('specialist.abc.patternNoise')} triggerContext="громкая музыка, группа, пылесос" behavior="Закрывает уши, отводит взгляд" count={3} />
          <PatternRow trigger={t('specialist.abc.patternChange')} triggerContext="переход между занятиями" behavior="Нервозность, отказ от задания" count={2} />
          <PatternRow trigger={t('specialist.abc.patternHelped')} triggerContext="Пауза 2–3 минуты, тихое место" behavior={t('specialist.abc.patternHint')} count={5} variant="positive" />
        </div>
      </QoldauCard>

      <AIInsightCard text={t('specialist.abc.insightText')} variant="warning" />
    </div>
  );
};

interface AbcColumnProps {
  letter: string;
  label: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  items: AbcCard[];
}

const AbcColumn: React.FC<AbcColumnProps> = ({ letter, label, bgClass, borderClass, textClass, items }) => {
  const { t } = useTranslation();
  const itemsWord = items.length === 1 ? t('specialist.abc.eventWord') : t('specialist.abc.eventsWord');
  return (
    <div className={`rounded-2xl ${bgClass} border ${borderClass} p-3`}>
      <div className="flex items-center gap-2 mb-2.5">
        <div className={`w-7 h-7 rounded-lg bg-white flex items-center justify-center font-black text-sm ${textClass}`}>
          {letter}
        </div>
        <span className={`text-xs font-black uppercase tracking-wide ${textClass}`}>{label}</span>
        <span className="ml-auto text-[10px] font-bold text-muted">
          {items.length} {itemsWord}
        </span>
      </div>
      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="text-xs text-muted text-center py-2 italic">
            {t('specialist.abc.noData')}
          </div>
        ) : (
          items.map((it) => (
            <div key={it.id} className="bg-white rounded-xl p-2.5 border border-line-soft">
              <p className="text-xs font-black text-ink leading-tight">{it.title}</p>
              <p className="text-[11px] text-muted leading-snug mt-0.5">{it.description}</p>
              <p className="text-[10px] text-muted mt-1">
                {formatDate(it.timestamp, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

interface PatternRowProps {
  trigger: string;
  triggerContext: string;
  behavior: string;
  count: number;
  variant?: 'positive' | 'warning';
}

const PatternRow: React.FC<PatternRowProps> = ({ trigger, triggerContext, behavior, count, variant = 'warning' }) => {
  const isPositive = variant === 'positive';
  return (
    <div className={`rounded-xl p-3 ${isPositive ? 'bg-green-soft/50' : 'bg-yellow-soft/50'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-ink">{trigger}</p>
          <p className="text-xs text-muted mt-0.5">{triggerContext}</p>
          <p className="text-xs text-ink-2 mt-1.5">
            <span className="text-muted">→</span> {behavior}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-[10px] font-black flex-shrink-0 ${isPositive ? 'bg-green text-white' : 'bg-yellow text-ink'}`}>
          ×{count}
        </span>
      </div>
    </div>
  );
};