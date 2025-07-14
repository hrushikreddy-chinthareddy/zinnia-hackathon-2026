import { renderHook, act } from '@testing-library/react';

import useLocalStorage from './useLocalStorage';

describe('useLocalStorage', () => {
    const key = 'testKey';

    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    it('should initialize with initialValue if localStorage is empty', () => {
        const { result } = renderHook(() =>
            useLocalStorage(key, 'defaultValue')
        );

        const [storedValue] = result.current;
        expect(storedValue).toBe('defaultValue');
    });

    it('should read from localStorage if value exists', () => {
        localStorage.setItem(key, 'storedValue'); // ✅ FIXED: no stringify

        const { result } = renderHook(() =>
            useLocalStorage(key, 'defaultValue')
        );

        const [storedValue] = result.current;
        expect(storedValue).toBe('storedValue');
    });

    it('should update localStorage when value is set', () => {
        const { result } = renderHook(() => useLocalStorage(key, 'initial'));

        const [, setValue] = result.current;

        act(() => {
            setValue('updated');
        });

        const [updatedValue] = result.current;
        expect(updatedValue).toBe('updated');
        expect(localStorage.getItem(key)).toBe(JSON.stringify('updated'));
    });

    it('should support updater function as setValue argument', () => {
        const { result } = renderHook(() => useLocalStorage(key, 1));

        const [, setValue] = result.current;

        act(() => {
            setValue((prev: any) => prev + 1);
        });

        const [updatedValue] = result.current;
        expect(updatedValue).toBe(2);
        expect(localStorage.getItem(key)).toBe('2');
    });

    it('should handle non-JSON values gracefully', () => {
        localStorage.setItem(key, 'rawString');
        const { result } = renderHook(() => useLocalStorage(key, 'fallback'));

        const [storedValue] = result.current;
        expect(storedValue).toBe('rawString');
    });
});
