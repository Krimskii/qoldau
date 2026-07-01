import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Link2, FileText, Lightbulb, CheckCircle, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { VoiceWave } from '@/components/ui/VoiceWave';
import { useEventStore } from '@/store/useEventStore';
import { useToastStore } from '@/store/useToastStore';

const SOURCE_LABELS: Record<string, string> = {
  parent: 'Голосовое наблюдение родителя',
  child: 'AAC карточка ребёнка',
  tutor: 'Наблюдение тьютора',
  ai: 'AI-структурирование',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  confirmed: { label: 'Подтверждено', color: 'bg-green-soft text-green', icon: <CheckCircle className="w-4 h-4" /> },
  needs_verification: { label: 'Нужно проверить', color: 'bg-yellow-soft text-yellow', icon: <AlertCircle className="w-4 h-4" /> },
  edited: { label: 'Исправлено', color: 'bg-blue-soft text-blue', icon: <Edit className="w-4 h-4" /> },
};

export const EventDetails: React.FC = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { events } = useEventStore();
  const { showToast } = useToastStore();
  
  const event = events.find((e) => e.id === eventId);

  if (!event) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="Событие не найдено" showBack />
      </div>
    );
  }

  const linkedEvents = (event.linkedEventIds || [])
    .map((id) => events.find((e) => e.id === id))
    .filter((e): e is NonNullable<typeof e> => e !== undefined);

  const sourceLabel = SOURCE_LABELS[event.sourceRole] || 'Наблюдение';
  const statusConfig = STATUS_CONFIG[event.status] || null;

  // Generate contextual AI hypothesis
  const aiHypothesis = React.useMemo(() => {
    const type = event.type;
    if (type === 'sensory' || type === 'behavior') {
      return 'Похоже, это событие может быть связано с сенсорной чувствительностью. Это наблюдение, не диагноз. Нужно подтвердить дополнительными наблюдениями.';
    }
    if (type === 'communication') {
      return 'Ребёнок использовал коммуникацию в этот момент. Это хороший знак! Можно отметить в коммуникационном профиле.';
    }
    if (type === 'food' || type === 'water') {
      return 'Это событие связано с базовыми потребностями. Такие наблюдения помогают видеть паттерны.';
    }
    return 'Это событие добавлено в Event Timeline. Чем больше наблюдений — тем точнее паттерны.';
  }, [event.type]);

  // Generate suggestions
  const suggestions = React.useMemo(() => {
    if (event.type === 'sensory' || event.type === 'behavior') {
      return [
        'Можно попробовать тихое место',
        'Снизить освещение',
        'Предложить тактильный инструмент',
      ];
    }
    if (event.type === 'communication') {
      return [
        'Отметить в коммуникационном профиле',
        'Поддержать попытку коммуникации',
      ];
    }
    return [
      'Можно обсудить со специалистом',
      'Отметить в отчёте',
    ];
  }, [event.type]);

  const handleEdit = () => {
    showToast('Функция редактирования будет доступна в следующей версии', 'info');
  };

  const handleShowRelated = () => {
    if (linkedEvents.length > 0) {
      navigate(`/parent/events/${linkedEvents[0].id}`);
    } else {
      showToast('Связанных событий пока нет', 'info');
    }
  };

  const handleAddToReport = () => {
    showToast('Событие добавлено в отчёт', 'success');
  };

  return (
    <div className="flex flex-col gap-4 pb-8">
      <PageHeader
        title="Детали события"
        subtitle={new Date(event.timestamp).toLocaleDateString('ru-RU', { 
          day: 'numeric', 
          month: 'long' 
        })}
        showBack
      />

      {/* Main Event Card */}
      <Card variant="default">
        <div className="flex gap-3 items-start">
          <div className="w-12 h-12 rounded-xl bg-teal-soft flex items-center justify-center text-teal">
            <span className="text-lg font-bold">{event.title[0]}</span>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">{event.title}</h3>
            <p className="text-sm text-muted mt-1">{event.description}</p>
          </div>
        </div>
        
        {/* Badges */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-line">
          <Badge className="bg-teal-soft text-teal">{sourceLabel}</Badge>
          {statusConfig && (
            <Badge className={`${statusConfig.color} flex items-center gap-1`}>
              {statusConfig.icon}
              {statusConfig.label}
            </Badge>
          )}
        </div>
      </Card>

      {/* Original phrase */}
      {event.rawText && (
        <Card variant="default">
          <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted" />
            Исходная фраза
          </h4>
          <p className="text-sm text-ink-2 italic mb-3">"{event.rawText}"</p>
          <VoiceWave bars={6} />
        </Card>
      )}

      {/* Linked Events */}
      {linkedEvents.length > 0 && (
        <Card variant="default">
          <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
            <Link2 className="w-4 h-4 text-muted" />
            Связанные события ({linkedEvents.length})
          </h4>
          <div className="space-y-2">
            {linkedEvents.map((linked) => linked && (
              <button
                key={linked.id}
                onClick={() => navigate(`/parent/events/${linked.id}`)}
                className="w-full flex items-center gap-3 p-3 bg-bg rounded-xl text-left hover:bg-teal-soft transition-colors"
              >
                <span className="text-xs text-muted">
                  {new Date(linked.timestamp).toLocaleTimeString('ru-RU', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
                <span className="text-sm font-medium flex-1">{linked.title}</span>
                <ArrowLeft className="w-4 h-4 text-muted rotate-180" />
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* AI Hypothesis */}
      <AIInsightCard
        text={aiHypothesis}
        variant="default"
      />

      {/* Suggestions */}
      <Card variant="default">
        <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-yellow" />
          Что можно попробовать
        </h4>
        <ul className="space-y-2">
          {suggestions.map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-ink-2">
              <span className="text-teal mt-1">•</span>
              {s}
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted mt-4 italic">
          Это рекомендации на основе наблюдений. Не являются медицинским советом.
        </p>
      </Card>

      {/* Actions */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        <button 
          onClick={handleEdit}
          className="flex items-center justify-center gap-2 border border-line rounded-xl bg-white py-3 text-sm font-bold text-ink hover:bg-bg transition-colors"
        >
          <Edit className="w-4 h-4" />
          Редактировать
        </button>
        <button 
          onClick={handleShowRelated}
          className="flex items-center justify-center gap-2 border border-line rounded-xl bg-white py-3 text-sm font-bold text-ink hover:bg-bg transition-colors"
        >
          <Link2 className="w-4 h-4" />
          Связанные
        </button>
        <button 
          onClick={handleAddToReport}
          className="flex items-center justify-center gap-2 border border-teal rounded-xl bg-teal-soft py-3 text-sm font-bold text-teal hover:bg-teal hover:text-white transition-colors"
        >
          <FileText className="w-4 h-4" />
          В отчёт
        </button>
      </div>
    </div>
  );
};
