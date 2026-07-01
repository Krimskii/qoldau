import { NotificationItem } from '@/types/qoldau';

export const mockNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    childId: 'child-1',
    title: 'Новое голосовое наблюдение',
    description: 'Мама записала наблюдение',
    type: 'ai_review',
    createdAt: '2026-07-01T10:50:00',
    isRead: false,
  },
  {
    id: 'notif-2',
    childId: 'child-1',
    title: 'Запрос от ребёнка',
    description: 'Алихан попросил воду',
    type: 'aac',
    createdAt: '2026-07-01T10:45:00',
    isRead: true,
  },
  {
    id: 'notif-3',
    childId: 'child-1',
    title: 'SOS',
    description: 'Алихан нажал SOS',
    type: 'sos',
    createdAt: '2026-07-01T10:30:00',
    isRead: true,
  },
];

export const getUnreadCount = () => mockNotifications.filter((n) => !n.isRead).length;
