import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Bell, CircleHelp, Calendar, ChevronRight, FileText } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { DEMO_PRIMARY_CHILD, DEMO_TUTORS } from '@/data/demoDataset';
import { useEventStore } from '@/store/useEventStore';

export const TutorHome: React.FC = () => {
  const navigate = useNavigate();
  const child = DEMO_PRIMARY_CHILD;
  const tutor = DEMO_TUTORS[0];
  const { events } = useEventStore();

  const tutorEvents = useMemo(
    () =>
      events
        .filter((e) => e.childId === child.id && e.sourceRole === 'tutor')
        .slice(0, 3),
    [events, child.id]
  );

  const hints = [
    'Перед переходом — предупреждайте за 1–2 минуты.',
    'Пауза 2–3 минуты часто помогает при нервозности.',
    'Используйте визуальное расписание для занятий.',
    'AAC карточки «Туалет» и «Вода» подтверждены ребёнком.',
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={`${child.name}, ${child.age} лет`}
        subtitle="Сегодня, 1 июля"
        rightAction={
          <button className="relative w-10 h-10 rounded-xl bg-[#F7FBFA] border border-line flex items-center justify-center text-ink">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-coral text-white text-xs font-bold rounded-full flex items-center justify-center">1</span>
          </button>
        }
      />

      {/* Status */}
      <div className="bg-gradient-to-br from-[#E9F8F0] to-[#F6FFFC] border border-[#BDE6D0] rounded-2xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-green shadow-[0_0_0_5px_rgba(46,159,110,0.12)]" />
          <strong className="text-sm">Сейчас: {child.currentState}</strong>
        </div>
        <span className="text-xs text-muted">{tutor.name}</span>
      </div>

      {/* Schedule */}
      <Card variant="default" className="bg-gradient-to-br from-purple-soft to-white">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-purple" />
          <span className="text-sm font-bold text-purple">Сегодня</span>
        </div>
        <p className="text-sm text-ink-2">{tutor.scheduleToday}</p>
      </Card>

      {/* Voice CTA */}
      <button
        onClick={() => navigate('/tutor/voice')}
        className="w-full border-0 rounded-2xl p-4 bg-gradient-to-br from-teal to-[#037A76] text-white font-bold text-base flex items-center justify-center gap-3 shadow-card hover:shadow-card-soft transition-shadow"
      >
        <Mic className="w-5 h-5" />
        Наговорить событие
      </button>

      {/* Hints */}
      <Card variant="default" className="bg-gradient-to-br from-purple-soft to-white border-purple/20">
        <div className="flex items-center gap-2 mb-3 font-bold text-sm text-purple">
          <CircleHelp className="w-4 h-4" />
          Подсказки для {child.name}
        </div>
        {hints.map((hint, i) => (
          <div key={i} className="text-sm text-ink-2 leading-relaxed mb-2 last:mb-0">
            • {hint}
          </div>
        ))}
      </Card>

      {/* Recent tutor observations */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-ink-2">Мои последние наблюдения</p>
        </div>
        {tutorEvents.length === 0 ? (
          <Card variant="default">
            <p className="text-sm text-muted text-center py-2">
              Пока нет наблюдений за сегодня
            </p>
          </Card>
        ) : (
          tutorEvents.map((event) => (
            <Card
              key={event.id}
              variant="default"
              className="mb-2 cursor-pointer hover:shadow-card-soft transition-shadow"
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

      {/* Bottom actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => navigate('/tutor/child-profile')}
          className="bg-white border border-line rounded-2xl p-4 flex items-center justify-between hover:shadow-card-soft transition-shadow"
        >
          <span className="text-sm font-bold">Профиль</span>
          <ChevronRight className="w-4 h-4 text-muted" />
        </button>
        <button
          onClick={() => navigate('/tutor/report')}
          className="bg-gradient-to-br from-purple to-[#5e3eb4] text-white rounded-2xl p-4 flex items-center gap-2 shadow-card hover:shadow-card-soft transition-shadow"
        >
          <FileText className="w-4 h-4" />
          <span className="text-sm font-bold">Отчёт</span>
        </button>
      </div>
    </div>
  );
};