import { render, fireEvent } from '@testing-library/react';
import React, { useRef, useState } from 'react';

import { useOutsideClick } from './useOutsideClick';

describe('useOutsideClick', () => {
    const TestComponent = ({
        onOutsideClick = () => {},
        initialOpen = true,
    }: {
        onOutsideClick?: () => void;
        initialOpen?: boolean;
    }) => {
        const ref = useRef<HTMLDivElement>(null);
        const [isOpen, setIsOpen] = useState(initialOpen);

        useOutsideClick(ref, isOpen, setIsOpen, onOutsideClick);

        return React.createElement(
            'div',
            null,
            React.createElement(
                'div',
                { ref, 'data-testid': 'inside' },
                'Inside'
            ),
            React.createElement('div', { 'data-testid': 'outside' }, 'Outside'),
            React.createElement(
                'div',
                { 'data-testid': 'status' },
                String(isOpen)
            )
        );
    };

    it('calls setIsOpen(false) and onOutsideClick when clicking outside', () => {
        const handleOutsideClick = jest.fn();
        const { getByTestId } = render(
            React.createElement(TestComponent, {
                onOutsideClick: handleOutsideClick,
            })
        );

        const outside = getByTestId('outside');
        const status = getByTestId('status');

        fireEvent.mouseDown(outside);
        fireEvent.mouseUp(outside);

        expect(status.textContent).toBe('false');
        expect(handleOutsideClick).toHaveBeenCalled();
    });

    it('does NOT call setIsOpen(false) when clicking inside', () => {
        const handleOutsideClick = jest.fn();
        const { getByTestId } = render(
            React.createElement(TestComponent, {
                onOutsideClick: handleOutsideClick,
            })
        );

        const inside = getByTestId('inside');
        const status = getByTestId('status');

        fireEvent.mouseDown(inside);
        fireEvent.mouseUp(inside);

        expect(status.textContent).toBe('true');
        expect(handleOutsideClick).not.toHaveBeenCalled();
    });

    it('removes event listeners on unmount', () => {
        const addSpy = jest.spyOn(document, 'addEventListener');
        const removeSpy = jest.spyOn(document, 'removeEventListener');

        const { unmount } = render(
            React.createElement(TestComponent, { onOutsideClick: jest.fn() })
        );

        expect(addSpy).toHaveBeenCalledWith('mousedown', expect.any(Function), {
            capture: true,
        });

        unmount();

        expect(removeSpy).toHaveBeenCalledWith(
            'mousedown',
            expect.any(Function),
            { capture: true }
        );
        expect(removeSpy).toHaveBeenCalledWith(
            'mouseup',
            expect.any(Function),
            { capture: true }
        );
    });
});
