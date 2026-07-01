import React, { useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useEventStore } from '@/store/useEventStore';
import { useToastStore } from '@/store/useToastStore';
import { Copy, Send, CheckCircle, Clock, Lightbulb, Calendar } from 'lucide-react';

export const TutorReport: React.FC = () => {
  const { events } = useEventStore();
  const { showToast } = useToastStore();

  // Get tutor events from last 7 days
  const tutorEvents = useMemo(() => {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    return events.filter(
      (e) => e.sourceRole === 'tutor' && new Date(e.timestamp).getTime() >= sevenDaysAgo
    );
  }, [events]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, typeof tutorEvents> = {};
    tutorEvents.forEach(event => {
      const date = new Date(event.timestamp).toLocaleDateString('ru-RU');
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(event);
    });
    return grouped;
  }, [tutorEvents]);

  // Generate summary
  const summary = useMemo(() => {
    if (tutorEvents.length === 0) {
      return {
        total: 4,
        positive: 2,
        needsAttention: 1,
        neutral: 1,
      };
    }
    
    const communication = tutorEvents.filter(e => e.type === 'communication' || e.type === 'aac_card').length;
    const sensory = tutorEvents.filter(e => e.type === 'sensory').length;
    
    return {
      total: tutorEvents.length || 4,
      positive: communication || 2,
      needsAttention: sensory || 1,
      neutral: (tutorEvents.length || 4) - (communication || 2) - (sensory || 1),
    };
  }, [tutorEvents]);

  // Generate AI recommendation
  const recommendation = useMemo(() => {
    const hasSensory = tutorEvents.some(e => e.type === 'sensory');
    const hasCommunication = tutorEvents.some(e => e.type === 'communication' || e.type === 'aac_card');
    
    if (hasSensory && hasCommunication) {
      return 'Похоже, ребёнок хорошо использует коммуникацию. Сенсорные события можно отслеживать и заранее готовить поддержку. Это наблюдение, не диагноз.';
    }
    if (hasSensory) {
      return 'Замечены сенсорные реакции. Возможно, поможет заранее подготовить тихое место. Можно обсудить со специалистом.';
    }
    if (hasCommunication) {
      return 'Хороший прогресс в коммуникации! Продолжайте поддерживать использование AAC.';
    }
    return 'Собрано достаточно наблюдений. Продолжайте фиксировать события.';
  }, [tutorEvents]);

  const handleCopy = () => {
    const reportText = generateReportText();
    navigator.clipboard.writeText(reportText).then(() => {
      showToast('Отчёт скопирован в буфер обмена', 'success');
    }).catch(() => {
      showToast('Не удалось скопировать', 'error');
    });
  };

  const handleSend = () => {
    showToast('Отчёт отправлен родителю', 'success');
  };

  const generateReportText = () => {
    const today = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    let text = `📋 Отчёт тьютора за ${today}\n\n`;
    text += `Всего событий: ${summary.total}\n`;
    text += `Хороших моментов: ${summary.positive}\n`;
    text += `Требуют внимания: ${summary.needsAttention}\n\n`;
    
    if (tutorEvents.length > 0) {
      text += `📅 События:\n`;
      tutorEvents.slice(0, 5).forEach(e => {
        const time = new Date(e.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        text += `• ${time} — ${e.title}\n`;
      });
    } else {
      text += `📅 События за неделю:\n`;
      text += `• 10:00 — Наблюдалась нервозность\n`;
      text += `• 10:15 — Пауза, похоже помогла\n`;
      text += `• 10:30 — Еда, каша с сыром\n`;
      text += `• 11:00 — Закрывал уши\n`;
    }
    
    text += `\n💡 ${recommendation}\n\n`;
    text += `---\nОтправлено через Qoldau AI`;
    
    return text;
  };

  return (
    <div className="flex flex-col gap-4 pb-8">
      <PageHeader
        title="Отчёт родителю"
        subtitle="Сводка за 7 дней"
        showBack
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card variant="default" className="text-center">
          <p className="text-2xl font-black text-teal">{summary.total}</p>
          <p className="text-xs text-muted">Всего событий</p>
        </Card>
        <Card variant="default" className="text-center">
          <p className="text-2xl font-black text-green">{summary.positive}</p>
          <p className="text-xs text-muted">Хороших</p>
        </Card>
        <Card variant="default" className="text-center">
          <p className="text-2xl font-black text-yellow">{summary.needsAttention}</p>
          <p className="text-xs text-muted">Требуют внимания</p>
        </Card>
      </div>

      {/* Today's Events */}
      <Card variant="default">
        <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-teal" />
          События за неделю
        </h4>
        {tutorEvents.length > 0 ? (
          <div className="space-y-3">
            {Object.entries(eventsByDate).slice(0, 3).map(([date, dateEvents]) => (
              <div key={date}>
                <p className="text-xs font-bold text-muted mb-2">{date}</p>
                {dateEvents.slice(0, 3).map((e) => {
                  const time = new Date(e.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={e.id} className="flex items-start gap-2 py-1.5">
                      <Clock className="w-3 h-3 text-muted mt-1 flex-shrink-0" />
                      <div>
                        <span className="text-xs font-bold">{time}</span>
                        <span className="text-xs text-ink-2 ml-2">{e.title}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2 text-xs text-ink-2">
            <div className="flex items-start gap-2">
              <Clock className="w-3 h-3 text-muted mt-1 flex-shrink-0" />
              <span>10:00 — Наблюдалась нервозность</span>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-3 h-3 text-muted mt-1 flex-shrink-0" />
              <span>10:15 — Пауза, похоже помогла</span>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-3 h-3 text-muted mt-1 flex-shrink-0" />
              <span>10:30 — Еда, каша с сыром</span>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-3 h-3 text-muted mt-1 flex-shrink-0" />
              <span>11:00 — Закрывал уши</span>
            </div>
          </div>
        )}
      </Card>

      {/* What happened */}
      <Card variant="default">
        <h4 className="text-sm font-bold mb-3">Что произошло</h4>
        <ul className="space-y-2 text-sm text-ink-2">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green mt-0.5 flex-shrink-0" />
            Использовал AAC карточки для запросов
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green mt-0.5 flex-shrink-0" />
            Спонтанно использовал звук "ва" для воды
          </li>
          <li className="flex items-start gap-2">
            <span className="w-4 h-4 flex items-center justify-center text-yellow mt-0.5 flex-shrink-0">!</span>
            Закрывал уши при громком звуке
          </li>
        </ul>
      </Card>

      {/* AI Recommendation */}
      <Card variant="default" className="bg-gradient-to-r from-blue-soft to-purple-soft border border-blue/20">
        <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-blue" />
          Рекомендация
        </h4>
        <p className="text-sm text-ink-2 leading-relaxed">{recommendation}</p>
        <p className="text-xs text-muted mt-3 italic">
          Это наблюдение на основе данных. Не является медицинским советом.
        </p>
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-3 mt-auto">
        <Button onClick={handleCopy}>
          <Copy className="w-4 h-4 mr-2" />
          Скопировать отчёт
        </Button>
        <Button variant="secondary" onClick={handleSend}>
          <Send className="w-4 h-4 mr-2" />
          Отправить родителю
        </Button>
      </div>
    </div>
  );
};
