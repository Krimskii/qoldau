import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  ChevronRight,
  Calendar,
  CircleHelp,
  FileText,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { QoldauCard } from '@/components/ui/QoldauCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SectionCard } from '@/components/ui/SectionCard';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD, DEMO_TUTORS } from '@/data/demoDataset';

const HINTS = [
  'Перед переходом — предупреждайте за 1–2 минуты.',
  'Пауза 2–3 минуты часто помогает при нервозности.',
  'Используйте визуальное расписание для занятий.',
  'AAC карточки «Туалет» и «Вода» подтверждены ребёнком.',
];

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

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={`${child.name}, ${child.age} лет`} subtitle="Сегодня, 1 июля" />

      {/* Status */}
      <QoldauCard variant="tinted-green" padding="md">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-green flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge kind="ok" label={child.currentState} />
              <span className="text-xs text-muted">· {tutor.name}</span>
            </div>
          </div>
        </div>
      </QoldauCard>

      {/* Schedule */}
      <SectionCard title="Расписание" accent="purple">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-purple flex-shrink-0 mt-0.5" />
          <p className="text-sm text-ink-2 leading-relaxed flex-1">
            {tutor.scheduleToday}
          </p>
        </div>
      </SectionCard>

      {/* Voice CTA */}
      <button
        onClick={() => navigate('/tutor/voice')}
        className="w-full rounded-3xl p-4 bg-gradient-to-br from-teal to-teal-dark text-white font-bold text-base flex items-center gap-3 shadow-card hover:shadow-card-hover transition-shadow active:scale-[0.98]"
        aria-label="Наговорить событие"
      >
        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <Mic className="w-6 h-6" />
        </div>
        <span className="flex-1 text-left">Наговорить событие</span>
        <ChevronRight className="w-5 h-5 opacity-90" />
      </button>

      {/* Hints */}
      <SectionCard title={`Подсказки для ${child.name}`} accent="purple">
        <div className="flex items-start gap-2 mb-3">
          <CircleHelp className="w-4 h-4 text-purple flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted">Подобрано под ребёнка</p>
        </div>
        <ul className="space-y-2">
          {HINTS.map((hint, i) => (
            <li key={i} className="text-sm text-ink-2 leading-relaxed flex gap-2">
              <span className="text-purple mt-1">•</span>
              {hint}
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* Recent tutor events */}
      <SectionCard title="Мои последние наблюдения" accent="teal">
        {tutorEvents.length === 0 ? (
          <p className="text-sm text-muted text-center py-3">
            Пока нет наблюдений за сегодня
          </p>
        ) : (
          <div>
            {tutorEvents.map((event, idx) => (
              <button
                key={event.id}
                onClick={() => navigate(`/parent/events/${event.id}`)}
                className={`w-full flex items-center gap-3 py-2.5 text-left hover:bg-bg transition-colors rounded-xl px-2 -mx-2 ${
                  idx < tutorEvents.length - 1 ? 'border-b border-line-soft' : ''
                }`}
              >
                <span className="text-xs text-muted font-bold tabular-nums min-w-[40px]">
                  {new Date(event.timestamp).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-ink truncate">{event.title}</p>
                  <p className="text-xs text-muted truncate">{event.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted" />
              </button>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => navigate('/tutor/child-profile')}
          className="h-12 rounded-2xl bg-white border border-line text-ink font-bold text-sm flex items-center justify-center gap-1.5 hover:bg-bg transition-colors"
        >
          Профиль ребёнка
        </button>
        <button
          onClick={() => navigate('/tutor/report')}
          className="h-12 rounded-2xl bg-gradient-to-br from-purple to-[#5e3eb4] text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-card hover:shadow-card-hover transition-shadow"
        >
          <FileText className="w-4 h-4" />
          Отчёт родителю
        </button>
      </div>
    </div>
  );
};