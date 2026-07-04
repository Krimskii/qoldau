import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useDemoStore, DEMO_STEPS } from '@/store/useDemoStore';

/**
 * Экраны, на которых демо-панель НЕ показывается и не навигирует
 * автоматически. Это «живые» интерактивные экраны: запись голоса,
 * consent gate, реальные действия ребёнка/тьютора. Демо-панель
 * наезжает на эти экраны и мешает — поэтому скрываемся.
 */
const LIVE_PATHS = [
  '/parent/voice',     // запись голоса
  '/parent/clarify',   // уточняющие вопросы
  '/parent/ai-review', // AI-разбор (форма принятия)
  '/child/speak',      // голосовая запись ребёнка
  '/child/voice',      // alias
  '/child/calm',       // CalmMode — focus экран
  '/child/favorites',  // редактирование избранного
  '/auth/login',       // вход
];

/**
 * DemoIndicator — collapsible bottom bar with guided-tour controls.
 *
 * - Collapsed by default: shows only a small handle "Шаг X из Y · Title".
 * - Expanded: shows hint + progress bar + Назад/Далее buttons.
 * - «Назад» on the first step exits demo and returns to /overview.
 * - НЕ показывается на «живых» экранах (запись, consent, focus) —
 *   чтобы не наезжать на запись голоса или кнопку SOS.
 */
export const DemoIndicator: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isDemoMode,
    currentStepIndex,
    nextStep,
    previousStep,
    endDemo,
    getProgress,
  } = useDemoStore();

  const [expanded, setExpanded] = useState(false);

  const progress = getProgress();
  const currentStep = DEMO_STEPS[currentStepIndex];
  const currentPath = location.pathname;
  const isLiveScreen = LIVE_PATHS.some((p) => currentPath.startsWith(p));

  // Авто-navigate только если мы НЕ на живом экране (запись/consent).
  // Иначе демо может перехватить старт записи голоса.
  useEffect(() => {
    if (isDemoMode && !isLiveScreen && currentPath !== currentStep.path) {
      navigate(currentStep.path);
    }
  }, [isDemoMode, isLiveScreen, currentStepIndex, currentStep.path, currentPath, navigate]);

  // Reset expansion при любом изменении isDemoMode.
  useEffect(() => {
    setExpanded(false);
  }, [isDemoMode]);

  // Не показываем панель когда демо не активно ИЛИ мы на живом экране.
  if (!isDemoMode) return null;
  if (isLiveScreen) return null;

  const isLastStep = currentStepIndex === DEMO_STEPS.length - 1;
  const isFirstStep = currentStepIndex === 0;

  const handleExit = () => {
    endDemo();
    navigate('/overview');
  };

  const handleBack = () => {
    if (isFirstStep) {
      handleExit();
      return;
    }
    previousStep();
  };

  return (
    <div
      className="fixed left-0 right-0 z-50 pointer-events-none"
      style={{
        // Над BottomNav (bottom: 0, ~64px высота). 80px даёт
        // зазор чтобы панель не залезала на nav.
        bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="max-w-[430px] mx-auto pointer-events-auto">
        <div
          className="bg-gradient-to-br from-teal to-teal-dark text-white shadow-card-hover"
          style={{ borderRadius: '16px 16px 0 0' }}
        >
          {/* Handle — always visible */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
            aria-expanded={expanded}
            aria-label={expanded ? 'Свернуть демо-панель' : 'Развернуть демо-панель'}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="bg-white/20 px-2.5 py-1 rounded-full text-xs font-black flex-shrink-0">
                {progress.current}/{progress.total}
              </span>
              <span className="text-sm font-black truncate">{currentStep.title}</span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {expanded ? (
                <ChevronDown className="w-4 h-4 opacity-80" />
              ) : (
                <ChevronUp className="w-4 h-4 opacity-80" />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleExit();
                }}
                className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                aria-label="Закрыть демо"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </button>

          {/* Expanded body */}
          {expanded && (
            <div className="px-4 pb-4 animate-fade-in">
              <p className="text-sm opacity-90 mb-3 leading-snug">
                {currentStep.hint}
              </p>

              {/* Progress bar */}
              <div className="h-1 bg-white/20 rounded-full mb-3 overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      (currentStepIndex / (DEMO_STEPS.length - 1)) * 100
                    }%`,
                  }}
                />
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm bg-white/15 hover:bg-white/25 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {isFirstStep ? 'Выйти' : 'Назад'}
                </button>

                {isLastStep ? (
                  <button
                    onClick={handleExit}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-sm bg-white text-teal-dark hover:bg-white/90 transition-colors"
                  >
                    Завершить демо
                  </button>
                ) : (
                  <button
                    onClick={nextStep}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-sm bg-white text-teal-dark hover:bg-white/90 transition-colors"
                  >
                    Далее
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};