import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { ChildSelector } from '@/components/layout/ChildSelector';
import { useEventStore } from '@/store/useEventStore';
import { useDemoControlsStore } from '@/store/useDemoControlsStore';
import { DEMO_CHILDREN } from '@/data/demoDataset';

const periods = ['7', '14', '30'] as const;
type Period = typeof periods[number];

const PERIOD_LABELS: Record<Period, string> = {
  '7': '7 дней',
  '14': '14 дней',
  '30': '30 дней',
};

export const SpecialistDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>('7');
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
    if (kpis.sensoryCount >= 3) {
      return 'Похоже, замечены сенсорные реакции. Возможно, стоит обратить внимание на сенсорную поддержку в занятиях. Это наблюдение, не диагноз. Можно обсудить с семьёй.';
    }
    if (kpis.communications >= 5) {
      return 'Ребёнок активно использует коммуникацию. Это хороший прогресс! Продолжайте поддерживать.';
    }
    return 'Собрано достаточно данных для анализа. Чем больше наблюдений — тем точнее паттерны.';
  }, [kpis]);

  const recentSignals = useMemo(() => {
    if (currentChild.mainSignals.length > 0) {
      return currentChild.mainSignals.slice(0, 3).map((s) => ({
        signal: s.signal,
        meaning: s.possibleMeaning,
        date: new Date(s.lastSeenAt).toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
        }),
      }));
    }
    return [
      { signal: '"ва"', meaning: 'возможно вода', date: '01.07' },
      { signal: 'тянет за руку', meaning: 'хочет показать', date: '30.06' },
    ];
  }, [currentChild]);

  const repeatingSituations = useMemo(() => {
    const childEvents = events.filter((e) => e.childId === selectedChildId);
    const situations: Record<string, number> = {};
    childEvents.forEach((e) => {
      if (e.type === 'sensory') situations['Сенсорные реакции'] = (situations['Сенсорные реакции'] || 0) + 1;
      if (e.type === 'communication' || e.type === 'aac_card') situations['Коммуникация'] = (situations['Коммуникация'] || 0) + 1;
      if (e.type === 'calm_mode') situations['Спокойный режим использовался'] = (situations['Спокойный режим использовался'] || 0) + 1;
    });
    return Object.entries(situations).sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [events, selectedChildId]);

  const whatHelped = [
    'Пауза / отдых',
    'Тихое место',
    'Визуальное расписание',
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Панель специалиста"
        subtitle={`${DEMO_CHILDREN.length} ребёнка · обзор за период`}
        rightAction={<Bell className="w-5 h-5 text-muted" />}
      />

      <ChildSelector />

      {/* Period Selector */}
      <div className="flex gap-2">
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
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
      <div className="grid grid-cols-2 gap-3">
        <Card variant="tinted-teal">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-teal">{kpis.totalEvents}</p>
              <p className="text-xs text-muted mt-1">Событий</p>
            </div>
            <Calendar className="w-8 h-8 text-teal/40" />
          </div>
        </Card>
        <Card variant="tinted-purple">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-purple">{kpis.newSignals}</p>
              <p className="text-xs text-muted mt-1">Новых сигналов</p>
            </div>
            <Sparkles className="w-8 h-8 text-purple/40" />
          </div>
        </Card>
        <Card variant="tinted-blue">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-blue">{kpis.communications}</p>
              <p className="text-xs text-muted mt-1">Коммуникаций</p>
            </div>
            <MessageCircle className="w-8 h-8 text-blue/40" />
          </div>
        </Card>
        <Card variant="tinted-green">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-green">+{kpis.dynamics}%</p>
              <p className="text-xs text-muted mt-1">Подтверждений</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green/40" />
          </div>
        </Card>
      </div>

      {/* AI Summary */}
      <AIInsightCard text={aiSummary} />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/specialist/abc')}
          className="bg-white border border-line rounded-2xl p-4 text-left hover:border-teal hover:shadow-card-soft transition-all"
        >
          <Brain className="w-5 h-5 text-teal mb-2" />
          <p className="text-sm font-bold text-ink">ABC-анализ</p>
          <p className="text-xs text-muted">До / наблюдалось / после</p>
        </button>
        <button
          onClick={() => navigate('/specialist/communication-profile')}
          className="bg-white border border-line rounded-2xl p-4 text-left hover:border-purple hover:shadow-card-soft transition-all"
        >
          <MessageCircle className="w-5 h-5 text-purple mb-2" />
          <p className="text-sm font-bold text-ink">Коммуникации</p>
          <p className="text-xs text-muted">Сигналы ребёнка</p>
        </button>
        <button
          onClick={() => navigate('/specialist/care-patterns')}
          className="bg-white border border-line rounded-2xl p-4 text-left hover:border-blue hover:shadow-card-soft transition-all"
        >
          <Activity className="w-5 h-5 text-blue mb-2" />
          <p className="text-sm font-bold text-ink">Паттерны</p>
          <p className="text-xs text-muted">Связи в данных</p>
        </button>
        <button
          onClick={() => navigate('/specialist/reports')}
          className="bg-gradient-to-br from-teal to-teal-dark text-white rounded-2xl p-4 flex items-center gap-3 shadow-card hover:shadow-card-hover transition-shadow"
        >
          <FileText className="w-6 h-6" />
          <div>
            <p className="text-sm font-black">Отчёт</p>
            <p className="text-xs opacity-80">Сформировать</p>
          </div>
        </button>
      </div>

      {/* Repeating situations */}
      {repeatingSituations.length > 0 && (
        <Card variant="default">
          <h4 className="text-sm font-black text-ink mb-3">Повторяющиеся ситуации</h4>
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
        </Card>
      )}

      {/* What helped */}
      <Card variant="tinted-green">
        <h4 className="text-sm font-black text-ink mb-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green" />
          Что помогало
        </h4>
        <div className="space-y-2">
          {whatHelped.map((h) => (
            <div key={h} className="flex items-center gap-2 text-sm text-ink-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green" />
              {h}
            </div>
          ))}
        </div>
      </Card>

      {/* New signals */}
      {recentSignals.length > 0 && (
        <Card variant="default">
          <h4 className="text-sm font-black text-ink mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple" />
            Новые сигналы
          </h4>
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
        </Card>
      )}
    </div>
  );
};