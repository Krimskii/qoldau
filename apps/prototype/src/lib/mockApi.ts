import { QoldauEvent, ChildProfile, NotificationItem } from '@/types/qoldau';
import { mockChild, mockEvents } from '@/data/mockChild';
import { mockNotifications } from '@/data/mockNotifications';

class MockApi {
  private events: QoldauEvent[] = [...mockEvents];
  private notifications: NotificationItem[] = [...mockNotifications];

  async getChildProfile(): Promise<ChildProfile> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockChild;
  }

  async getEvents(childId: string): Promise<QoldauEvent[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return this.events.filter((e) => e.childId === childId);
  }

  async addEvent(event: Omit<QoldauEvent, 'id'>): Promise<QoldauEvent> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const newEvent: QoldauEvent = {
      ...event,
      id: `evt-${Date.now()}`,
    };
    this.events.unshift(newEvent);
    return newEvent;
  }

  async updateEvent(id: string, updates: Partial<QoldauEvent>): Promise<QoldauEvent | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const index = this.events.findIndex((e) => e.id === id);
    if (index === -1) return null;
    this.events[index] = { ...this.events[index], ...updates };
    return this.events[index];
  }

  async getNotifications(childId: string): Promise<NotificationItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return this.notifications.filter((n) => n.childId === childId);
  }

  async markNotificationRead(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const notification = this.notifications.find((n) => n.id === id);
    if (notification) {
      notification.isRead = true;
    }
  }
}

export const mockApi = new MockApi();
