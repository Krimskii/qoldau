import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/layout/PageHeader';
import { QoldauCard } from '@/components/ui/QoldauCard';
import { Badge } from '@/components/ui/Badge';
import { ChildSelector } from '@/components/layout/ChildSelector';
import { useDemoControlsStore } from '@/store/useDemoControlsStore';
import { DEMO_CHILDREN } from '@/data/demoDataset';

export const TutorChildProfile: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { selectedChildId } = useDemoControlsStore();
  const child = DEMO_CHILDREN.find((c) => c.id === selectedChildId) ?? DEMO_CHILDREN[0];

  // Локализованные массивы
  const whatHelps = t('tutor.childProfile.whatHelpsList', { returnObjects: true }) as string[];
  const avoidList = t('tutor.childProfile.avoidList', { returnObjects: true }) as string[];
  const preferences = t('tutor.childProfile.preferencesList', { returnObjects: true }) as string[];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={`${t('tutor.childProfile.profile')} — ${child.name}`}
        subtitle={`${child.age} ${t('parent.profile.yearsOld', { defaultValue: 'лет' })} · ${t('tutor.home.today')}: ${child.currentState}`}
        showBack
      />

      <ChildSelector />

      {/* Signals */}
      <QoldauCard variant="default">
        <h4 className="text-sm font-black text-ink mb-3">
          {t('tutor.childProfile.keySignals')}
        </h4>
        {child.mainSignals.map((signal) => (
          <div
            key={signal.id}
            className="flex items-center justify-between py-2.5 border-b border-line-soft last:border-0"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-ink">{signal.signal}</p>
              <p className="text-xs text-muted">{signal.possibleMeaning}</p>
            </div>
            <Badge variant="purple">
              {t('tutor.childProfile.confirmedCount', { count: signal.confirmedCount })}
            </Badge>
          </div>
        ))}
      </QoldauCard>

      {/* What helps */}
      <QoldauCard variant="tinted-green">
        <h4 className="text-sm font-black text-ink mb-3">
          {t('tutor.childProfile.whatHelps')}
        </h4>
        <div className="flex flex-wrap gap-2">
          {whatHelps.map((h) => (
            <Badge key={h} variant="green">{h}</Badge>
          ))}
        </div>
      </QoldauCard>

      {/* Avoid */}
      <QoldauCard variant="tinted-coral">
        <h4 className="text-sm font-black text-ink mb-3">{t('tutor.childProfile.avoid')}</h4>
        <ul className="space-y-1.5">
          {avoidList.map((item, i) => (
            <li key={i} className="text-sm text-ink-2 leading-relaxed flex gap-2">
              <span className="text-coral mt-1">•</span>
              {item}
            </li>
          ))}
        </ul>
      </QoldauCard>

      {/* Preferences */}
      <QoldauCard variant="default">
        <h4 className="text-sm font-black text-ink mb-3">
          {t('tutor.childProfile.preferences')}
        </h4>
        <ul className="space-y-1.5">
          {preferences.map((item, i) => (
            <li key={i} className="text-sm text-ink-2 leading-relaxed flex gap-2">
              <span className="text-teal mt-1">•</span>
              {item}
            </li>
          ))}
        </ul>
      </QoldauCard>

      <button
        onClick={() => navigate('/specialist/communication-profile')}
        className="w-full h-12 rounded-2xl bg-white border border-line text-ink font-bold text-sm flex items-center justify-center gap-1.5 hover:bg-bg transition-colors"
      >
        {t('tutor.childProfile.commProfile')}
      </button>

      <QoldauCard variant="tinted-yellow">
        <p className="text-xs text-ink-2 leading-relaxed">
          {t('tutor.childProfile.disclaimer')}
        </p>
      </QoldauCard>
    </div>
  );
};