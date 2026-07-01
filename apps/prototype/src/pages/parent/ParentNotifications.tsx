import React, { useMemo } from 'react';
import { Bell } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  source: 'child' | 'tutor' | 'specialist' | 'system';
  read: boolean;
}

export const ParentNotifications: React.FC = () => {
  const { events } = useEventStore();

  // Derive mock notifications from Event Timeline
  const notifications = useMemo<Notification[]>(() => {
    const childEvents = events.filter(
      (e) =>
        e.childId === DEMO_PRIMARY_CHILD.id &&
        (e.sourceRole === 'child' || e.sourceRole === 'tutor' || e.sourceRole === 'specialist')
    );

    const fromEvents = childEvents
      .slice(-8)
      .reverse()
      .map((e, idx): Notification => ({
        id: `notif-${e.id}`,
        title:
          e.sourceRole === 'child'
            ? `${DEMO_PRIMARY_CHILD.name}: ${e.title}`
            : e.sourceRole === 'tutor'
              ? `Тьютор: ${e.title}`
              : `Специалист: ${e.title}`,
        description: e.description,
        time: new Date(e.timestamp).toLocaleString('ru-RU', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
        source:
          e.sourceRole === 'child'
            ? 'child'
            : e.sourceRole === 'tutor'
              ? 'tutor'
              : 'specialist',
        read: idx > 1, // first 2 unread
      }));

    // Add a couple of system notifications
    return [
      {
        id: 'sys-1',
        title: 'Отчёт тьютора готов',
        description: 'Айдана отправила отчёт о сегодняшнем занятии',
        time: '1 июля, 15:30',
        source: 'system',
        read: false,
      },
      ...fromEvents,
    ];
  }, [events]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Уведомления"
        subtitle={unreadCount > 0 ? `${unreadCount} новых` : 'Всё прочитано'}
        showBack
        rightAction={<Bell className="w-5 h-5 text-muted" />}
      />

      {notifications.length === 0 ? (
        <Card variant="default">
          <div className="text-center py-6">
            <p className="text-sm font-bold mb-1">Нет уведомлений</p>
            <p className="text-xs text-muted">
              Здесь будут уведомления о событиях от ребёнка, тьютора и специалиста
            </p>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              variant="default"
              className={!notif.read ? 'border-teal/30 bg-teal-soft/30' : ''}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    notif.source === 'child'
                      ? 'bg-coral-soft text-coral'
                      : notif.source === 'tutor'
                        ? 'bg-purple-soft text-purple'
                        : notif.source === 'specialist'
                          ? 'bg-blue-soft text-blue'
                          : 'bg-yellow-soft text-yellow'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold flex-1">{notif.title}</h4>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-teal flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted leading-relaxed">{notif.description}</p>
                  <p className="text-xs text-muted mt-1">{notif.time}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card variant="default" className="bg-bg border-line">
        <p className="text-xs text-muted text-center leading-relaxed">
          Все уведомления — только информационные. Это не сигналы тревоги и не медицинские сообщения.
        </p>
      </Card>
    </div>
  );
};