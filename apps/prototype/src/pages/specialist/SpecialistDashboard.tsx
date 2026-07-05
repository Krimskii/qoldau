import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Bell,
  Sparkles,
  FileText,
  TrendingUp,
  MessageCircle,
  Brain,
  CheckCircle,
  Activity,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { QoldauCard } from '@/components/ui/QoldauCard';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { SectionCard } from '@/components/ui/SectionCard';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { ChildSelector } from '@/components/layout/ChildSelector';
import { useEventStore } from '@/store/useEventStore';
import { useDemoControlsStore } from '@/store/useDemoControlsStore';
import { DEMO_CHILDREN } from '@/data/demoDataset';
import { formatDate } from '@/utils/dateFormat';

const PERIODS = ['7', '14', '30'] as const;
type Period = typeof PERIODS[number];

interface Kpi {
  label: string;
  value: string | number;
  Icon: LucideIcon;
  color: 'teal' | 'purple' | 'blue' | 'green';
}

const KPI_COLORS: Record<Kpi['color'], string> = {
  teal: 'text-teal',
  purple: 'text-purple',
  blue: 'text-blue',
  green: 'text-green',
};

const KPI_BG: Record<Kpi['color'], string> = {
  teal: 'bg-teal-soft',
  purple: 'bg-purple-soft',
  blue: 'bg-blue-soft',
  green: 'bg-green-soft',
};

