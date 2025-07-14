import { renderHook } from '@testing-library/react';

import useLazyRef from './useLazyRef';

describe('useLazyRef', () => {
    it('calls the initializer function only once', () => {
        const initializer = jest.fn(() => ({ val: 42 }));

        const { result, rerender } = renderHook(() => useLazyRef(initializer));

        expect(initializer).toHaveBeenCalledTimes(1);
        expect(result.current.current).toEqual({ val: 42 });

        rerender();

        // Should not re-initialize on rerender
        expect(initializer).toHaveBeenCalledTimes(1);
    });

    it('returns a stable ref object across re-renders', () => {
        const { result, rerender } = renderHook(() =>
            useLazyRef(() => ({ random: Math.random() }))
        );

        const firstRef = result.current;
        rerender();
        const secondRef = result.current;

        expect(firstRef).toBe(secondRef);
    });
});
