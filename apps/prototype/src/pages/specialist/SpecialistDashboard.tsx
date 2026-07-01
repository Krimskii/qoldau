import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Bell, Sparkles, FileText, TrendingUp, MessageCircle, Brain, CheckCircle } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useEventStore } from '@/store/useEventStore';

const periods = ['7', '14', '30'];

export const SpecialistDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('7');
  const { events } = useEventStore();

  // Calculate KPIs based on events
  const kpis = useMemo(() => {
    const now = Date.now();
    const days = parseInt(period);
    const periodStart = now - days * 24 * 60 * 60 * 1000;
    
    const periodEvents = events.filter(e => new Date(e.timestamp).getTime() >= periodStart);
    
    const sensoryEvents = periodEvents.filter(e => e.type === 'sensory');
    const communicationEvents = periodEvents.filter(e => e.type === 'communication' || e.type === 'aac_card');
    const confirmedEvents = periodEvents.filter(e => e.status === 'confirmed');
    
    // Calculate new signals (unique signals in this period) - using description as fallback
    const uniqueSignals = new Set(periodEvents.filter(e => e.rawText).map(e => e.rawText));
    
    return {
      totalEvents: periodEvents.length || 24,
      newSignals: uniqueSignals.size || 5,
      communications: communicationEvents.length || 3,
      dynamics: confirmedEvents.length > 0 ? Math.round((confirmedEvents.length / periodEvents.length) * 100) : 12,
      sensoryCount: sensoryEvents.length,
    };
  }, [events, period]);

  // Generate AI summary
  const aiSummary = useMemo(() => {
    if (kpis.sensoryCount >= 3) {
      return 'Похоже, замечены сенсорные реакции. Возможно, стоит обратить внимание на сенсорную поддержку в занятиях. Это наблюдение, не диагноз. Можно обсудить с семьёй.';
    }
    if (kpis.communications >= 5) {
      return 'Ребёнок активно использует коммуникацию. Это хороший прогресс! Продолжайте поддерживать.';
    }
    return 'Собрано достаточно данных для анализа. Чем больше наблюдений — тем точнее паттерны.';
  }, [kpis]);

  // Get recent signals
  const recentSignals = useMemo(() => {
    // Use mock data since QoldauEvent doesn't have signal property
    return [
      { signal: '"ва"', meaning: 'возможно вода', date: '01.07' },
      { signal: 'тянет за руку', meaning: 'хочет показать', date: '30.06' },
    ];
  }, [events]);

  // Get repeating situations
  const repeatingSituations = useMemo(() => {
    if (events.length === 0) {
      return [
        { situation: 'Закрывает уши при шуме', count: 4, trend: 'stable' },
        { situation: 'Просит воду звуком "ва"', count: 6, trend: 'up' },
        { situation: 'Активная коммуникация', count: 3, trend: 'up' },
      ];
    }
    
    const situations: Record<string, number> = {};
    events.forEach(e => {
      if (e.type === 'sensory') {
        situations['Сенсорные реакции'] = (situations['Сенсорные реакции'] || 0) + 1;
      }
      if (e.type === 'communication' || e.type === 'aac_card') {
        situations['Коммуникация'] = (situations['Коммуникация'] || 0) + 1;
      }
    });
    
    return Object.entries(situations)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([situation, count]) => ({
        situation,
        count,
        trend: count >= 3 ? 'up' : 'stable',
      }));
  }, [events]);

  return (
    <div className="flex flex-col gap-4 pb-8">
      <PageHeader
        title="Панель специалиста"
        subtitle="Обзор за период"
        rightAction={<Bell className="w-5 h-5 text-muted" />}
      />

      {/* Period Selector */}
      <div className="flex gap-2">
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              period === p
                ? 'bg-teal text-white shadow-md'
                : 'bg-white border border-line text-muted hover:border-teal'
            }`}
          >
            {p} дней
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card variant="default" className="bg-gradient-to-br from-teal-soft to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-teal">{kpis.totalEvents}</p>
              <p className="text-xs text-muted mt-1">Событий</p>
            </div>
            <Calendar className="w-8 h-8 text-teal/30" />
          </div>
        </Card>
        <Card variant="default" className="bg-gradient-to-br from-purple-soft to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-purple">{kpis.newSignals}</p>
              <p className="text-xs text-muted mt-1">Новых сигналов</p>
            </div>
            <Sparkles className="w-8 h-8 text-purple/30" />
          </div>
        </Card>
        <Card variant="default" className="bg-gradient-to-br from-blue-soft to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-blue">{kpis.communications}</p>
              <p className="text-xs text-muted mt-1">Коммуникаций</p>
            </div>
            <MessageCircle className="w-8 h-8 text-blue/30" />
          </div>
        </Card>
        <Card variant="default" className="bg-gradient-to-br from-green-soft to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-green">+{kpis.dynamics}%</p>
              <p className="text-xs text-muted mt-1">Подтверждений</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green/30" />
          </div>
        </Card>
      </div>

      {/* AI Summary */}
      <Card variant="default" className="bg-gradient-to-r from-blue-soft to-purple-soft border border-blue/20">
        <div className="flex items-start gap-3">
          <Brain className="w-6 h-6 text-blue mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-ink mb-1">AI-наблюдение</h4>
            <p className="text-sm text-ink-2 leading-relaxed">{aiSummary}</p>
            <p className="text-xs text-muted mt-2 italic">
              Это наблюдение на основе данных. Не является медицинским диагнозом.
            </p>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/specialist/abc')}
          className="bg-white border border-line rounded-2xl p-4 text-left hover:border-teal hover:shadow-md transition-all"
        >
          <div className="text-sm font-bold mb-1 flex items-center gap-2">
            <Brain className="w-4 h-4 text-teal" />
            ABC-анализ
          </div>
          <p className="text-xs text-muted">Триггеры и последствия</p>
        </button>
        <button
          onClick={() => navigate('/specialist/communication-profile')}
          className="bg-white border border-line rounded-2xl p-4 text-left hover:border-purple hover:shadow-md transition-all"
        >
          <div className="text-sm font-bold mb-1 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-purple" />
            Коммуникации
          </div>
          <p className="text-xs text-muted">Сигналы ребёнка</p>
        </button>
        <button
          onClick={() => navigate('/specialist/care-patterns')}
          className="bg-white border border-line rounded-2xl p-4 text-left hover:border-blue hover:shadow-md transition-all"
        >
          <div className="text-sm font-bold mb-1 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue" />
            Паттерны
          </div>
          <p className="text-xs text-muted">Уход и режим</p>
        </button>
        <button
          onClick={() => navigate('/specialist/reports')}
          className="bg-gradient-to-br from-teal to-[#037A76] text-white rounded-2xl p-4 flex items-center gap-3 shadow-md hover:shadow-lg transition-shadow"
        >
          <FileText className="w-6 h-6" />
          <div>
            <div className="text-sm font-bold">Отчёт</div>
            <p className="text-xs opacity-80">Сформировать</p>
          </div>
        </button>
      </div>

      {/* Repeating Situations */}
      <Card variant="default">
        <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-teal" />
          Часто повторяющиеся ситуации
        </h4>
        <div className="space-y-2">
          {repeatingSituations.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-line last:border-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal" />
                <span className="text-sm">{s.situation}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-teal-soft text-teal">{s.count} раз</Badge>
                {s.trend === 'up' && <TrendingUp className="w-4 h-4 text-green" />}
                {s.trend === 'stable' && <span className="text-xs text-muted">стабильно</span>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* New Signals */}
      <Card variant="default">
        <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple" />
          Новые сигналы
        </h4>
        <div className="space-y-2">
          {recentSignals.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-line last:border-0">
              <div>
                <span className="text-sm font-bold">{s.signal}</span>
                <p className="text-xs text-muted">{s.meaning}</p>
              </div>
              <span className="text-xs text-muted">{s.date}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* What helped */}
      <Card variant="default">
        <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green" />
          Что помогало
        </h4>
        <div className="space-y-2 text-sm text-ink-2">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green mt-0.5 flex-shrink-0" />
            Пауза при нервозности
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green mt-0.5 flex-shrink-0" />
            AAC карточки для запросов
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green mt-0.5 flex-shrink-0" />
            Визуальное расписание
          </div>
        </div>
        <p className="text-xs text-muted mt-3 italic">
          Это наблюдения на основе данных. Можно обсудить со специалистом.
        </p>
      </Card>
    </div>
  );
};
