import { useCallback, useEffect, useRef, useState } from 'react';

interface UseElapsedTimerOptions {
  /** Called after each 1s tick with the new elapsed seconds. */
  onTick?: (seconds: number) => void;
}

/**
 * Ticking elapsed-seconds counter (1s resolution) shared by recording/voice UIs.
 * start() resets to 0 and begins ticking; stop() halts and keeps the last value.
 */
export function useElapsedTimer(options?: UseElapsedTimerOptions) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onTickRef = useRef(options?.onTick);
  onTickRef.current = options?.onTick;

  const clear = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const start = useCallback(() => {
    clear();
    setSeconds(0);
    setIsActive(true);
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        const next = s + 1;
        onTickRef.current?.(next);
        return next;
      });
    }, 1000);
  }, []);

  const stop = useCallback(() => {
    clear();
    setIsActive(false);
  }, []);

  const reset = useCallback(() => {
    clear();
    setSeconds(0);
    setIsActive(false);
  }, []);

  useEffect(() => clear, []);

  return { seconds, isActive, start, stop, reset };
}
