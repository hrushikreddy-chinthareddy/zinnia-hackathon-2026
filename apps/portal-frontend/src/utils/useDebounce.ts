import { useEffect, useState } from 'react';
import { Timeout } from 'react-number-format/types/types';

function useDebounce<T>(value: T, delay: number): T {
    // State and setters for debounced value
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(
        () => {
            // Update debounced value after delay
            const handler = setTimeout(() => {
                setDebouncedValue(value);
            }, delay);
            // Cancel the timeout if value changes (also on delay change or unmount)
            // This is how we prevent debounced value from updating if value is changed ...
            // .. within the delay period. Timeout gets cleared and restarted.
            return () => {
                clearTimeout(handler);
            };
        },
        [value, delay] // Only re-call effect if value or delay changes
    );
    return debouncedValue;
}

export const debounce = (fn: any, ms: number) => {
    let timer: NodeJS.Timeout;
    return () => {
        clearTimeout(timer);
        timer = setTimeout((...args) => {
            clearTimeout(timer);
            fn.apply(this, args);
        }, ms);
    };
};

export const throttle = (fn: any, throttleDelay: number = 200, options: { runAtStart?: boolean; runAtEnd?: boolean } = {}) => {
    let args: any[] | null = null;
    let timeout: Timeout | null = null;
    let lastRan = 0;
    const later = () => {
        lastRan = options.runAtStart === false ? 0 : Date.now();
        timeout = null;
        fn.apply(this, args);
        if (!timeout) {
            args = null;
        }
    };

    return function (this: any, ...rest: any[]) {
        const now = Date.now();
        if (!lastRan && options.runAtStart === false) lastRan = now;
        const remaining = throttleDelay - (now - lastRan);
        args = rest;
        if (remaining <= 0 || remaining > throttleDelay) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            lastRan = now;
            fn.apply(this, rest);
        } else if (!timeout && options.runAtEnd !== false) {
            timeout = setTimeout(later, remaining);
        }
    };
};

export default useDebounce;
