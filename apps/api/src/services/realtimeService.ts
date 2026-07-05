/**
 * realtimeService (v0.7.2) — socket.io broadcaster.
 *
 * При создании Event через API emit 'event:new' всем подключённым клиентам
 * в комнате ребёнка. Frontend подписывается через useRealtimeEvents hook.
 *
 * Опционально: JWT auth через socket.handshake.auth.token. Без токена
 * подключение разрешено (для demo), но помечено как anonymous.
 */
import type { Server as HttpServer } from 'node:http';
import { Server as IOServer, type Socket } from 'socket.io';
import { authService } from './authService.js';

let io: IOServer | null = null;

interface SocketWithUser extends Socket {
  data: { userId?: string; email?: string; role?: string };
}

export const realtimeService = {
  /**
   * Инициализирует socket.io на существующем HTTP server.
   * Вызывается из index.ts после listen().
   */
  init(httpServer: HttpServer): IOServer {
    io = new IOServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:5173', 'http://localhost:4173'],
        credentials: true,
      },
      // Long-polling fallback не нужен — все современные браузеры
      // поддерживают WebSocket.
      transports: ['websocket', 'polling'],
    });

    // Auth middleware (опционально). Если в handshake.auth.token передан
    // валидный JWT — привязываем userId к сокету.
    io.use((socket: SocketWithUser, next) => {
      const token = (socket.handshake.auth as { token?: string } | undefined)?.token;
      if (!token) {
        // Anonymous connection — допустимо для demo
        socket.data = {};
        return next();
      }
      const result = authService.verifyJwtHeader(`Bearer ${token}`);
      if (!result.ok) {
        return next(new Error('Invalid auth token'));
      }
      socket.data = result.user;
      next();
    });

    io.on('connection', (socket: SocketWithUser) => {
      console.log(`[realtime] client connected: ${socket.id} (user: ${socket.data.email ?? 'anonymous'})`);

      // Клиент может joinChild(childId) для подписки на события
      // конкретного ребёнка. Без join — получает только общие broadcast.
      socket.on('joinChild', (childId: string) => {
        if (typeof childId !== 'string' || !childId) return;
        socket.join(`child:${childId}`);
        console.log(`[realtime] ${socket.id} joined child:${childId}`);
      });

      socket.on('leaveChild', (childId: string) => {
        if (typeof childId !== 'string' || !childId) return;
        socket.leave(`child:${childId}`);
      });

      socket.on('disconnect', (reason) => {
        console.log(`[realtime] client disconnected: ${socket.id} (${reason})`);
      });
    });

    return io;
  },

  /** Broadcast нового события в комнату ребёнка + всем подключённым. */
  broadcastEvent(event: { childId: string; id: string }): void {
    if (!io) return;
    const payload = { type: 'event:new', event };
    io.to(`child:${event.childId}`).emit('event:new', event);
    // Также broadcast всем (для дашбордов, которые смотрят на все события)
    io.emit('event:broadcast', event);
  },

  /** Broadcast обновления события. */
  broadcastEventUpdate(event: { childId: string; id: string }): void {
    if (!io) return;
    io.to(`child:${event.childId}`).emit('event:updated', event);
    io.emit('event:broadcast', { ...event, _action: 'updated' });
  },

  /** Broadcast удаления события. */
  broadcastEventDelete(event: { childId: string; id: string }): void {
    if (!io) return;
    io.to(`child:${event.childId}`).emit('event:deleted', event);
    io.emit('event:broadcast', { ...event, _action: 'deleted' });
  },

  /** Текущий io instance (для health check). */
  getIO(): IOServer | null {
    return io;
  },
};