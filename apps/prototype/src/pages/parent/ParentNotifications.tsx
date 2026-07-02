import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Sparkles, MessageCircle, GraduationCap } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { QoldauCard } from '@/components/ui/QoldauCard';
import { SectionCard } from '@/components/ui/SectionCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { useEventStore } from '@/store/useEventStore';
import { DEMO_PRIMARY_CHILD } from '@/data/demoDataset';
import type { LucideIcon } from 'lucide-react';
import { formatDate } from '@/utils/dateFormat';

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  source: 'child' | 'tutor' | 'specialist' | 'system';
  read: boolean;
  Icon: LucideIcon;
  bgClass: string;
  textClass: string;
}

const SOURCE_STYLES: Record<
  Notification['source'],
  { Icon: LucideIcon; bgClass: string; textClass: string }
> = {
  child: { Icon: Sparkles, bgClass: 'bg-coral-soft', textClass: 'text-coral' },
  tutor: { Icon: GraduationCap, bgClass: 'bg-purple-soft', textClass: 'text-purple' },
  specialist: { Icon: MessageCircle, bgClass: 'bg-blue-soft', textClass: 'text-blue' },
  system: { Icon: Bell, bgClass: 'bg-yellow-soft', textClass: 'text-yellow' },
};

export const ParentNotifications: React.FC = () => {
  const { events } = useEventStore();
  const navigate = useNavigate();

  const notifications = useMemo<Notification[]>(() => {
    const childEvents = events
      .filter(
        (e) =>
          e.childId === DEMO_PRIMARY_CHILD.id &&
          (e.sourceRole === 'child' || e.sourceRole === 'tutor' || e.sourceRole === 'specialist')
      )
      .slice(-6)
      .reverse()
      .map((e, idx): Notification => {
        const src = e.sourceRole as 'child' | 'tutor' | 'specialist';
        const style = SOURCE_STYLES[src];
        return {
          id: `notif-${e.id}`,
          title:
            e.sourceRole === 'child'
              ? `${DEMO_PRIMARY_CHILD.name}: ${e.title}`
              : e.sourceRole === 'tutor'
                ? `Тьютор: ${e.title}`
                : `Специалист: ${e.title}`,
          description: e.description,
          time: formatDate(e.timestamp, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
          source: src,
          read: idx > 1,
          Icon: style.Icon,
          bgClass: style.bgClass,
          textClass: style.textClass,
        };
      });

    const sysStyle = SOURCE_STYLES.system;
    return [
      {
        id: 'sys-1',
        title: 'Отчёт тьютора готов',
        description: 'Айдана отправила отчёт о сегодняшнем занятии',
        time: '1 июля, 15:30',
        source: 'system',
        read: false,
        Icon: sysStyle.Icon,
        bgClass: sysStyle.bgClass,
        textClass: sysStyle.textClass,
      },
      ...childEvents,
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
        <EmptyState
          icon="🔔"
          title="Нет уведомлений"
          description="Здесь будут события от ребёнка, тьютора и специалиста"
        />
      ) : (
        <SectionCard title="Все уведомления" accent="teal">
          <div className="flex flex-col gap-2.5">
            {notifications.map((notif) => {
              const Icon = notif.Icon;
              return (
                <QoldauCard
                  key={notif.id}
                  variant="default"
                  padding="md"
                  hoverable
                  onClick={() => {
                    if (notif.source === 'system') {
                      navigate('/tutor/report');
                    } else {
                      navigate(`/parent/events`);
                    }
                  }}
                  className={!notif.read ? 'border-teal/30 bg-teal-tint' : ''}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl ${notif.bgClass} flex items-center justify-center flex-shrink-0`}
                      aria-hidden="true"
                    >
                      <Icon className={`w-5 h-5 ${notif.textClass}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-sm font-black text-ink flex-1 min-w-0 truncate">
                          {notif.title}
                        </h4>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-teal flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted leading-relaxed line-clamp-2">
                        {notif.description}
                      </p>
                      <p className="text-[11px] text-muted mt-1">{notif.time}</p>
                    </div>
                  </div>
                </QoldauCard>
              );
            })}
          </div>
        </SectionCard>
      )}

      <QoldauCard variant="soft" padding="md">
        <p className="text-xs text-muted text-center leading-relaxed">
          Уведомления информационные. Это не сигналы тревоги и не медицинские сообщения.
        </p>
      </QoldauCard>
    </div>
  );
};