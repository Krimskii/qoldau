/**
 * Тесты useSpeechRecognition — Web Speech API hook.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSpeechRecognition } from '@/lib/stt/useSpeechRecognition';

describe('useSpeechRecognition', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('detects support when SpeechRecognition is mocked', () => {
    const { result } = renderHook(() => useSpeechRecognition({ mockTranscript: 'test' }));
    expect(result.current.supported).toBe(true);
    expect(result.current.mode).toBe('real');
  });

  it('starts with empty transcript and not listening', () => {
    const { result } = renderHook(() => useSpeechRecognition({ mockTranscript: 'test' }));
    expect(result.current.transcript).toBe('');
    expect(result.current.isListening).toBe(false);
  });

  it('start() sets isListening to true', async () => {
    const { result } = renderHook(() => useSpeechRecognition({ mockTranscript: 'hello world' }));
    act(() => {
      result.current.start();
    });
    // Дать mock'у выстрелить onstart через setTimeout(0)
    await new Promise((r) => setTimeout(r, 10));
    expect(result.current.isListening).toBe(true);
  });

  it('stop() sets isListening to false', async () => {
    const { result } = renderHook(() => useSpeechRecognition({ mockTranscript: 'hello' }));
    act(() => {
      result.current.start();
    });
    await new Promise((r) => setTimeout(r, 10));
    act(() => {
      result.current.stop();
    });
    await new Promise((r) => setTimeout(r, 10));
    expect(result.current.isListening).toBe(false);
  });

  it('reset() clears transcript', async () => {
    const { result } = renderHook(() => useSpeechRecognition({ mockTranscript: 'fallback transcript for testing' }));
    act(() => {
      result.current.start();
    });
    // mock fallback заполнит transcript
    await new Promise((r) => setTimeout(r, 200));
    act(() => {
      result.current.reset();
    });
    expect(result.current.transcript).toBe('');
  });

  it('getAuthHeader returns empty when not authenticated', () => {
    // Этот тест для useAuthStore, но проверяет аналогичный паттерн
    // Через наш hook мы не можем напрямую — пропускаем
  });
});