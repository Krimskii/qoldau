import React, { useEffect, useState } from 'react';
import { ChildMonsterMascot } from '@/components/icons/child2d';
import { QoldauCard } from '@/components/ui/QoldauCard';

const STORAGE_KEY = 'qoldau-child-onboarded-v1';

/**
 * ChildOnboarding — первое посещение `/child/home` (v0.3.15).
 *
 * Показывает 2-шаговый «welcome» с monster-mascot и объяснением:
 * 1. Приветствие и краткое описание.
 * 2. «Где искать любимое» — показывает 6 actions.
 *
 * После прохождения ставит флаг в localStorage. Больше не показывается.
 */
export const ChildOnboarding: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<0 | 1>(0);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) {
        setVisible(true);
        setStep(0);
      }
    } catch {
      // localStorage недоступен — пропускаем onboarding
    }
  }, []);

  const finish = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore
    }
    setVisible(false);
  };

  const skip = () => finish();

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(244,248,248,0.92)', backdropFilter: 'blur(6px)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Добро пожаловать"
    >
      <div className="w-[90%] max-w-sm">
        {step === 0 ? (
          <QoldauCard variant="elevated" padding="lg" className="text-center">
            <div className="flex justify-center mb-3">
              <ChildMonsterMascot size={120} animated />
            </div>
            <h1 className="text-2xl font-black text-ink mb-2">Привет!</h1>
            <p className="text-sm text-ink-2 leading-relaxed mb-5">
              Это твоё место. Здесь можно сказать, что хочешь, выбрать любимое и попросить помощи.
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => setStep(1)}
                className="w-full py-4 rounded-2xl text-white font-black text-base active:scale-[0.98] transition-transform"
                style={{
                  background: 'linear-gradient(135deg, #1ba39a 0%, #12807a 100%)',
                  boxShadow: '0 8px 20px rgba(27,163,154,0.28)',
                }}
              >
                Дальше
              </button>
              <button
                onClick={skip}
                className="text-sm text-muted font-bold py-2 hover:text-ink transition-colors"
              >
                Пропустить
              </button>
            </div>
          </QoldauCard>
        ) : (
          <QoldauCard variant="elevated" padding="lg" className="text-center">
            <div className="text-5xl mb-3" aria-hidden="true">👇</div>
            <h2 className="text-xl font-black text-ink mb-2">Главное — здесь</h2>
            <p className="text-sm text-ink-2 leading-relaxed mb-4">
              На главной 6 кнопок: что хочешь, помощь, пауза. Нажми — и взрослый увидит.
            </p>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {['Хочу пить', 'Помощь', 'Пауза'].map((label) => (
                <div
                  key={label}
                  className="min-h-[80px] rounded-2xl bg-bg border border-line-soft flex items-center justify-center px-2 text-sm font-black text-ink-2"
                >
                  {label}
                </div>
              ))}
            </div>
            <button
              onClick={finish}
              className="w-full py-4 rounded-2xl text-white font-black text-base active:scale-[0.98] transition-transform"
              style={{
                background: 'linear-gradient(135deg, #1ba39a 0%, #12807a 100%)',
                boxShadow: '0 8px 20px rgba(27,163,154,0.28)',
              }}
            >
              Понятно!
            </button>
            <p className="text-[11px] text-muted text-center mt-3 italic">
              Это не медицинское приложение. Это профиль наблюдений.
            </p>
          </QoldauCard>
        )}
      </div>
    </div>
  );
};