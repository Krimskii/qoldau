import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Utensils, Droplet, Smile, Brain } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { mockAIParsedObservation } from '@/data/mockEvents';

export const AIReview: React.FC = () => {
  const navigate = useNavigate();

  const eventIcons: Record<string, React.ElementType> = {
    food: Utensils,
    toilet: Droplet,
    behavior: Smile,
    communication: Brain,
  };

  const eventColors: Record<string, string> = {
    food: 'food',
    behavior: 'behavior',
    toilet: 'toilet',
    communication: 'behavior',
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="AI-разбор наблюдения"
        subtitle="Проверьте, всё ли правильно"
        rightAction={<Sparkles className="w-5 h-5 text-teal" />}
      />

      {/* Parsed Events */}
      {mockAIParsedObservation.events.map((event, i) => {
        const Icon = eventIcons[event.type] || Brain;
        return (
          <Card key={i} variant={eventColors[event.type] as 'food' | 'behavior' | 'toilet'}>
            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-xl bg-white border border-black/[0.04] flex items-center justify-center text-teal-dark">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold">{event.title}</h4>
                <p className="text-xs text-ink-2 leading-relaxed">
                  {event.description}
                  <br />
                  <strong>{event.timestamp}</strong>
                </p>
              </div>
            </div>
          </Card>
        );
      })}

      {/* AI Note */}
      <AIInsightCard text={mockAIParsedObservation.insight} variant="warning" />

      {/* Actions */}
      <div className="flex flex-col gap-2 mt-2">
        <Button onClick={() => navigate('/parent/clarify')}>Сохранить всё</Button>
        <Button variant="secondary" onClick={() => navigate('/parent/clarify')}>
          Исправить
        </Button>
        <Button variant="ghost">Не сохранять аудио</Button>
      </div>
    </div>
  );
};
