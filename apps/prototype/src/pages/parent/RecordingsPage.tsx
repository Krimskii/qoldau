import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { RecordingsList } from '@/components/recordings/RecordingsList';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';

/**
 * RecordingsPage (v1.6 F1.7) — список голосовых записей ребёнка.
 *
 * Доступ из parent и tutor. Записи с audioId проигрываются из IndexedDB;
 * записи без audioId (например, со старого устройства или при quota-ошибке)
 * показываются без кнопки playback, только label + transcript.
 */
export const RecordingsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-5 min-h-[70vh]">
      <PageHeader
        title={t('recordings.title', 'Записи голоса')}
        subtitle={t(
          'recordings.subtitle',
          'Все фразы, которые ребёнок надиктовал через «Сказать».',
        )}
        showBack
      />

      <div className="flex flex-col gap-3">
        <RecordingsList childId={DEMO_PRIMARY_CHILD.id} />
      </div>

      <button
        onClick={() => navigate('/parent/home')}
        className="mt-2 w-full h-12 rounded-2xl bg-line-soft text-ink-2 font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('common.backToHome', 'На главную')}
      </button>
    </div>
  );
};