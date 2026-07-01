import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Utensils, Droplet, Moon, Smile, MessageCircle, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { mockChild } from '@/data/mockChild';
import { useEventStore } from '@/store/useEventStore';
import { quickActions } from '@/data/mockCards';

const quickActionIcons: Record<string, React.ElementType> = {
  utensils: Utensils,
  droplet: Droplet,
  water: Droplet,
  smile: Smile,
  moon: Moon,
  'message-circle': MessageCircle,
};

export const ParentHome: React.FC = () => {
  const navigate = useNavigate();
  const { events } = useEventStore();
  const todayEvents = events.slice(0, 3);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={`${mockChild.name}, ${mockChild.age} лет`}
        subtitle="Сегодня, 1 июля"
        rightAction={
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#DDF5F0] to-[#E8F3FF] border border-line flex items-center justify-center font-bold text-teal-dark">
            {mockChild.avatar}
          </div>
        }
      />

      {/* Status Card */}
      <div className="bg-gradient-to-br from-[#E9F8F0] to-[#F6FFFC] border border-[#BDE6D0] rounded-2xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-green shadow-[0_0_0_5px_rgba(46,159,110,0.12)]" />
          <div>
            <strong className="text-sm">Сейчас: {mockChild.currentState}</strong>
            <p className="text-xs text-muted">Обновлено 10:50</p>
          </div>
        </div>
      </div>

      {/* Voice CTA */}
      <button
        onClick={() => navigate('/parent/voice')}
        className="w-full border-0 rounded-2xl p-4 bg-gradient-to-br from-teal to-[#037A76] text-white font-bold text-base flex items-center justify-center gap-3 shadow-[0_14px_26px_rgba(7,149,139,0.22)]"
      >
        <Mic className="w-5 h-5" />
        Сказать наблюдение
      </button>

      {/* Quick Actions */}
      <div>
        <p className="text-xs font-bold text-ink-2 mb-2">Быстрые действия</p>
        <div className="grid grid-cols-3 gap-2.5">
          {quickActions.map((action) => {
            const Icon = quickActionIcons[action.icon] || Utensils;
            return (
              <button
                key={action.id}
                onClick={() => navigate(`/parent/care`)}
                className="min-h-[73px] border border-line bg-white rounded-xl flex flex-col items-center justify-center gap-1.5 p-2 text-xs font-bold text-[#243B53] hover:shadow-card-soft transition-shadow"
              >
                <span
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-soft text-blue"
                >
                  <Icon className="w-4 h-4" />
                </span>
                {action.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Insight */}
      <AIInsightCard
        text="Похоже, сегодня больше всего событий связано с поведением перед туалетом. Можно отслеживать воду и сенсорные триггеры. Это наблюдение, не диагноз."
        variant="warning"
      />

      {/* Recent Events */}
      <div>
        <p className="text-xs font-bold text-ink-2 mb-2">Последние события</p>
        <div className="flex flex-col gap-2">
          {todayEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-2.5 p-2.5 border border-line bg-white rounded-xl cursor-pointer"
              onClick={() => navigate(`/parent/events/${event.id}`)}
            >
              <span className="text-xs text-muted font-bold min-w-[40px]">
                {new Date(event.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold">{event.title}</div>
                <div className="text-xs text-muted truncate">{event.description}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
