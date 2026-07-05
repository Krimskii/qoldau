import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import { formatTime } from '@/utils/dateFormat';
import { DEMO_PRIMARY_CHILD, DEMO_TUTORS } from '@/data/demoDataset';

export const TutorHome: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const child = DEMO_PRIMARY_CHILD;
  const tutor = DEMO_TUTORS[0];
  const { events } = useEventStore();

  // Локализованные подсказки
  const hints = t('tutor.home.hints', { returnObjects: true }) as string[];

  const tutorEvents = useMemo(
    () =>
      events
        .filter((e) => e.childId === child.id && e.sourceRole === 'tutor')
        .slice(0, 3),
    [events, child.id]
  );

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={`${child.name}, ${child.age} ${t('parent.profile.yearsOld', { defaultValue: 'лет' })}`}
        subtitle={tutor.scheduleToday.split('·')[0].trim() || t('tutor.home.today')}
      />

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
      <SectionCard title={t('tutor.home.schedule')} accent="purple">
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
        aria-label={t('tutor.home.voiceCtaAria')}
      >
        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <Mic className="w-6 h-6" />
        </div>
        <span className="flex-1 text-left">{t('tutor.home.voiceCta')}</span>
        <ChevronRight className="w-5 h-5 opacity-90" />
      </button>

      {/* Hints */}
      <SectionCard title={t('tutor.home.hintsTitle', { childName: child.name })} accent="purple">
        <div className="flex items-start gap-2 mb-3">
          <CircleHelp className="w-4 h-4 text-purple flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted">{t('tutor.home.statusHint')}</p>
        </div>
        <ul className="space-y-2">
          {hints.map((hint, i) => (
            <li key={i} className="text-sm text-ink-2 leading-relaxed flex gap-2">
              <span className="text-purple mt-1">•</span>
              {hint}
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* Recent tutor events */}
      <SectionCard title={t('tutor.home.recentTitle')} accent="teal">
        {tutorEvents.length === 0 ? (
          <p className="text-sm text-muted text-center py-3">
            {t('tutor.home.recentEmpty')}
          </p>
        ) : (
          <div>
            {tutorEvents.map((event, idx) => (
              <button
                key={event.id}
                onClick={() => navigate(`/tutor/events/${event.id}`)}
                className={`w-full flex items-center gap-3 py-2.5 text-left hover:bg-bg transition-colors rounded-xl px-2 -mx-2 ${
                  idx < tutorEvents.length - 1 ? 'border-b border-line-soft' : ''
                }`}
              >
                <span className="text-xs text-muted font-bold tabular-nums min-w-[40px]">
                  {formatTime(event.timestamp)}
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
          {t('tutor.home.childProfileBtn')}
        </button>
        <button
          onClick={() => navigate('/tutor/report')}
          className="h-12 rounded-2xl bg-gradient-to-br from-purple to-purple-dark text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-card hover:shadow-card-hover transition-shadow"
        >
          <FileText className="w-4 h-4" />
          {t('tutor.home.reportBtn')}
        </button>
      </div>
    </div>
  );
};