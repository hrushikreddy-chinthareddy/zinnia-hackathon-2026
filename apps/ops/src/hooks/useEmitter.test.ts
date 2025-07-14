import { renderHook, act } from '@testing-library/react';

import useEmitter from './useEmitter';

type Events = {
    custom: string;
    anotherEvent: number;
};

describe('useEmitter', () => {
    it('creates a new emitter and handles events correctly', () => {
        const { result } = renderHook(() => useEmitter<Events>());
        const emitter = result.current;

        const handler = jest.fn();

        act(() => {
            emitter.on('custom', handler);
            emitter.emit('custom', 'Hello World');
        });

        expect(handler).toHaveBeenCalledWith('Hello World');
        expect(handler).toHaveBeenCalledTimes(1);
    });

    it('removes event listeners properly', () => {
        const { result } = renderHook(() => useEmitter<Events>());
        const emitter = result.current;

        const handler = jest.fn();

        act(() => {
            emitter.on('anotherEvent', handler);
            emitter.off('anotherEvent', handler);
            emitter.emit('anotherEvent', 123);
        });

        expect(handler).not.toHaveBeenCalled();
    });

    it('is stable across re-renders (returns same emitter)', () => {
        const { result, rerender } = renderHook(() => useEmitter<Events>());
        const firstEmitter = result.current;

        rerender();
        const secondEmitter = result.current;

        expect(firstEmitter).toBe(secondEmitter);
    });
});
