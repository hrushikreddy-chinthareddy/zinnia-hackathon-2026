import { useCallback, useRef, useEffect } from 'react';

/**
 * Creates a debounced hover handler that only executes after hovering for a specified delay
 *
 * @param callback Function to execute after hover duration
 * @param delay Time in milliseconds to wait (default: 1000ms)
 * @returns Object with debounced hover handler functions
 */
export function useHoverDebounce(callback: () => void, delay: number = 1000) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const startHoverTimer = useCallback(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Start new timer
    timerRef.current = setTimeout(() => {
      callback();
      timerRef.current = null;
    }, delay);
  }, [callback, delay]);

  const cancelHoverTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return {
    startHoverTimer,
    cancelHoverTimer,
  };
}
