import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDemoStore, DEMO_STEPS } from '@/store/useDemoStore';

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

  const progress = getProgress();
  const currentStep = DEMO_STEPS[currentStepIndex];
  const currentPath = location.pathname;

  // Auto-navigate to demo step when it changes
  useEffect(() => {
    if (isDemoMode && currentPath !== currentStep.path) {
      navigate(currentStep.path);
    }
  }, [isDemoMode, currentStepIndex, currentStep.path, currentPath, navigate]);

  if (!isDemoMode) return null;

  const isLastStep = currentStepIndex === DEMO_STEPS.length - 1;
  const isFirstStep = currentStepIndex === 0;

  const handleExit = () => {
    endDemo();
    navigate('/overview');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-teal to-teal-dark text-white p-4 z-50 shadow-lg">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
              Шаг {progress.current} из {progress.total}
            </span>
            <span className="text-sm opacity-90">{currentStep.title}</span>
          </div>
          <button
            onClick={handleExit}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hint */}
        <p className="text-sm opacity-90 mb-4">{currentStep.hint}</p>

        {/* Progress bar */}
        <div className="h-1 bg-white/20 rounded-full mb-4 overflow-hidden">
          <div 
            className="h-full bg-white rounded-full transition-all duration-300"
            style={{ width: `${(currentStepIndex / (DEMO_STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={previousStep}
            disabled={isFirstStep}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
              isFirstStep 
                ? 'bg-white/10 text-white/40 cursor-not-allowed' 
                : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Назад
          </button>

          {isLastStep ? (
            <button
              onClick={handleExit}
              className="flex items-center gap-2 px-6 py-2 rounded-xl font-bold text-sm bg-white text-teal-dark hover:bg-white/90 transition-colors"
            >
              Завершить демо
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-2 rounded-xl font-bold text-sm bg-white text-teal-dark hover:bg-white/90 transition-colors"
            >
              Далее
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
