import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Link2, FileText, Lightbulb, Copy, Mic } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { useEventStore } from '@/store/useEventStore';
import { useToastStore } from '@/store/useToastStore';
import {
  getEventSourceLabel,
  getEventSourceClassName,
  getEventStatusLabel,
  getEventStatusClassName,
} from '@/utils/eventLabels';

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
        <Card variant="default">
          <p className="text-sm text-muted text-center py-4">
            Возможно, событие было удалено или вы перешли по устаревшей ссылке.
          </p>
        </Card>
      </div>
    );
  }

  const linkedEvents = (event.linkedEventIds || [])
    .map((id) => events.find((e) => e.id === id))
    .filter((e): e is NonNullable<typeof e> => e !== undefined);

  const aiHypothesis = (() => {
    const type = event.type;
    if (type === 'sensory' || type === 'behavior') {
      return 'Похоже, это событие может быть связано с сенсорной чувствительностью. Это наблюдение, не диагноз. Нужно подтвердить дополнительными наблюдениями.';
    }
    if (type === 'communication' || type === 'aac_card') {
      return 'Похоже, ребёнок использовал коммуникацию в этот момент. Это хороший знак! Можно отметить в коммуникационном профиле.';
    }
    if (type === 'food' || type === 'water') {
      return 'Похоже, это событие связано с базовыми потребностями. Такие наблюдения помогают видеть повторяющиеся ситуации и реакции.';
    }
    return 'Это событие добавлено в Event Timeline. Чем больше наблюдений — тем точнее паттерны.';
  })();

  const suggestions = (() => {
    if (event.type === 'sensory' || event.type === 'behavior') {
      return [
        'Можно попробовать тихое место',
        'Можно попробовать снизить освещение',
        'Можно предложить тактильный инструмент',
      ];
    }
    if (event.type === 'communication' || event.type === 'aac_card') {
      return [
        'Можно отметить в коммуникационном профиле',
        'Можно поддержать попытку коммуникации',
      ];
    }
    return ['Можно обсудить со специалистом', 'Можно отметить в отчёте'];
  })();

  const handleEdit = () => showToast('Редактирование будет в следующей версии', 'info');
  const handleCopy = () => {
    showToast('Событие скопировано', 'success');
  };
  const handleAddToReport = () => showToast('Событие добавлено в отчёт', 'success');

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Детали события"
        subtitle={new Date(event.timestamp).toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
        })}
        showBack
      />

      {/* Main Event */}
      <Card variant="default">
        <div className="flex gap-3 items-start mb-3">
          <div className="w-14 h-14 rounded-2xl bg-teal-soft flex items-center justify-center text-teal flex-shrink-0">
            <Mic className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-black text-ink leading-tight">{event.title}</h3>
            <p className="text-sm text-muted mt-1 leading-relaxed">
              {event.description}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-line-soft">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold ${getEventSourceClassName(
              event.sourceRole
            )}`}
          >
            {getEventSourceLabel(event.sourceRole)}
          </span>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold ${getEventStatusClassName(
              event.status
            )}`}
          >
            {getEventStatusLabel(event.status)}
          </span>
        </div>
      </Card>

      {/* Original phrase */}
      {event.rawText && (
        <Card variant="tinted-blue">
          <p className="text-xs font-black text-blue uppercase tracking-wide mb-2">
            Исходная фраза
          </p>
          <p className="text-sm text-ink italic leading-relaxed">"{event.rawText}"</p>
        </Card>
      )}

      {/* Linked Events */}
      {linkedEvents.length > 0 && (
        <Card variant="default">
          <div className="flex items-center gap-2 mb-3">
            <Link2 className="w-4 h-4 text-muted" />
            <p className="text-sm font-black text-ink">Связанные события</p>
            <span className="ml-auto text-xs font-bold text-muted">
              {linkedEvents.length}
            </span>
          </div>
          <div className="space-y-2">
            {linkedEvents.map((linked) => (
              <button
                key={linked.id}
                onClick={() => navigate(`/parent/events/${linked.id}`)}
                className="w-full flex items-center gap-3 p-3 bg-bg rounded-2xl text-left hover:bg-teal-soft transition-colors"
              >
                <span className="text-xs text-muted font-bold tabular-nums">
                  {new Date(linked.timestamp).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className="text-sm font-bold text-ink flex-1 truncate">
                  {linked.title}
                </span>
                <ArrowLeft className="w-4 h-4 text-muted rotate-180" />
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* AI Hypothesis */}
      <AIInsightCard text={aiHypothesis} variant="warning" />

      {/* Suggestions */}
      <Card variant="tinted-yellow">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-yellow" />
          <p className="text-sm font-black text-ink">Что можно попробовать</p>
        </div>
        <ul className="space-y-2">
          {suggestions.map((s, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-ink-2 leading-relaxed"
            >
              <span className="text-teal mt-1">•</span>
              {s}
            </li>
          ))}
        </ul>
        <p className="text-[11px] text-muted mt-3 italic">
          Это возможные шаги. Не медицинский совет. Можно обсудить со специалистом.
        </p>
      </Card>

      {/* Actions */}
      <div className="grid grid-cols-3 gap-2 mt-2">
        <button
          onClick={handleEdit}
          className="flex items-center justify-center gap-1.5 h-12 rounded-2xl bg-white border border-line text-ink hover:bg-bg transition-colors text-sm font-bold"
        >
          <Edit className="w-4 h-4" />
          Изменить
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-1.5 h-12 rounded-2xl bg-white border border-line text-ink hover:bg-bg transition-colors text-sm font-bold"
        >
          <Copy className="w-4 h-4" />
          Копировать
        </button>
        <button
          onClick={handleAddToReport}
          className="flex items-center justify-center gap-1.5 h-12 rounded-2xl bg-teal-soft border border-teal/30 text-teal-dark hover:bg-teal hover:text-white transition-colors text-sm font-bold"
        >
          <FileText className="w-4 h-4" />
          В отчёт
        </button>
      </div>
    </div>
  );
};