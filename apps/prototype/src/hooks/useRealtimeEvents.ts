/**
 * useRealtimeEvents (v0.7.2) — подписка на socket.io события.
 *
 * Подключается к backend при mount (если api.baseUrl задан),
 * joinChild(childId) для фильтрации по ребёнку.
 *
 * Получает 'event:new', 'event:updated', 'event:deleted' и зеркалит
 * в useEventStore (без optimistic-логики — событие уже записано в БД).
 *
 * Auto-reconnect с backoff.
 */
import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { api } from '@/api/client';
import { useEventStore } from '@/store/useEventStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getCache } from '@/utils/cache';
import type { QoldauEvent } from '@/types/qoldau';

export interface RealtimeStatus {
  connected: boolean;
  connecting: boolean;
  error: string | null;
}

export function useRealtimeEvents(childId: string | null) {
  const [status, setStatus] = useState<RealtimeStatus>({
    connected: false,
    connecting: false,
    error: null,
  });

  const socketRef = useRef<Socket | null>(null);
  const isApiMode = useEventStore((s) => s.apiMode);
  const jwt = useAuthStore((s) => s.jwt);

  useEffect(() => {
    // Только если backend настроен И apiMode активен
    if (!api.baseUrl || !isApiMode) {
      return;
    }

    setStatus((s) => ({ ...s, connecting: true, error: null }));

    const socket = io(api.baseUrl, {
      transports: ['websocket', 'polling'],
      auth: jwt ? { token: jwt } : {},
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setStatus({ connected: true, connecting: false, error: null });
      if (childId) {
        socket.emit('joinChild', childId);
      }
    });

    socket.on('disconnect', (reason) => {
      setStatus((s) => ({ ...s, connected: false, error: `disconnected: ${reason}` }));
    });

    socket.on('connect_error', (err) => {
      setStatus((s) => ({ ...s, connected: false, connecting: false, error: err.message }));
    });

    // Обработчики событий
    socket.on('event:new', (data: { childId: string; id: string }) => {
      // Re-fetch event по id, добавляем в store
      void refreshEvent(data.id, 'add');
    });

    socket.on('event:updated', (data: { childId: string; id: string }) => {
      void refreshEvent(data.id, 'update');
    });

    socket.on('event:deleted', (data: { childId: string; id: string }) => {
      useEventStore.getState().deleteEvent(data.id);
    });

    return () => {
      if (childId) {
        socket.emit('leaveChild', childId);
      }
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api.baseUrl, isApiMode, childId, jwt]);

  // Если childId меняется — обновляем join
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !socket.connected || !childId) return;
    socket.emit('joinChild', childId);
  }, [childId]);

  return status;
}

/** Fetch event by id и merge в store (с дедупликацией через cache). */
async function refreshEvent(id: string, mode: 'add' | 'update'): Promise<void> {
  const cache = getCache();
  const cacheKey = `event:${id}`;
  if (cache.has(cacheKey)) return; // уже подтянули
  cache.set(cacheKey, { ts: Date.now() });

  try {
    const res = (await api.events.get(id)) as { event: QoldauEvent };
    if (!res.event) return;
    const store = useEventStore.getState();
    const exists = store.events.some((e) => e.id === id);
    if (mode === 'add' && !exists) {
      store.setEvents([res.event, ...store.events]);
    } else if (mode === 'update' && exists) {
      store.updateEvent(id, res.event);
    }
  } catch {
    // Network error — skip
  }
}