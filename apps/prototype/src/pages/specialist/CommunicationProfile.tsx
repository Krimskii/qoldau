import React, { useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useEventStore } from '@/store/useEventStore';
import { CheckCircle, AlertCircle, MessageCircle, TrendingUp, Link2, Brain } from 'lucide-react';

interface Signal {
  signal: string;
  meaning: string;
  confirmed: number;
  lastSeen: string;
  sources: string[];
  confidence: 'high' | 'medium' | 'low';
  relatedEvents: number;
}

export const CommunicationProfile: React.FC = () => {
  const { events } = useEventStore();

  // Generate signals from events - using rawText as fallback signal identifier
  const signals = useMemo<Signal[]>(() => {
    const signalMap = new Map<string, Signal>();
    
    events.forEach(event => {
      if (event.rawText) {
        const signalKey = event.rawText.slice(0, 20); // Use first 20 chars as key
        const existing = signalMap.get(signalKey);
        if (existing) {
          existing.confirmed++;
          existing.relatedEvents++;
          if (!existing.sources.includes(event.sourceRole)) {
            existing.sources.push(event.sourceRole);
          }
        } else {
          signalMap.set(signalKey, {
            signal: event.rawText.slice(0, 15) + (event.rawText.length > 15 ? '...' : ''),
            meaning: event.description || 'Значение уточняется',
            confirmed: 1,
            lastSeen: new Date(event.timestamp).toLocaleDateString('ru-RU'),
            sources: [event.sourceRole],
            confidence: event.status === 'confirmed' ? 'high' : 'medium',
            relatedEvents: 1,
          });
        }
      }
    });

    // If no signals from events, show mock data
    if (signalMap.size === 0) {
      return [
        { signal: 'ту-ту', meaning: 'Запрос туалета', confirmed: 8, lastSeen: '29 июня', sources: ['parent', 'tutor'], confidence: 'high', relatedEvents: 8 },
        { signal: 'ва-ва', meaning: 'Хочу пить / еду', confirmed: 12, lastSeen: '1 июля', sources: ['parent', 'child'], confidence: 'high', relatedEvents: 15 },
        { signal: 'ааа', meaning: 'Дискомфорт / усталость', confirmed: 5, lastSeen: '30 июня', sources: ['parent'], confidence: 'medium', relatedEvents: 6 },
        { signal: 'мульт', meaning: 'Хочу посмотреть мультик', confirmed: 4, lastSeen: '1 июля', sources: ['child'], confidence: 'medium', relatedEvents: 4 },
        { signal: 'ням-ням', meaning: 'Голодный / хочу поесть', confirmed: 6, lastSeen: '29 июня', sources: ['parent', 'tutor'], confidence: 'high', relatedEvents: 7 },
      ];
    }

    return Array.from(signalMap.values()).sort((a, b) => b.confirmed - a.confirmed);
  }, [events]);

  const highConfidenceSignals = signals.filter(s => s.confidence === 'high');
  const mediumConfidenceSignals = signals.filter(s => s.confidence === 'medium');

  // Generate AI observation
  const aiObservation = useMemo(() => {
    if (signals.length === 0) return null;
    
    const avgConfirmed = signals.reduce((acc, s) => acc + s.confirmed, 0) / signals.length;
    const hasChildSource = signals.some(s => s.sources.includes('child'));
    
    if (avgConfirmed >= 5) {
      return 'Похоже, собирается достаточно подтверждённых сигналов. Это поможет специалисту лучше понять коммуникацию ребёнка.';
    }
    if (hasChildSource) {
      return 'Ребёнок начинает использовать AAC карточки — это хороший прогресс в коммуникации!';
    }
    return 'Чем больше наблюдений — тем точнее профиль. Продолжайте фиксировать сигналы.';
  }, [signals]);

  const getConfidenceColor = (confidence: Signal['confidence']) => {
    switch (confidence) {
      case 'high': return 'bg-green-soft text-green';
      case 'medium': return 'bg-yellow-soft text-yellow';
      case 'low': return 'bg-bg text-muted border border-line';
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'parent': return 'Родитель';
      case 'child': return 'Ребёнок';
      case 'tutor': return 'Тьютор';
      default: return source;
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-8">
      <PageHeader
        title="Коммуникационный профиль"
        subtitle="Сигналы и их значения"
      />

      {/* AI Observation */}
      {aiObservation && (
        <div className="bg-gradient-to-r from-blue-soft to-purple-soft border border-blue/20 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Brain className="w-5 h-5 text-blue mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-ink leading-relaxed">{aiObservation}</p>
              <p className="text-xs text-muted mt-2 italic">Это наблюдение, не диагноз. Нужно подтвердить.</p>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card variant="default" className="text-center">
          <p className="text-2xl font-black text-teal">{signals.length}</p>
          <p className="text-xs text-muted">Сигналов</p>
        </Card>
        <Card variant="default" className="text-center">
          <p className="text-2xl font-black text-green">{highConfidenceSignals.length}</p>
          <p className="text-xs text-muted">Подтверждённых</p>
        </Card>
        <Card variant="default" className="text-center">
          <p className="text-2xl font-black text-yellow">{mediumConfidenceSignals.length}</p>
          <p className="text-xs text-muted">Требуют проверки</p>
        </Card>
      </div>

      {/* Signals List */}
      <Card variant="default">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-teal" />
            Сигналы ребёнка
          </h4>
          <Badge className="bg-teal-soft text-teal">{signals.length} сигналов</Badge>
        </div>
        
        <p className="text-xs text-muted mb-4">
          Сигнал → Возможное значение → Источник подтверждений
        </p>

        <div className="space-y-3">
          {signals.map((signal, i) => (
            <div 
              key={i} 
              className="bg-bg rounded-xl p-4 hover:bg-teal-soft/30 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-ink">{signal.signal}</span>
                  <TrendingUp className="w-4 h-4 text-teal" />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getConfidenceColor(signal.confidence)}`}>
                    {signal.confidence === 'high' ? 'Высокая' : signal.confidence === 'medium' ? 'Средняя' : 'Низкая'}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-ink-2 mb-3">{signal.meaning}</p>
              
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
                <div className="flex items-center gap-1 text-muted">
                  <CheckCircle className="w-3 h-3" />
                  Подтверждено: <span className="font-bold text-ink">{signal.confirmed} раз</span>
                </div>
                <div className="flex items-center gap-1 text-muted">
                  <AlertCircle className="w-3 h-3" />
                  Последний: <span className="font-bold text-ink">{signal.lastSeen}</span>
                </div>
                <div className="flex items-center gap-1 text-muted">
                  <Link2 className="w-3 h-3" />
                  Источники: <span className="font-bold text-ink">{signal.sources.map(getSourceLabel).join(', ')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Communication Methods */}
      <Card variant="default">
        <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-teal" />
          Методы коммуникации
        </h4>
        <div className="flex flex-wrap gap-2">
          {['AAC карточки', 'Звуки / вокализации', 'Жесты', 'Взгляд', 'Мимика'].map((m) => (
            <Badge key={m} className="bg-teal-soft text-teal">{m}</Badge>
          ))}
        </div>
      </Card>

      {/* Progress */}
      <Card variant="default">
        <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-teal" />
          Прогресс за месяц
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Новых сигналов</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-teal">+{Math.max(0, signals.length - 3)}</span>
              <TrendingUp className="w-4 h-4 text-green" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Использование AAC</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-teal">+15%</span>
              <TrendingUp className="w-4 h-4 text-green" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Спонтанные звуки</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-green">↑</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted mt-4 italic">
          Это наблюдения на основе данных. Не является медицинской оценкой.
        </p>
      </Card>
    </div>
  );
};
