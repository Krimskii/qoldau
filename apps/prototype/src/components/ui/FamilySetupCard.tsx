/**
 * FamilySetupCard — форма настройки реальной семьи на landing (v0.7.x pilot).
 *
 * Отдельно от «Запустить демо»: реальная семья вводит имя своего ребёнка,
 * оно подменяет demo-плейсхолдер во всём приложении (см. demoDataset.ts
 * getFamilyChildName/setFamilyChildName). Перезагружаем страницу после
 * сохранения — DEMO_PRIMARY_CHILD вычисляется один раз при инициализации
 * модуля, простой reload проще и безопаснее, чем тянуть reactive-обвязку
 * через ~30 мест кода, которые уже читают этот объект напрямую.
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Check } from 'lucide-react';
import {
  getFamilyChildName,
  setFamilyChildName,
  setProfileMode,
} from '@/data/demoDataset';
import { useEventStore } from '@/store/useEventStore';
import { useRecordingsStore } from '@/store/useRecordingsStore';

export const FamilySetupCard: React.FC = () => {
  const { t } = useTranslation();
  const [savedName] = useState(() => getFamilyChildName());
  const [input, setInput] = useState('');
  const [editing, setEditing] = useState(false);

  const handleSave = () => {
    if (!input.trim()) return;
    setFamilyChildName(input);
    // v1.0.x (Batch 6) — переключаем профиль в 'real' и стираем любые
    // события/записи, которые могли остаться от демо-сценария. Иначе
    // пилотная семья увидит 60 событий «Алихана» в своей ленте.
    setProfileMode('real');
    try {
      useEventStore.getState().clearAll();
      useRecordingsStore.getState().clearAll();
    } catch {
      // Сторы не успели инициализироваться (SSR / edge-case) — события
      // будут записаны, но при следующей гидратации onRehydrateStorage
      // не пересидит демо, потому что mode === 'real'.
    }
    // v1.0rc — ставим флаг для FirstRunTutorial, который покажется
    // после reload в Overview (useEffect проверяет флаг).
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('qoldau-tutorial-pending-v1', '1');
      } catch {
        // localStorage недоступен — туториал просто пропустится.
      }
    }
    window.location.reload();
  };

  if (savedName && !editing) {
    return (
      <div className="bg-white border border-line rounded-3xl shadow-card-soft p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-coral-soft flex items-center justify-center flex-shrink-0">
          <Check className="w-5 h-5 text-coral" />
        </div>
        <p className="flex-1 text-sm font-bold text-ink">
          {t('landing.familySetupSaved', { name: savedName })}
        </p>
        <button
          onClick={() => {
            setInput(savedName);
            setEditing(true);
          }}
          className="text-xs font-bold text-teal-dark hover:underline flex-shrink-0"
        >
          {t('landing.familySetupChange')}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-line rounded-3xl shadow-card-soft p-5">
      <div className="flex items-center gap-2 mb-1.5">
        <Heart className="w-4 h-4 text-coral" />
        <h3 className="text-sm font-black text-ink">{t('landing.familySetupTitle')}</h3>
      </div>
      <p className="text-xs text-muted leading-relaxed mb-3">
        {t('landing.familySetupHint')}
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder={t('landing.familySetupPlaceholder')}
          className="flex-1 min-w-0 h-11 px-4 rounded-2xl border border-line focus:border-teal/60 focus:outline-none text-sm text-ink"
        />
        <button
          onClick={handleSave}
          disabled={!input.trim()}
          className="h-11 px-4 rounded-2xl bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-bold shadow-card-soft disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex-shrink-0"
        >
          {t('landing.familySetupSave')}
        </button>
      </div>
    </div>
  );
};
