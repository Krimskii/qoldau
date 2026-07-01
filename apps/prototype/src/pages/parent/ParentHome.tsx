import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, ChevronRight, Bell, Sparkles, Calendar, FileText } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD, DEMO_PARENTS, getDemoTimelineSummary } from '@/data/demoDataset';

export const ParentHome: React.FC = () => {
  const navigate = useNavigate();
  const { events } = useEventStore();
  const child = DEMO_PRIMARY_CHILD;
  const mother = DEMO_PARENTS[0];

  const today = '2026-07-01';
  const todayEvents = useMemo(
    () => events.filter((e) => e.timestamp.startsWith(today)),
    [events]
  );
  const lastEvents = todayEvents.slice(0, 4);
  const summary = getDemoTimelineSummary(child.id);

  // Cautious AI observation
  const aiObservation = useMemo(() => {
    const sensoryCount = todayEvents.filter((e) => e.type === 'sensory').length;
    const communicationCount = todayEvents.filter(
      (e) => e.type === 'communication' || e.type === 'aac_card'
    ).length;
    if (sensoryCount >= 1 && communicationCount >= 2) {
      return 'Похоже, сегодня было несколько сенсорных событий и активная коммуникация. Это наблюдение, не диагноз. Можно обсудить со специалистом.';
    }
    return 'Похоже, сегодня собрано достаточно наблюдений. Продолжайте фиксировать — это помогает видеть паттерны.';
  }, [todayEvents]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={`${child.name}, ${child.age} лет`}
        subtitle={`Сегодня, 1 июля · ${summary.total} событий за неделю`}
        rightAction={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/parent/notifications')}
              className="relative w-10 h-10 rounded-xl bg-white border border-line flex items-center justify-center hover:bg-bg transition-colors"
            >
              <Bell className="w-4 h-4 text-ink" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-coral text-white text-xs font-bold rounded-full flex items-center justify-center">2</span>
            </button>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#DDF5F0] to-[#E8F3FF] border border-line flex items-center justify-center font-bold text-teal-dark">
              {child.avatar}
            </div>
          </div>
        }
      />

      {/* Status */}
      <div className="bg-gradient-to-br from-[#E9F8F0] to-[#F6FFFC] border border-[#BDE6D0] rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-green shadow-[0_0_0_5px_rgba(46,159,110,0.12)]" />
          <div>
            <strong className="text-sm">Сейчас: {child.currentState}</strong>
            <p className="text-xs text-muted">Обновлено только что</p>
          </div>
        </div>
      </div>

      {/* Voice CTA */}
      <button
        onClick={() => navigate('/parent/voice')}
        className="w-full border-0 rounded-2xl p-4 bg-gradient-to-br from-teal to-[#037A76] text-white font-bold text-base flex items-center justify-center gap-3 shadow-[0_14px_26px_rgba(7,149,139,0.22)] hover:shadow-card transition-shadow"
      >
        <Mic className="w-5 h-5" />
        Сказать наблюдение
      </button>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-2.5">
        <button
          onClick={() => navigate('/parent/events')}
          className="min-h-[80px] border border-line bg-white rounded-xl flex flex-col items-center justify-center gap-1.5 p-2 hover:shadow-card-soft transition-shadow"
        >
          <span className="w-9 h-9 rounded-xl flex items-center justify-center bg-teal-soft text-teal">
            <Calendar className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold text-ink">Лента</span>
        </button>
        <button
          onClick={() => navigate('/specialist/reports')}
          className="min-h-[80px] border border-line bg-white rounded-xl flex flex-col items-center justify-center gap-1.5 p-2 hover:shadow-card-soft transition-shadow"
        >
          <span className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-soft text-blue">
            <FileText className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold text-ink">Отчёт</span>
        </button>
        <button
          onClick={() => navigate('/parent/assistant')}
          className="min-h-[80px] border border-line bg-white rounded-xl flex flex-col items-center justify-center gap-1.5 p-2 hover:shadow-card-soft transition-shadow"
        >
          <span className="w-9 h-9 rounded-xl flex items-center justify-center bg-purple-soft text-purple">
            <Sparkles className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold text-ink">AI-помощник</span>
        </button>
      </div>

      {/* AI Observation */}
      <AIInsightCard text={aiObservation} variant="warning" />

      {/* Recent Events */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-ink-2">Последние события</p>
          <button
            onClick={() => navigate('/parent/events')}
            className="text-xs font-bold text-teal flex items-center gap-1"
          >
            Все <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {lastEvents.length === 0 ? (
            <Card variant="default">
              <p className="text-sm text-muted text-center py-2">
                Сегодня пока нет событий
              </p>
            </Card>
          ) : (
            lastEvents.map((event) => (
              <Card
                key={event.id}
                variant="default"
                className="cursor-pointer hover:shadow-card-soft transition-shadow"
                onClick={() => navigate(`/parent/events/${event.id}`)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted font-bold min-w-[42px]">
                    {new Date(event.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold">{event.title}</div>
                    <div className="text-xs text-muted truncate">{event.description}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted" />
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="text-xs text-muted text-center italic mt-2">
        Это профиль наблюдений {mother.name}. Не является медицинским диагнозом.
      </div>
    </div>
  );
};