import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet, Utensils, Volume2, ArrowRight, HelpCircle, Check } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { QoldauCard } from '@/components/ui/QoldauCard';
import { PrimaryAction } from '@/components/ui/Primitives';
import { AppIcon } from '@/components/ui/AppIcon';
import { useEventStore } from '@/store/useEventStore';
import { useToastStore } from '@/store/useToastStore';
import { useVoiceObservationStore } from '@/store/useVoiceObservationStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import { createEventsFromAIReview } from '@/lib/events/eventFactory';
import { EventType } from '@/types/qoldau';
import { QoldauEvent } from '@/types/qoldau';

/**
 * Default fallback-вопросы (если AI не вернул clarificationQuestions).
 * Эти вопросы покрывают типовой сценарий "вода + туалет + шум".
 */
interface DefaultQuestion {
  id: string;
  question: string;
  options: string[];
  defaultOption?: string;
  // Optional icon hint
  iconName: 'water' | 'food' | 'noise';
}

const DEFAULT_QUESTIONS: DefaultQuestion[] = [
  {
    id: 'water-amount',
    question: 'Сколько воды выпил?',
    options: ['Мало', 'Нормально', 'Много', 'Не знаю'],
    defaultOption: 'Нормально',
    iconName: 'water',
  },
  {
    id: 'toilet-better',
    question: 'После туалета стало легче?',
    options: ['Да', 'Нет', 'Не заметил(а)'],
    defaultOption: 'Да',
    iconName: 'food',
  },
  {
    id: 'noise-around',
    question: 'Был ли шум вокруг?',
    options: ['Да', 'Нет', 'Не заметил(а)'],
    defaultOption: 'Да',
    iconName: 'noise',
  },
];

const ICON_MAP: Record<DefaultQuestion['iconName'], React.ComponentType<Record<string, unknown>>> = {
  water: Droplet,
  food: Utensils,
  noise: Volume2,
};

interface AnswerState {
  [questionId: string]: string;
}

const defaultAnswers: AnswerState = DEFAULT_QUESTIONS.reduce<AnswerState>(
  (acc, q) => {
    if (q.defaultOption) acc[q.id] = q.defaultOption;
    return acc;
  },
  {},
);

