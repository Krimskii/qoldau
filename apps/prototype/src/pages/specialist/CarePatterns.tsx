import React, { useMemo } from 'react';
import { ArrowRight, Clock, Brain, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { QoldauCard } from '@/components/ui/QoldauCard';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { ChildSelector } from '@/components/layout/ChildSelector';
import { useEventStore } from '@/store/useEventStore';
import { useDemoControlsStore } from '@/store/useDemoControlsStore';
import { DEMO_CHILDREN } from '@/data/demoDataset';
import { QoldauEvent } from '@/types/qoldau';

interface Pattern {
  type: 'cause-effect' | 'time-cluster' | 'recurring';
  title: string;
  description: string;
  confidence: 'high' | 'medium' | 'low';
  events: Array<{ title: string; timestamp: string; icon?: string }>;
}

export const CarePatterns: React.FC = () => {
  const { events } = useEventStore();
  const { selectedChildId } = useDemoControlsStore();
  const currentChild = DEMO_CHILDREN.find((c) => c.id === selectedChildId) ?? DEMO_CHILDREN[0];

  const childEvents = useMemo(
    () => events.filter((e) => e.childId === selectedChildId),
    [events, selectedChildId],
  );

  const summary = useMemo(() => {
    const byType = (t: QoldauEvent['type']) =>
      childEvents.filter((e) => e.type === t).length;
    return {
      food: byType('food'),
      water: byType('water'),
      toilet: byType('toilet'),
      sleep: byType('sleep'),
      sensory: byType('sensory'),
      behavior: byType('behavior'),
      calm: byType('calm_mode'),
    };
  }, [childEvents]);

  // Time-of-day clustering: when do sensory events happen?
  const timeClustering = useMemo(() => {
    const buckets: Record<string, number> = {
      'Утро (6-12)': 0,
      'День (12-17)': 0,
      'Вечер (17-21)': 0,
      'Ночь (21-6)': 0,
    };
    childEvents
      .filter((e) => e.type === 'sensory' || e.type === 'behavior')
      .forEach((e) => {
        const hour = new Date(e.timestamp).getHours();
        if (hour >= 6 && hour < 12) buckets['Утро (6-12)']++;
        else if (hour >= 12 && hour < 17) buckets['День (12-17)']++;
        else if (hour >= 17 && hour < 21) buckets['Вечер (17-21)']++;
        else buckets['Ночь (21-6)']++;
      });
    return buckets;
  }, [childEvents]);

  // Pattern: food → sensory within 30 min
  const foodToSensoryPatterns = useMemo<Pattern[]>(() => {
    const foods = childEvents.filter((e) => e.type === 'food');
    const sensory = childEvents.filter((e) => e.type === 'sensory' || e.type === 'behavior');
    const matches: Array<{ food: QoldauEvent; reaction: QoldauEvent; gap: number }> = [];

    foods.forEach((f) => {
      sensory.forEach((s) => {
        const gap = (new Date(s.timestamp).getTime() - new Date(f.timestamp).getTime()) / 60000;
        if (gap > 0 && gap <= 30) {
          matches.push({ food: f, reaction: s, gap });
        }
      });
    });

    return matches.slice(0, 3).map((m) => ({
      type: 'cause-effect' as const,
      title: `Еда → сенсорная реакция через ${Math.round(m.gap)} мин`,
      description: 'Похоже, после приёма пищи иногда появляется сенсорная реакция. Можно обсудить со специалистом.',
      confidence: matches.length >= 3 ? 'high' : 'medium',
      events: [
        { title: m.food.title, timestamp: m.food.timestamp },
        { title: m.reaction.title, timestamp: m.reaction.timestamp },
      ],
    }));
  }, [childEvents]);

  // Recurring calm pattern
  const calmPatterns = useMemo<Pattern[]>(() => {
    const calms = childEvents.filter((e) => e.type === 'calm_mode');
    if (calms.length === 0) return [];
    return [{
      type: 'recurring' as const,
      title: 'Спокойный режим помогает',
      description: `Спокойный режим использовался ${calms.length} раз. Похоже, после паузы ребёнок возвращается к активности спокойнее.`,
      confidence: 'high',
      events: calms.slice(-3).map((c) => ({ title: c.title, timestamp: c.timestamp })),
    }];
  }, [childEvents]);

  const allPatterns = [...foodToSensoryPatterns, ...calmPatterns];

  const maxTimeCluster = Math.max(1, ...Object.values(timeClustering));

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Паттерны ухода"
        subtitle={`${currentChild.name} · связь событий`}
        showBack
      />

      <ChildSelector />

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-2.5">
        <SummaryCard label="Еда" value={summary.food} color="green" />
        <SummaryCard label="Вода" value={summary.water} color="blue" />
        <SummaryCard label="Туалет" value={summary.toilet} color="purple" />
        <SummaryCard label="Сенсорика" value={summary.sensory} color="yellow" />
      </div>

      {/* Time-of-day clustering — bar chart */}
      <QoldauCard variant="default" padding="md">
        <h3 className="text-sm font-black mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue" />
          В какое время суток сложнее всего
        </h3>
        <p className="text-xs text-muted mb-3">
          Сенсорные реакции и нервозность — по времени дня.
        </p>
        <div className="space-y-2.5">
          {Object.entries(timeClustering).map(([period, count]) => (
            <div key={period} className="flex items-center gap-2.5">
              <span className="w-24 text-xs text-ink-2 font-bold">{period}</span>
              <div className="flex-1 h-6 bg-bg rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-blue-soft to-blue rounded-full transition-all duration-500"
                  style={{ width: `${(count / maxTimeCluster) * 100}%` }}
                  role="progressbar"
                  aria-valuenow={count}
                  aria-valuemin={0}
                  aria-valuemax={maxTimeCluster}
                />
                {count > 0 && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue">
                    {count}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted">
          <span className="text-yellow">⚠</span>
          Самое сложное время:{' '}
          <strong className="text-ink">
            {Object.entries(timeClustering).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'}
          </strong>
        </div>
      </QoldauCard>

      {/* Patterns — cause-effect chains */}
      {allPatterns.length > 0 && (
        <QoldauCard variant="default" padding="md">
          <h3 className="text-sm font-black mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple" />
            Связи событий (гипотезы)
          </h3>
          <div className="space-y-3">
            {allPatterns.map((p, i) => (
              <PatternCard key={i} pattern={p} />
            ))}
          </div>
        </QoldauCard>
      )}

      {/* Behavior Connection — wider context */}
      <QoldauCard variant="default" padding="md">
        <h3 className="text-sm font-black mb-3 flex items-center gap-2">
          <Brain className="w-4 h-4 text-teal" />
          Общая картина
        </h3>
        <p className="text-sm text-ink-2 leading-relaxed">
          Похоже, нервозность чаще появляется через 20–30 минут после еды или при шуме.
          Возможна связь с пищеварением или сенсорной перегрузкой. Спокойный режим и
          короткие паузы помогают. Это наблюдение, не диагноз.
        </p>
      </QoldauCard>

      <AIInsightCard
        text="Похоже, можно отслеживать потребление воды и связь с событиями поведения. Это наблюдение, не диагноз. Можно обсудить со специалистом."
        variant="warning"
      />
    </div>
  );
};

interface SummaryCardProps {
  label: string;
  value: number;
  color: 'green' | 'blue' | 'purple' | 'yellow';
}

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, color }) => {
  const colorClass = {
    green: 'text-green',
    blue: 'text-blue',
    purple: 'text-purple',
    yellow: 'text-yellow',
  }[color];
  return (
    <QoldauCard variant="default" padding="sm" className="text-center">
      <p className={`text-2xl font-black ${colorClass}`}>{value}</p>
      <p className="text-[10px] text-muted mt-0.5 uppercase tracking-wide">{label}</p>
    </QoldauCard>
  );
};

const PatternCard: React.FC<{ pattern: Pattern }> = ({ pattern }) => {
  const confBadge = {
    high: { label: 'Высокая', className: 'bg-green text-white' },
    medium: { label: 'Средняя', className: 'bg-yellow text-ink' },
    low: { label: 'Низкая', className: 'bg-bg text-muted' },
  }[pattern.confidence];

  return (
    <div className="bg-bg rounded-2xl p-3 border border-line-soft">
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-black text-ink leading-tight">{pattern.title}</p>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black flex-shrink-0 ${confBadge.className}`}>
          {confBadge.label}
        </span>
      </div>
      <p className="text-xs text-ink-2 leading-relaxed mb-2.5">{pattern.description}</p>

      {/* Cause-effect chain */}
      {pattern.events.length >= 2 && (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white rounded-xl p-2 border border-line-soft">
            <p className="text-[10px] text-muted uppercase tracking-wide mb-0.5">Событие 1</p>
            <p className="text-xs font-black text-ink leading-tight">{pattern.events[0].title}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted flex-shrink-0" />
          <div className="flex-1 bg-white rounded-xl p-2 border border-line-soft">
            <p className="text-[10px] text-muted uppercase tracking-wide mb-0.5">Событие 2</p>
            <p className="text-xs font-black text-ink leading-tight">{pattern.events[1].title}</p>
          </div>
        </div>
      )}
    </div>
  );
};