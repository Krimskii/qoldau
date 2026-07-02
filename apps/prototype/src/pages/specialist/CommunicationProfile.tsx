import React, { useMemo } from 'react';
import {
  CheckCircle,
  MessageCircle,
  TrendingUp,
  Brain,
  Calendar,
  Users,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { QoldauCard } from '@/components/ui/QoldauCard';
import { Badge } from '@/components/ui/Badge';
import { ChildSelector } from '@/components/layout/ChildSelector';
import { useEventStore } from '@/store/useEventStore';
import { useDemoControlsStore } from '@/store/useDemoControlsStore';
import { DEMO_CHILDREN } from '@/data/demoDataset';
import { formatDate } from '@/utils/dateFormat';

interface Signal {
  id: string;
  signal: string;
  meaning: string;
  confirmed: number;
  lastSeen: string;
  sources: string[];
  confidence: 'high' | 'medium' | 'low';
  relatedEvents: number;
  category: 'aac' | 'sound' | 'gesture' | 'emotion';
}

const SIGNAL_CATEGORIES: Record<Signal['category'], { label: string; bg: string; text: string; emoji: string }> = {
  aac: { label: 'AAC', bg: 'bg-teal-soft', text: 'text-teal-dark', emoji: '🃏' },
  sound: { label: 'Звук', bg: 'bg-blue-soft', text: 'text-blue-dark', emoji: '🔊' },
  gesture: { label: 'Жест', bg: 'bg-purple-soft', text: 'text-purple', emoji: '👆' },
  emotion: { label: 'Эмоция', bg: 'bg-yellow-soft', text: 'text-yellow', emoji: '😊' },
};

export const CommunicationProfile: React.FC = () => {
  const { events } = useEventStore();
  const { selectedChildId } = useDemoControlsStore();
  const currentChild = DEMO_CHILDREN.find((c) => c.id === selectedChildId) ?? DEMO_CHILDREN[0];

  const signals = useMemo<Signal[]>(() => {
    const signalMap = new Map<string, Signal>();
    const childEvents = events.filter((e) => e.childId === selectedChildId);

    childEvents.forEach((event) => {
      if (event.rawText) {
        const signalKey = event.rawText.slice(0, 20);
        const existing = signalMap.get(signalKey);
        if (existing) {
          existing.confirmed++;
          existing.relatedEvents++;
          if (!existing.sources.includes(event.sourceRole)) {
            existing.sources.push(event.sourceRole);
          }
        } else {
          signalMap.set(signalKey, {
            id: signalKey,
            signal: event.rawText.slice(0, 15) + (event.rawText.length > 15 ? '...' : ''),
            meaning: event.description || 'Значение уточняется',
            confirmed: 1,
            lastSeen: formatDate(event.timestamp, {}),
            sources: [event.sourceRole],
            confidence: event.status === 'confirmed' ? 'high' : 'medium',
            relatedEvents: 1,
            category: event.sourceRole === 'child' ? 'aac' : 'sound',
          });
        }
      }
    });

    // Fallback: use child profile signals
    if (signalMap.size === 0 && currentChild.mainSignals.length > 0) {
      return currentChild.mainSignals.map((s) => ({
        id: s.signal,
        signal: s.signal,
        meaning: s.possibleMeaning,
        confirmed: s.confirmedCount,
        lastSeen: formatDate(s.lastSeenAt, { day: 'numeric', month: 'short' }),
        sources: s.kind === 'aac' ? ['parent', 'child'] : s.kind === 'sound' ? ['parent', 'tutor'] : ['parent'],
        confidence: s.confidence >= 0.85 ? 'high' : s.confidence >= 0.7 ? 'medium' : 'low',
        relatedEvents: s.confirmedCount,
        category: s.kind === 'aac' ? 'aac' : s.kind === 'sound' ? 'sound' : s.kind === 'gesture' ? 'gesture' : 'emotion',
      }));
    }

    return Array.from(signalMap.values()).sort((a, b) => b.confirmed - a.confirmed);
  }, [events, selectedChildId, currentChild]);

  const highConfidence = signals.filter((s) => s.confidence === 'high');
  const mediumConfidence = signals.filter((s) => s.confidence === 'medium');
  const maxConfirmed = Math.max(1, ...signals.map((s) => s.confirmed));

  const aiObservation = useMemo(() => {
    if (signals.length === 0) return null;
    const avgConfirmed = signals.reduce((acc, s) => acc + s.confirmed, 0) / signals.length;
    const hasChildSource = signals.some((s) => s.sources.includes('child'));
    if (avgConfirmed >= 5) {
      return 'Похоже, собирается достаточно подтверждённых сигналов. Это поможет специалисту лучше понять коммуникацию ребёнка.';
    }
    if (hasChildSource) {
      return 'Ребёнок начинает использовать AAC карточки — это хороший прогресс в коммуникации!';
    }
    return 'Чем больше наблюдений — тем точнее профиль. Продолжайте фиксировать сигналы.';
  }, [signals]);

  const getConfidenceBadge = (confidence: Signal['confidence']) => {
    switch (confidence) {
      case 'high':
        return { label: 'Высокая', className: 'bg-green text-white' };
      case 'medium':
        return { label: 'Средняя', className: 'bg-yellow text-ink' };
      case 'low':
        return { label: 'Низкая', className: 'bg-bg text-muted border border-line' };
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'parent':
        return '👩 Родитель';
      case 'child':
        return '👦 Ребёнок';
      case 'tutor':
        return '👨‍🏫 Тьютор';
      default:
        return source;
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-8">
      <PageHeader
        title="Коммуникационный профиль"
        subtitle={`${currentChild.name} · ${signals.length} сигналов`}
      />

      <ChildSelector />

      {/* AI Observation */}
      {aiObservation && (
        <div className="bg-gradient-to-br from-blue-soft to-purple-soft border border-blue/20 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center flex-shrink-0">
              <Brain className="w-5 h-5 text-blue" />
            </div>
            <div>
              <p className="text-xs font-black text-blue-dark uppercase tracking-wide mb-1">
                AI наблюдение
              </p>
              <p className="text-sm text-ink leading-relaxed">{aiObservation}</p>
              <p className="text-xs text-muted mt-2 italic">Это наблюдение, не диагноз. Нужно подтвердить.</p>
            </div>
          </div>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-2.5">
        <QoldauCard variant="default" padding="sm" className="text-center">
          <p className="text-2xl font-black text-teal">{signals.length}</p>
          <p className="text-[10px] text-muted mt-0.5 uppercase tracking-wide">Сигналов</p>
        </QoldauCard>
        <QoldauCard variant="default" padding="sm" className="text-center">
          <p className="text-2xl font-black text-green">{highConfidence.length}</p>
          <p className="text-[10px] text-muted mt-0.5 uppercase tracking-wide">Подтверждённых</p>
        </QoldauCard>
        <QoldauCard variant="default" padding="sm" className="text-center">
          <p className="text-2xl font-black text-yellow">{mediumConfidence.length}</p>
          <p className="text-[10px] text-muted mt-0.5 uppercase tracking-wide">Проверить</p>
        </QoldauCard>
      </div>

      {/* Signals по категориям */}
      <QoldauCard variant="default" padding="md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-teal" />
            Сигналы ребёнка
          </h3>
          <Badge className="bg-teal-soft text-teal">{signals.length}</Badge>
        </div>
        <p className="text-xs text-muted mb-4">
          Чем чаще сигнал — тем надёжнее интерпретация. Источники показывают, кто подтвердил.
        </p>

        {/* Frequency distribution chart */}
        {signals.length > 0 && (
          <div className="bg-bg rounded-2xl p-3 mb-4">
            <p className="text-[10px] text-muted font-black uppercase tracking-wide mb-2">
              Частота
            </p>
            <div className="space-y-1.5">
              {signals.slice(0, 5).map((s) => (
                <div key={s.id} className="flex items-center gap-2 text-xs">
                  <span className="w-20 truncate font-bold text-ink">{s.signal}</span>
                  <div className="flex-1 h-3 bg-white rounded-full overflow-hidden border border-line-soft">
                    <div
                      className="h-full bg-gradient-to-r from-teal to-teal-light"
                      style={{ width: `${(s.confirmed / maxConfirmed) * 100}%` }}
                      role="progressbar"
                      aria-valuenow={s.confirmed}
                      aria-valuemin={0}
                      aria-valuemax={maxConfirmed}
                    />
                  </div>
                  <span className="w-6 text-right font-black text-teal">{s.confirmed}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Signals list — cards с полной мета-информацией */}
        <div className="space-y-2.5">
          {signals.map((s) => {
            const cat = SIGNAL_CATEGORIES[s.category];
            const conf = getConfidenceBadge(s.confidence);
            return (
              <div
                key={s.id}
                className="bg-white border border-line-soft rounded-2xl p-3 hover:border-teal/40 transition-colors"
              >
                <div className="flex items-start gap-2.5 mb-2">
                  <div
                    className={`w-10 h-10 rounded-xl ${cat.bg} flex items-center justify-center flex-shrink-0`}
                  >
                    <span className="text-xl" aria-hidden="true">{cat.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-black text-ink">{s.signal}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${conf.className}`}>
                        {conf.label}
                      </span>
                    </div>
                    <p className="text-sm text-ink-2 mt-1">{s.meaning}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-2.5 pt-2.5 border-t border-line-soft">
                  <Stat
                    icon={<CheckCircle className="w-3 h-3" />}
                    label="Подтв."
                    value={`${s.confirmed}×`}
                  />
                  <Stat
                    icon={<Calendar className="w-3 h-3" />}
                    label="Когда"
                    value={s.lastSeen}
                  />
                  <Stat
                    icon={<Users className="w-3 h-3" />}
                    label="Кто"
                    value={s.sources.length > 1 ? `${s.sources.length} ист.'а` : getSourceLabel(s.sources[0])}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </QoldauCard>

      {/* Communication methods */}
      <QoldauCard variant="default" padding="md">
        <h3 className="text-sm font-black mb-3 flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-teal" />
          Методы коммуникации
        </h3>
        <div className="flex flex-wrap gap-2">
          {[
            { name: 'AAC карточки', count: 8 },
            { name: 'Звуки / слова', count: 6 },
            { name: 'Жесты', count: 3 },
            { name: 'Взгляд', count: 2 },
            { name: 'Мимика', count: 1 },
          ].map((m) => (
            <span
              key={m.name}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-soft text-teal-dark text-xs font-bold"
            >
              {m.name}
              <span className="px-1.5 rounded-full bg-white text-[10px] font-black text-teal">
                {m.count}
              </span>
            </span>
          ))}
        </div>
      </QoldauCard>

      {/* Progress за месяц */}
      <QoldauCard variant="default" padding="md">
        <h3 className="text-sm font-black mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-teal" />
          Прогресс за месяц
        </h3>
        <div className="space-y-2.5">
          <ProgressRow label="Новых сигналов" value={`+${Math.max(0, signals.length - 3)}`} trend="up" color="teal" />
          <ProgressRow label="Использование AAC" value="+15%" trend="up" color="teal" />
          <ProgressRow label="Подтверждённых" value={`+${highConfidence.length}`} trend="up" color="green" />
        </div>
        <p className="text-[11px] text-muted mt-3 italic">
          Это наблюдения на основе данных. Не является медицинской оценкой.
        </p>
      </QoldauCard>
    </div>
  );
};

interface StatProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const Stat: React.FC<StatProps> = ({ icon, label, value }) => (
  <div className="flex items-center gap-1.5 min-w-0">
    <div className="text-muted flex-shrink-0">{icon}</div>
    <div className="min-w-0 flex-1">
      <p className="text-[9px] text-muted uppercase tracking-wide leading-none">{label}</p>
      <p className="text-xs font-black text-ink leading-tight truncate">{value}</p>
    </div>
  </div>
);

interface ProgressRowProps {
  label: string;
  value: string;
  trend: 'up' | 'down';
  color: 'teal' | 'green' | 'yellow';
}

const ProgressRow: React.FC<ProgressRowProps> = ({ label, value, trend, color }) => {
  const colorClass = color === 'teal' ? 'text-teal' : color === 'green' ? 'text-green' : 'text-yellow';
  return (
    <div className="flex items-center justify-between gap-2 py-1.5">
      <span className="text-sm text-ink-2">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className={`text-sm font-black ${colorClass}`}>{value}</span>
        <TrendingUp className={`w-4 h-4 ${trend === 'up' ? colorClass : 'text-muted rotate-180'}`} />
      </div>
    </div>
  );
};