export const ClarifyingQuestions: React.FC = () => {
  const navigate = useNavigate();
  const { addEvents } = useEventStore();
  const { showToast } = useToastStore();
  const {
    currentTranscript,
    editedTranscript,
    originalTranscript,
    parsedObservation,
    aiParsedObservation,
    sttSource,
    childId,
    reset: resetVoiceObservation,
  } = useVoiceObservationStore();
  const [answers, setAnswers] = useState<AnswerState>({ ...defaultAnswers });

  // Динамические вопросы из AI результата, fallback на defaults.
  const aiQuestions = parsedObservation?.clarificationQuestions ?? [];
  const useDynamic = aiQuestions.length > 0;

  const effectiveTranscript =
    editedTranscript || currentTranscript || originalTranscript;

  const handleAnswer = (questionId: string, option: string) =>
    setAnswers((prev) => ({ ...prev, [questionId]: option }));

  const handleSave = () => {
    // Если есть parsed observation — создаём batch через factory.
    const parsed = parsedObservation ?? aiParsedObservation ?? null;

    if (parsed) {
      const batch = createEventsFromAIReview({
        parsed,
        transcript: originalTranscript || currentTranscript,
        editedTranscript:
          editedTranscript && editedTranscript !== originalTranscript
            ? editedTranscript
            : undefined,
        originalTranscript,
        sttSource: sttSource ?? 'mock',
        sourceRole: 'parent',
        childId: childId || DEMO_PRIMARY_CHILD.id,
        clarificationAnswers: { ...answers },
        status: 'confirmed',
      });

      addEvents([...batch.extracted, batch.observation]);
    } else {
      // Fallback — сохраняем как одно observation-событие.
      const event: Omit<QoldauEvent, 'id'> = {
        childId: childId || DEMO_PRIMARY_CHILD.id,
        type: 'voice_observation' as EventType,
        title: 'Голосовое наблюдение',
        description: effectiveTranscript || 'Наблюдение без расшифровки',
        timestamp: new Date().toISOString(),
        sourceRole: 'parent',
        status: 'confirmed',
        confidence: 0.85,
        rawText: effectiveTranscript,
        payload: {
          clarificationAnswers: { ...answers },
          source: 'voice_observation',
        },
      };
      addEvents([event]);
    }

    showToast('События сохранены в Event Timeline', 'success');
    resetVoiceObservation();
    navigate('/parent/events');
  };

  const handleSkip = () => {
    showToast('Без сохранения', 'info');
    resetVoiceObservation();
    navigate('/parent/home');
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Уточним детали"
        subtitle="Ответьте, если помните"
        showBack
        fallbackPath="/parent/ai-review"
      />

      {/* AI Disclaimer */}
      <QoldauCard variant="tinted-warm" padding="sm">
        <p className="text-xs text-ink-2 leading-relaxed">
          <span className="font-bold">Подсказка:</span> лучше задать короткий вопрос
          и сохранить только подтверждённое наблюдение. Это наблюдение, не диагноз.
        </p>
      </QoldauCard>

      {/* Вопросы — динамические или дефолтные */}
      {useDynamic ? (
        <div className="flex flex-col gap-3">
          {aiQuestions.map((q, idx) => (
            <QoldauCard key={q.id ?? idx} variant="tinted-blue" padding="md">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-card-soft">
                  <HelpCircle className="w-4 h-4 text-blue" />
                </div>
                <p className="text-sm font-black text-ink flex-1 leading-tight">
                  {q.question}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {q.options.map((option) => {
                  const selected = answers[q.id] === option;
                  return (
                    <button
                      key={option}
                      onClick={() => handleAnswer(q.id, option)}
                      className={`px-3.5 py-2 rounded-full text-xs font-bold border transition-all active:scale-[0.96] ${
                        selected
                          ? 'bg-teal text-white border-teal shadow-card-soft'
                          : 'bg-white border-line text-ink-2 hover:border-teal/40'
                      }`}
                      aria-pressed={selected}
                    >
                      {selected && <Check size={11} className="inline-block mr-1 -mt-0.5" />}
                      {option}
                    </button>
                  );
                })}
              </div>
            </QoldauCard>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {DEFAULT_QUESTIONS.map((q) => {
            const Icon = ICON_MAP[q.iconName];
            const selected = answers[q.id];
            return (
              <QoldauCard key={q.id} variant="tinted-blue" padding="md">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 shadow-card-soft">
                    <AppIcon component={Icon} size={18} colorClass="text-blue" />
                  </div>
                  <p className="text-sm font-black text-ink flex-1 leading-tight">
                    {q.question}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {q.options.map((option) => {
                    const isSelected = selected === option;
                    return (
                      <button
                        key={option}
                        onClick={() => handleAnswer(q.id, option)}
                        className={`px-3.5 py-2 rounded-full text-xs font-bold border transition-all active:scale-[0.96] ${
                          isSelected
                            ? 'bg-teal text-white border-teal shadow-card-soft'
                            : 'bg-white border-line text-ink-2 hover:border-teal/40'
                        }`}
                        aria-pressed={isSelected}
                      >
                        {isSelected && <Check size={11} className="inline-block mr-1 -mt-0.5" />}
                        {option}
                      </button>
                    );
                  })}
                </div>
              </QoldauCard>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 mt-2">
        <PrimaryAction
          label="Сохранить и подтвердить"
          onClick={handleSave}
          variant="primary"
          size="lg"
          iconRight={<ArrowRight size={18} />}
        />
        <PrimaryAction
          label="Не сохранять"
          onClick={handleSkip}
          variant="ghost"
          size="md"
        />
      </div>
    </div>
  );
};