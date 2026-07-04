import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Link2,
  FileText,
  Lightbulb,
  Copy,
  Ear,
  Sun,
  Hand,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { QoldauCard } from '@/components/ui/QoldauCard';
import { EventTypeBadge, EventStatusBadge } from '@/components/ui/Primitives';
import { AppIcon } from '@/components/ui/AppIcon';
import { useEventStore } from '@/store/useEventStore';
import { useToastStore } from '@/store/useToastStore';
import { VoiceWaveIcon, EventTimelineIcon } from '@/components/icons';
import { eventTypeColors, toneToColor, type EventTone } from '@/styles/tokens';
import { formatDate, formatTime } from '@/utils/dateFormat';

/**
 * Иконки для sensory-чипов. Если метка не распознана — fallback текстом.
 */
const SENSORY_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  sound: Ear,
  light: Sun,
  touch: Hand,
  smell: Sun,
  temperature: Sun,
};

const SENSORY_LABEL: Record<string, string> = {
  sound: 'Звук',
  light: 'Свет',
  touch: 'Тактильно',
  smell: 'Запах',
  temperature: 'Температура',
};

const SOURCE_LABEL: Record<string, string> = {
  parent: 'Записано родителем',
  child: 'От ребёнка',
  tutor: 'От тьютора',
  specialist: 'От специалиста',
  device: 'Устройство',
  ai: 'AI-наблюдение',
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
        <QoldauCard variant="default">
          <p className="text-sm text-muted text-center py-4">
            Возможно, событие было удалено или вы перешли по устаревшей ссылке.
          </p>
          <button
            onClick={() => navigate('/parent/events')}
            className="mt-3 w-full px-4 py-3 rounded-2xl bg-teal-soft text-teal-dark font-bold text-sm hover:bg-teal hover:text-white transition-colors"
          >
            Вернуться к событиям
          </button>
        </QoldauCard>
      </div>
    );
  }

  const linkedEvents = (event.linkedEventIds || [])
    .map((id) => events.find((e) => e.id === id))
    .filter((e): e is NonNullable<typeof e> => e !== undefined);

  const cfg = (eventTypeColors as Record<string, { tone: EventTone; emoji: string }>)[event.type];
  const tone: EventTone = cfg?.tone ?? 'blue';
  const toneColor = toneToColor(tone);

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

  const handleCopy = () => showToast('Событие скопировано', 'success');
  const handleAddToReport = () => showToast('Событие добавлено в отчёт', 'success');

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Детали события"
        subtitle={formatDate(event.timestamp)}
        showBack
      />

      {/* Hero — основное событие */}
      <QoldauCard variant="elevated" padding="lg">
        <div className="flex gap-4 items-start">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 border"
            style={{
              backgroundColor: `${toneColor}15`,
              borderColor: `${toneColor}30`,
              color: toneColor,
            }}
          >
            {event.type === 'voice_observation' ? (
              <VoiceWaveIcon size={36} className="" />
            ) : (
              <AppIcon
                component={EventTimelineIcon}
                size={36}
                colorClass=""
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <EventTypeBadge eventType={event.type} size="md" />
            <h3 className="text-lg font-black text-ink leading-tight mt-2">
              {event.title}
            </h3>
            <p className="text-sm text-ink-2 leading-relaxed mt-1.5">
              {event.description}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-4 mt-4 border-t border-line-soft">
          <EventStatusBadge status={event.status} />
          <span className="inline-flex items-center h-7 px-2.5 rounded-full text-xs font-bold border border-line bg-white text-ink-2">
            {SOURCE_LABEL[event.sourceRole] ?? event.sourceRole}
          </span>
          {event.confidence !== undefined && (
            <span className="inline-flex items-center h-7 px-2.5 rounded-full text-xs font-bold border border-line bg-white text-muted">
              уверенность {Math.round(event.confidence * 100)}%
            </span>
          )}
        </div>
      </QoldauCard>

      {/* Исходная фраза / transcript */}
      {event.rawText && (
        <QoldauCard variant="tinted-blue" padding="md">
          <div className="flex items-center gap-2 mb-2">
            <AppIcon
              component={VoiceWaveIcon}
              size={16}
              colorClass="text-blue"
            />
            <p className="text-xs font-black text-blue uppercase tracking-wide">
              Исходная фраза
            </p>
          </div>
          <p className="text-sm text-ink italic leading-relaxed">
            «{event.rawText}»
          </p>
          {typeof event.payload?.originalTranscript === 'string' &&
            (event.payload.originalTranscript as string) !== event.rawText && (
              <p className="text-xs text-muted mt-2 leading-relaxed">
                <span className="font-bold">До правок:</span>{' '}
                <span className="italic">
                  «{event.payload.originalTranscript as string}»
                </span>
              </p>
            )}
        </QoldauCard>
      )}

      {/* Linked events */}
      {linkedEvents.length > 0 && (
        <QoldauCard variant="default" padding="md">
          <div className="flex items-center gap-2 mb-3">
            <AppIcon component={Link2} size={16} colorClass="text-muted" />
            <p className="text-sm font-black text-ink">Связанные события</p>
            <span className="ml-auto text-xs font-bold text-muted">
              {linkedEvents.length}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {linkedEvents.map((linked) => (
              <button
                key={linked.id}
                onClick={() => navigate(`/parent/events/${linked.id}`)}
                className="w-full flex items-center gap-3 p-3 bg-bg rounded-2xl text-left hover:bg-teal-soft transition-colors"
              >
                <span className="text-xs text-muted font-bold tabular-nums">
                  {formatTime(linked.timestamp)}
                </span>
                <EventTypeBadge eventType={linked.type} size="sm" showIcon={false} />
                <span className="text-sm font-bold text-ink flex-1 truncate">
                  {linked.title}
                </span>
                <ArrowLeft className="w-4 h-4 text-muted rotate-180" />
              </button>
            ))}
          </div>
        </QoldauCard>
      )}

      {/* AI Hypothesis — осторожная подпись */}
      <QoldauCard variant="tinted-yellow" padding="md">
        <div className="flex items-center gap-2 mb-2">
          <AppIcon component={Lightbulb} size={16} colorClass="text-yellow" />
          <p className="text-xs font-black text-yellow uppercase tracking-wide">
            AI-наблюдение
          </p>
          <span className="text-[10px] text-muted italic ml-auto">
            не диагноз
          </span>
        </div>
        <p className="text-sm text-ink-2 leading-relaxed">{aiHypothesis}</p>
      </QoldauCard>

      {/* v1.5+ (wave 2) — ABC-секция: «что было до / произошло / после».
        Показывается только если есть хотя бы одно из полей abc. Без
        диагнозов — это наблюдательная структура для родителя/специалиста. */}
      {event.abc &&
        (event.abc.antecedent ||
          event.abc.behavior ||
          event.abc.consequence) && (
          <QoldauCard variant="tinted-purple" padding="md">
            <div className="flex items-center gap-2 mb-3">
              <p className="text-xs font-black text-purple uppercase tracking-wide">
                ABC — что было
              </p>
            </div>
            <div className="flex flex-col gap-2.5">
              {event.abc.antecedent && (
                <div className="flex gap-2">
                  <span className="text-xs font-black text-purple uppercase w-12 flex-shrink-0 pt-0.5">
                    До
                  </span>
                  <p className="text-sm text-ink-2 leading-relaxed flex-1">
                    {event.abc.antecedent}
                  </p>
                </div>
              )}
              {event.abc.behavior && (
                <div className="flex gap-2">
                  <span className="text-xs font-black text-purple uppercase w-12 flex-shrink-0 pt-0.5">
                    Что
                  </span>
                  <p className="text-sm text-ink-2 leading-relaxed flex-1">
                    {event.abc.behavior}
                  </p>
                </div>
              )}
              {event.abc.consequence && (
                <div className="flex gap-2">
                  <span className="text-xs font-black text-purple uppercase w-12 flex-shrink-0 pt-0.5">
                    После
                  </span>
                  <p className="text-sm text-ink-2 leading-relaxed flex-1">
                    {event.abc.consequence}
                  </p>
                </div>
              )}
            </div>
            <p className="text-[11px] text-muted mt-3 italic">
              Наблюдение, не диагноз. Можно обсудить со специалистом.
            </p>
          </QoldauCard>
        )}

      {/* v1.5+ (wave 2) — sensory context чипы (звук/свет/тактильно/...). */}
      {event.sensoryContext && event.sensoryContext.length > 0 && (
        <QoldauCard variant="default" padding="md">
          <p className="text-xs font-black text-muted uppercase tracking-wide mb-2">
            Сенсорный контекст
          </p>
          <div className="flex flex-wrap gap-1.5">
            {event.sensoryContext.map((s) => {
              const key = s.toLowerCase().trim();
              const Icon = SENSORY_ICON[key];
              const label = SENSORY_LABEL[key] ?? s;
              return (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-xs font-bold border border-line bg-yellow-soft text-yellow"
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  {label}
                </span>
              );
            })}
          </div>
        </QoldauCard>
      )}

      {/* Suggestions — осторожный disclaimer */}
      <QoldauCard variant="tinted-warm" padding="md">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={14} className="text-muted" />
          <p className="text-sm font-black text-ink">Что можно попробовать</p>
        </div>
        <ul className="flex flex-col gap-2">
          {suggestions.map((s, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-ink-2 leading-relaxed"
            >
              <span className="text-teal mt-1.5 leading-none">•</span>
              {s}
            </li>
          ))}
        </ul>
        <p className="text-[11px] text-muted mt-3 italic leading-relaxed">
          Это возможные шаги. Не медицинский совет. Можно обсудить со специалистом.
        </p>
      </QoldauCard>

      {/* Actions — Wave 0: «Изменить» скрыт, чтобы не вести в тупик.
        Редактирование появится в следующей версии. Сейчас: Копировать + В отчёт. */}
      <div className="grid grid-cols-2 gap-2">
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