export const SpecialistDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>('7');

  const PERIOD_LABELS: Record<Period, string> = {
    '7': t('specialist.dashboard.period7'),
    '14': t('specialist.dashboard.period14'),
    '30': t('specialist.dashboard.period30'),
  };
  const { events } = useEventStore();
  const { selectedChildId } = useDemoControlsStore();
  const currentChild = DEMO_CHILDREN.find((c) => c.id === selectedChildId) ?? DEMO_CHILDREN[0];

  const kpis = useMemo(() => {
    const now = Date.now();
    const days = parseInt(period);
    const periodStart = now - days * 24 * 60 * 60 * 1000;

    const periodEvents = events.filter(
      (e) =>
        e.childId === selectedChildId &&
        new Date(e.timestamp).getTime() >= periodStart
    );

    const sensoryEvents = periodEvents.filter((e) => e.type === 'sensory');
    const communicationEvents = periodEvents.filter(
      (e) => e.type === 'communication' || e.type === 'aac_card'
    );
    const confirmedEvents = periodEvents.filter((e) => e.status === 'confirmed');

    const uniqueSignals = new Set(
      periodEvents.map((e) => e.rawText?.slice(0, 10) ?? e.description?.slice(0, 10)).filter(Boolean)
    );

    return {
      totalEvents: periodEvents.length || 0,
      newSignals: uniqueSignals.size || 0,
      communications: communicationEvents.length || 0,
      dynamics:
        confirmedEvents.length > 0 && periodEvents.length > 0
          ? Math.round((confirmedEvents.length / periodEvents.length) * 100)
          : 0,
      sensoryCount: sensoryEvents.length,
    };
  }, [events, period, selectedChildId]);

  const aiSummary = useMemo(() => {
    if (kpis.totalEvents === 0) {
      return t('specialist.dashboard.noData');
    }
    if (kpis.sensoryCount >= 3) {
      return t('specialist.dashboard.sensoryHint');
    }
    if (kpis.communications >= 5) {
      return t('specialist.dashboard.commHint');
    }
    return t('specialist.dashboard.sensoryHint');
  }, [kpis, t]);

  const kpiCards: Kpi[] = useMemo(
    () => [
      { label: t('specialist.dashboard.kpiEvents'), value: kpis.totalEvents, Icon: Calendar, color: 'teal' },
      { label: t('specialist.dashboard.kpiSignals'), value: kpis.newSignals, Icon: Sparkles, color: 'purple' },
      { label: t('specialist.dashboard.kpiComm'), value: kpis.communications, Icon: MessageCircle, color: 'blue' },
      { label: t('specialist.dashboard.kpiDynamics'), value: `+${kpis.dynamics}%`, Icon: TrendingUp, color: 'green' },
    ],
    [kpis, t]
  );

  const recentSignals = useMemo(() => {
    if (currentChild.mainSignals.length > 0) {
      return currentChild.mainSignals.slice(0, 3).map((s) => ({
        signal: s.signal,
        meaning: s.possibleMeaning,
        date: formatDate(s.lastSeenAt, { day: '2-digit', month: '2-digit' }),
      }));
    }
    // Демо-фолбэк: только если у ребёнка нет сигналов. Помечаем DemoBadge.
    return [
      { signal: '"ва"', meaning: 'возможно вода', date: '01.07' },
      { signal: 'тянет за руку', meaning: 'хочет показать', date: '30.06' },
    ];
  }, [currentChild]);

  const isRecentSignalsDemo = currentChild.mainSignals.length === 0;

  const repeatingSituations = useMemo(() => {
    const childEvents = events.filter((e) => e.childId === selectedChildId);
    const situations: Record<string, number> = {
      [t('specialist.dashboard.situationSensory')]: 0,
      [t('specialist.dashboard.situationComm')]: 0,
      [t('specialist.dashboard.situationCalm')]: 0,
    };
    childEvents.forEach((e) => {
      if (e.type === 'sensory') situations[t('specialist.dashboard.situationSensory')]++;
      if (e.type === 'communication' || e.type === 'aac_card') situations[t('specialist.dashboard.situationComm')]++;
      if (e.type === 'calm_mode') situations[t('specialist.dashboard.situationCalm')]++;
    });
    return Object.entries(situations)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [events, selectedChildId, t]);

  const whatHelped = [
    t('specialist.dashboard.whatHelpedItem1'),
    t('specialist.dashboard.whatHelpedItem2'),
    t('specialist.dashboard.whatHelpedItem3'),
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={t('specialist.nav.dashboard')}
        subtitle={`${DEMO_CHILDREN.length} ребёнка · обзор за период`}
        rightAction={<Bell className="w-5 h-5 text-muted" />}
      />

      <ChildSelector />

      {/* Period Selector */}
      <div className="flex gap-2" role="tablist" aria-label="Период">
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            role="tab"
            aria-selected={period === p}
            className={`flex-1 h-11 rounded-2xl text-sm font-bold transition-all ${
              period === p
                ? 'bg-teal text-white shadow-card-soft'
                : 'bg-white border border-line text-muted hover:border-teal'
            }`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Summary Cards — 4 KPI */}
      <div className="grid grid-cols-2 gap-2.5">
        {kpiCards.map(({ label, value, Icon, color }) => (
          <QoldauCard key={label} variant="default" padding="md" hoverable className="min-w-0">
            <div className="flex items-center justify-between gap-2 min-w-0">
              <div className="min-w-0 flex-1">
                <p className={`text-2xl font-black ${KPI_COLORS[color]} truncate`}>{value}</p>
                <p className="text-xs text-muted mt-0.5 truncate">{label}</p>
              </div>
              <div className={`w-9 h-9 rounded-2xl ${KPI_BG[color]} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${KPI_COLORS[color]}`} />
              </div>
            </div>
          </QoldauCard>
        ))}
      </div>

      {/* AI Summary */}
      <AIInsightCard text={aiSummary} />

      {/* Quick Actions — 2 cols для предсказуемости на любом экране */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => navigate('/specialist/abc')}
          className="bg-white border border-line rounded-2xl p-4 text-left hover:border-teal hover:shadow-card-soft transition-all active:scale-[0.98] min-w-0"
        >
          <Brain className="w-5 h-5 text-teal mb-2" />
          <p className="text-sm font-black text-ink truncate">{t('specialist.dashboard.quickActions.abcTitle')}</p>
          <p className="text-xs text-muted truncate">{t('specialist.dashboard.quickActions.abcDesc')}</p>
        </button>
        <button
          onClick={() => navigate('/specialist/communication-profile')}
          className="bg-white border border-line rounded-2xl p-4 text-left hover:border-purple hover:shadow-card-soft transition-all active:scale-[0.98] min-w-0"
        >
          <MessageCircle className="w-5 h-5 text-purple mb-2" />
          <p className="text-sm font-black text-ink truncate">{t('specialist.dashboard.quickActions.commTitle')}</p>
          <p className="text-xs text-muted truncate">{t('specialist.dashboard.quickActions.commDesc')}</p>
        </button>
        <button
          onClick={() => navigate('/specialist/care-patterns')}
          className="bg-white border border-line rounded-2xl p-4 text-left hover:border-blue hover:shadow-card-soft transition-all active:scale-[0.98] min-w-0"
        >
          <Activity className="w-5 h-5 text-blue mb-2" />
          <p className="text-sm font-black text-ink truncate">{t('specialist.dashboard.quickActions.patternsTitle')}</p>
          <p className="text-xs text-muted truncate">{t('specialist.dashboard.quickActions.patternsDesc')}</p>
        </button>
        <button
          onClick={() => navigate('/specialist/reports')}
          className="bg-gradient-to-br from-teal to-teal-dark text-white rounded-2xl p-4 text-left hover:shadow-card-hover transition-shadow active:scale-[0.98] min-w-0"
        >
          <FileText className="w-5 h-5 mb-2" />
          <p className="text-sm font-black truncate">{t('specialist.dashboard.quickActions.reportTitle')}</p>
          <p className="text-xs opacity-80 truncate">{t('specialist.dashboard.quickActions.reportDesc')}</p>
        </button>
      </div>

      {/* Связь: Event Timeline → профили. Явный CTA на timeline событий. */}
      <button
        onClick={() => navigate('/specialist/events')}
        className="w-full bg-white border-2 border-teal/30 rounded-2xl p-4 flex items-center gap-3 hover:bg-teal-soft transition-all active:scale-[0.98] text-left"
      >
        <div className="w-10 h-10 rounded-2xl bg-teal-soft flex items-center justify-center shrink-0">
          <Calendar className="w-5 h-5 text-teal-dark" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-ink">{t('specialist.dashboard.openTimelineTitle')}</p>
          <p className="text-xs text-muted">{t('specialist.dashboard.openTimelineDesc')}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-teal-dark shrink-0" />
      </button>

      {/* Repeating situations */}
      {repeatingSituations.length > 0 && (
        <SectionCard title={t('specialist.dashboard.repeatingTitle')} accent="teal">
          <p className="text-[11px] text-muted italic mb-2">
            {t('specialist.dashboard.repeatingDisclaimer')}
          </p>
          {repeatingSituations.map(([name, count]) => (
            <div
              key={name}
              className="flex items-center justify-between py-2.5 border-b border-line-soft last:border-0"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal" />
                <span className="text-sm font-bold text-ink">{name}</span>
              </div>
              <span className="text-xs font-bold text-teal">{count} раз</span>
            </div>
          ))}
        </SectionCard>
      )}

      {/* What helped — примеры (демо) */}
      <SectionCard
        title={t('specialist.dashboard.whatHelpedTitle')}
        accent="green"
        action={<CheckCircle className="w-5 h-5 text-green" />}
      >
        <p className="text-[11px] text-muted italic mb-2">
          {t('specialist.dashboard.whatHelpedDisclaimer')}
        </p>
        <div className="space-y-2">
          {whatHelped.map((h) => (
            <div key={h} className="flex items-center gap-2 text-sm text-ink-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green" />
              {h}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* New signals */}
      {recentSignals.length > 0 && (
        <SectionCard
          title={t('specialist.dashboard.recentSignalsTitle')}
          accent="purple"
          action={
            <span className="inline-flex items-center gap-2">
              {isRecentSignalsDemo && <DemoBadge label={t('specialist.dashboard.recentSignalsDemo')} />}
              <Sparkles className="w-5 h-5 text-purple" />
            </span>
          }
        >
          {recentSignals.map((s, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2.5 border-b border-line-soft last:border-0"
            >
              <div>
                <p className="text-sm font-bold text-ink">{s.signal}</p>
                <p className="text-xs text-muted">{s.meaning}</p>
              </div>
              <span className="text-xs text-muted">{s.date}</span>
            </div>
          ))}
        </SectionCard>
      )}
    </div>
  );
};