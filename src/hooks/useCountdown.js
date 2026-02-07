import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para manejar un contador regresivo
 * @param {number} initialSeconds - Segundos iniciales
 * @param {Function} onComplete - Callback cuando llega a 0
 * @returns {Object} - { seconds, isRunning, start, pause, reset }
 */
const useCountdown = (initialSeconds, onComplete) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    if (seconds <= 0) {
      setIsRunning(false);
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setSeconds((s) => s - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [seconds, isRunning, onComplete]);

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => {
    setSeconds(initialSeconds);
    setIsRunning(false);
  }, [initialSeconds]);

  return { seconds, isRunning, start, pause, reset };
};

export default useCountdown;
