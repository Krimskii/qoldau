// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { chooseSupportedAudioMimeType, useAudioRecorder } from './useAudioRecorder';

class MockMediaRecorder {
  static isTypeSupported = vi.fn((mimeType: string) => mimeType === 'audio/webm');

  state: RecordingState = 'inactive';
  mimeType = 'audio/webm';
  ondataavailable: ((event: BlobEvent) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: (() => void) | null = null;
  start = vi.fn(() => {
    this.state = 'recording';
  });
  stop = vi.fn(() => {
    this.ondataavailable?.({ data: new Blob(['recorded-audio'], { type: 'audio/webm' }) } as BlobEvent);
    this.state = 'inactive';
    this.onstop?.();
  });

  constructor(_stream: MediaStream, _options?: MediaRecorderOptions) {}
}

const mockTrack = { stop: vi.fn() } as unknown as MediaStreamTrack;
const mockStream = {
  getTracks: () => [mockTrack],
} as unknown as MediaStream;

describe('useAudioRecorder', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    mockTrack.stop = vi.fn();
  });

  it('chooses the first supported mime type', () => {
    vi.stubGlobal('MediaRecorder', MockMediaRecorder);
    expect(chooseSupportedAudioMimeType(['audio/mp4', 'audio/webm'])).toBe('audio/webm');
  });

  it('records and returns an audio blob', async () => {
    vi.stubGlobal('MediaRecorder', MockMediaRecorder);
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream),
      },
    });

    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.isRecording).toBe(true);

    const recorded: { blob?: Blob | null } = {};
    await act(async () => {
      recorded.blob = await result.current.stopRecording();
    });

    expect(result.current.isRecording).toBe(false);
    expect(result.current.isProcessing).toBe(false);
    expect(recorded.blob).toBeInstanceOf(Blob);
    const recordedBlob = recorded.blob as Blob;
    expect(recordedBlob.type).toBe('audio/webm');
    expect(mockTrack.stop).toHaveBeenCalled();
  });

  it('reports unsupported browser instead of throwing', async () => {
    vi.stubGlobal('MediaRecorder', undefined);
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: undefined,
    });

    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.isRecording).toBe(false);
    expect(result.current.error).toBe('MediaRecorder is not available in this browser');
  });
});
