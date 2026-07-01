import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Mic,
  Settings,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD, DEMO_PARENTS } from '@/data/demoDataset';

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

  const aiObservation = useMemo(() => {
    const sensoryCount = todayEvents.filter((e) => e.type === 'sensory').length;
    const communicationCount = todayEvents.filter(
      (e) => e.type === 'communication' || e.type === 'aac_card'
    ).length;
    if (sensoryCount >= 1 && communicationCount >= 2) {
      return 'Похоже, сегодня было несколько сенсорных событий и активная коммуникация. Это наблюдение, не диагноз. Можно обсудить со специалистом.';
    }
    return 'Похоже, сегодня собрано достаточно наблюдений. Продолжайте фиксировать — это помогает видеть повторяющиеся ситуации и реакции.';
  }, [todayEvents]);

  return (
    <div className="flex flex-col gap-5">
      {/* Hero — карточка ребёнка */}
      <Card variant="tinted-teal" className="overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#FFE7BE] to-[#E4F8FF] border-2 border-white flex items-center justify-center text-3xl flex-shrink-0 shadow-card-soft">
            👦
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black text-ink leading-tight">
              {child.name}, {child.age} лет
            </h2>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="w-2 h-2 rounded-full bg-green" />
              <span className="text-xs font-bold text-green">
                Сейчас: {child.currentState}
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('/parent/profile')}
            className="w-9 h-9 rounded-xl bg-white border border-line flex items-center justify-center hover:bg-bg transition-colors"
            aria-label="Профиль"
          >
            <Settings className="w-4 h-4 text-ink-2" />
          </button>
        </div>
      </Card>

      {/* Большая CTA — голос */}
      <button
        onClick={() => navigate('/parent/voice')}
        className="w-full rounded-3xl p-5 bg-gradient-to-br from-teal to-teal-dark text-white shadow-card hover:shadow-card-hover transition-all active:scale-[0.98] flex items-center gap-4"
      >
        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
          <Mic className="w-7 h-7" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-xs opacity-90 font-bold uppercase tracking-wide">
            Главное действие
          </p>
          <p className="text-xl font-black leading-tight mt-0.5">Сказать наблюдение</p>
        </div>
        <ChevronRight className="w-5 h-5 opacity-90" />
      </button>

      {/* Быстрые действия — 2×3 */}
      <div>
        <p className="text-xs font-black text-muted uppercase tracking-wide mb-2 px-1">
          Быстрые действия
        </p>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { icon: '🍎', label: 'Еда', path: '/parent/care', color: 'bg-[#EAF8F0]' },
            { icon: '🚽', label: 'Туалет', path: '/parent/care', color: 'bg-[#EAF5FF]' },
            { icon: '💧', label: 'Вода', path: '/parent/care', color: 'bg-[#EAF5FF]' },
            { icon: '😊', label: 'Поведение', path: '/parent/behavior', color: 'bg-[#FFF6DF]' },
            { icon: '🌙', label: 'Сон', path: '/parent/care', color: 'bg-[#F1EDFF]' },
            { icon: '💬', label: 'Коммуникация', path: '/specialist/communication-profile', color: 'bg-[#F1EDFF]' },
          ].map((a) => (
            <button
              key={a.label}
              onClick={() => navigate(a.path)}
              className={`min-h-[88px] rounded-2xl ${a.color} border border-line flex flex-col items-center justify-center gap-1.5 p-2 hover:scale-[0.97] active:scale-[0.94] transition-transform`}
            >
              <span className="text-3xl" aria-hidden="true">
                {a.icon}
              </span>
              <span className="text-xs font-bold text-ink">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* AI observation */}
      <AIInsightCard text={aiObservation} />

      {/* Последние события */}
      <Card variant="default">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-black text-ink">Сегодня</p>
          <button
            onClick={() => navigate('/parent/events')}
            className="text-xs font-bold text-teal flex items-center gap-1"
          >
            Все <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        {lastEvents.length === 0 ? (
          <p className="text-sm text-muted text-center py-3">
            Сегодня пока нет событий
          </p>
        ) : (
          <div>
            {lastEvents.map((event, idx) => (
              <button
                key={event.id}
                onClick={() => navigate(`/parent/events/${event.id}`)}
                className={`w-full flex items-center gap-3 py-2.5 text-left ${
                  idx < lastEvents.length - 1 ? 'border-b border-line-soft' : ''
                }`}
              >
                <span className="text-xs text-muted font-bold tabular-nums min-w-[40px]">
                  {new Date(event.timestamp).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-ink truncate">
                    {event.title}
                  </p>
                  <p className="text-xs text-muted truncate">{event.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Disclaimer */}
      <p className="text-[11px] text-muted text-center italic px-4">
        Это профиль наблюдений {mother.name}. Не медицинский диагноз.
      </p>
    </div>
  );
};