/**
 * HealthCheckBanner (v0.6.3) — compact status banner на landing.
 *
 * Polls /api/health каждые 30с. Показывает статус API, DB, AI mode.
 */
import React, { useEffect, useState } from 'react';
import { Activity, Database, Cpu, Mic } from 'lucide-react';
import { api } from '@/api/client';
import { AppIcon } from './AppIcon';

interface HealthState {
  ok: boolean;
  api: 'online' | 'offline' | 'unknown';
  db: 'ok' | 'error' | 'unknown';
  ai: { source: 'claude' | 'mock'; enabled: boolean; model: string } | null;
  stt: { source: 'whisper' | 'mock'; enabled: boolean; model: string } | null;
  lastChecked: number;
}

const initial: HealthState = {
  ok: false,
  api: 'unknown',
  db: 'unknown',
  ai: null,
  stt: null,
  lastChecked: 0,
};

const POLL_MS = 30_000;

export const HealthCheckBanner: React.FC = () => {
  const [state, setState] = useState<HealthState>(initial);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      if (!api.baseUrl) {
        setState((s) => ({ ...s, api: 'offline', lastChecked: Date.now() }));
        return;
      }
      try {
        const result = (await api.health()) as unknown as {
          ok: boolean;
          db: { status: 'ok' | 'error' };
          ai: { source: 'claude' | 'mock'; enabled: boolean; model: string };
          stt: { source: 'whisper' | 'mock'; enabled: boolean; model: string };
        };
        if (cancelled) return;
        setState({
          ok: result.ok,
          api: 'online',
          db: result.db.status,
          ai: result.ai,
          stt: result.stt,
          lastChecked: Date.now(),
        });
      } catch {
        if (cancelled) return;
        setState((s) => ({ ...s, api: 'offline', lastChecked: Date.now() }));
      }
    };

    void check();
    const interval = setInterval(check, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Если API не настроен (VITE_API_BASE_URL пусто) — не показываем.
  if (!api.baseUrl) return null;

  return (
    <div className="bg-white border border-line rounded-3xl shadow-card-soft p-4">
      <div className="flex items-center gap-2 mb-3">
        <AppIcon component={Activity} size={16} colorClass="text-teal-dark" />
        <h3 className="text-sm font-black text-ink">Состояние системы</h3>
        <span className="ml-auto text-[10px] text-muted">
          {state.lastChecked
            ? new Date(state.lastChecked).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
            : 'проверка…'}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <StatusRow
          icon={Activity}
          label="API"
          status={state.api === 'online' ? 'ok' : state.api === 'offline' ? 'error' : 'pending'}
        />
        <StatusRow
          icon={Database}
          label="Database"
          status={state.db === 'ok' ? 'ok' : state.db === 'error' ? 'error' : 'pending'}
        />
        <StatusRow
          icon={Cpu}
          label="AI"
          status={state.ai?.source === 'claude' ? 'live' : 'mock'}
          hint={state.ai?.model ?? 'mock'}
        />
        <StatusRow
          icon={Mic}
          label="STT"
          status={state.stt?.source === 'whisper' ? 'live' : 'mock'}
          hint={state.stt?.model ?? 'mock'}
        />
      </div>

      {state.api === 'offline' && (
        <p className="text-[10px] text-coral mt-2 leading-relaxed">
          Backend недоступен. Приложение работает в demo-режиме.
        </p>
      )}
    </div>
  );
};

interface StatusRowProps {
  icon: typeof Activity;
  label: string;
  status: 'ok' | 'error' | 'pending' | 'live' | 'mock';
  hint?: string;
}

const StatusRow: React.FC<StatusRowProps> = ({ icon: Icon, label, status, hint }) => {
  const colorMap: Record<typeof status, string> = {
    ok: 'bg-teal-soft text-teal-dark',
    error: 'bg-coral-soft text-coral',
    pending: 'bg-bg text-muted',
    live: 'bg-purple-soft text-purple',
    mock: 'bg-yellow-soft text-yellow',
  };
  const labelMap: Record<typeof status, string> = {
    ok: 'online',
    error: 'offline',
    pending: '…',
    live: 'real',
    mock: 'mock',
  };
  return (
    <div className={`rounded-2xl p-2.5 ${colorMap[status]}`}>
      <div className="flex items-center gap-1.5">
        <AppIcon component={Icon} size={12} />
        <span className="text-[11px] font-bold">{label}</span>
        <span className="ml-auto text-[9px] font-black uppercase tracking-wide opacity-80">
          {labelMap[status]}
        </span>
      </div>
      {hint && (
        <p className="text-[9px] mt-0.5 truncate opacity-70 font-mono">
          {hint}
        </p>
      )}
    </div>
  );
};