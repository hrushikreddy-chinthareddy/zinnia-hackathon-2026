import { render, act } from '@testing-library/react';
import React, { useRef } from 'react';

import { useResizeObserver } from './useResizeObserver';

type ResizeObserverCallback = ConstructorParameters<typeof ResizeObserver>[0];

let mockResizeCallback: ResizeObserverCallback;
const observe = jest.fn();
const unobserve = jest.fn();
const disconnect = jest.fn();

// Mock ResizeObserver globally
beforeAll(() => {
    (global as any).ResizeObserver = class {
        constructor(cb: ResizeObserverCallback) {
            mockResizeCallback = cb;
        }
        observe = observe;
        unobserve = unobserve;
        disconnect = disconnect;
    };
});

afterEach(() => {
    jest.clearAllMocks();
});

function triggerResize(
    width: number,
    height: number,
    box: 'contentBoxSize' | 'borderBoxSize' | 'devicePixelContentBoxSize'
) {
    const entry: Partial<ResizeObserverEntry> = {
        contentRect: {
            x: 0,
            y: 0,
            width,
            height,
            top: 0,
            right: width,
            bottom: height,
            left: 0,
            toJSON: () => '',
        },
        [box]: [{ inlineSize: width, blockSize: height }],
    };

    act(() => {
        mockResizeCallback!(
            [entry as ResizeObserverEntry],
            {} as ResizeObserver
        );
    });
}

describe('useResizeObserver (TS-safe)', () => {
    it('updates size state when element is resized', () => {
        function TestComponent() {
            const ref = useRef<HTMLDivElement>(null);
            const size = useResizeObserver({ ref });

            return React.createElement(
                'div',
                null,
                React.createElement('div', { ref }),
                React.createElement(
                    'span',
                    { 'data-testid': 'size' },
                    `${size.width}x${size.height}`
                )
            );
        }

        const { getByTestId } = render(React.createElement(TestComponent));
        expect(getByTestId('size').textContent).toBe('undefinedxundefined');

        triggerResize(100, 200, 'contentBoxSize');
        expect(getByTestId('size').textContent).toBe('100x200');

        triggerResize(300, 400, 'contentBoxSize');
        expect(getByTestId('size').textContent).toBe('300x400');
    });

    it('calls onResize callback instead of updating state', () => {
        const onResizeMock = jest.fn();

        function TestComponent() {
            const ref = useRef<HTMLDivElement>(null);
            useResizeObserver({ ref, onResize: onResizeMock });

            return React.createElement('div', { ref });
        }

        render(React.createElement(TestComponent));

        triggerResize(150, 250, 'contentBoxSize');
        expect(onResizeMock).toHaveBeenCalledWith({ width: 150, height: 250 });
    });

    it('does not update if size remains the same', () => {
        const onResizeMock = jest.fn();

        function TestComponent() {
            const ref = useRef<HTMLDivElement>(null);
            useResizeObserver({ ref, onResize: onResizeMock });

            return React.createElement('div', { ref });
        }

        render(React.createElement(TestComponent));

        triggerResize(200, 200, 'contentBoxSize');
        triggerResize(200, 200, 'contentBoxSize');
        expect(onResizeMock).toHaveBeenCalledTimes(1);
    });

    it('falls back to contentRect when boxSize is missing', () => {
        function TestComponent() {
            const ref = useRef<HTMLDivElement>(null);
            const size = useResizeObserver({ ref });

            return React.createElement(
                'div',
                null,
                React.createElement('div', { ref }),
                React.createElement(
                    'span',
                    { 'data-testid': 'size' },
                    `${size.width}x${size.height}`
                )
            );
        }

        const { getByTestId } = render(React.createElement(TestComponent));

        const entry = {
            contentRect: {
                x: 0,
                y: 0,
                width: 123,
                height: 456,
                top: 0,
                right: 123,
                bottom: 456,
                left: 0,
                toJSON: () => '',
            },
            contentBoxSize: undefined,
        } as unknown as ResizeObserverEntry;

        act(() => {
            mockResizeCallback!([entry], {} as ResizeObserver);
        });

        expect(getByTestId('size').textContent).toBe('123x456');
    });
});
