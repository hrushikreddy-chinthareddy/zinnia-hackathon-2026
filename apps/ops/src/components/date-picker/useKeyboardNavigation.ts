import { useState, useRef, useCallback, useEffect } from 'react';

export const useKeyboardNavigation = (
    totalItems: number,
    columns: number,
    onSelect: (index: number) => void,
    onEscape?: () => void,
    isDisabled?: (index: number) => boolean
) => {
    const [focusedIndex, setFocusedIndex] = useState(0);

    useEffect(() => {
        if (isDisabled && isDisabled(focusedIndex)) {
            for (let i = 0; i < totalItems; i++) {
                if (!isDisabled(i)) {
                    setFocusedIndex(i);
                    break;
                }
            }
        }
    }, [isDisabled, focusedIndex, totalItems]);
    const itemRefs = useRef<(HTMLElement | null)[]>([]);

    const setItemRef = useCallback(
        (index: number) => (element: HTMLElement | null) => {
            itemRefs.current[index] = element;
        },
        []
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            const findNextEnabledIndex = (
                startIndex: number,
                direction: number
            ): number => {
                if (!isDisabled) return startIndex;

                let currentIndex = startIndex;
                let attempts = 0;

                while (attempts < totalItems) {
                    if (!isDisabled(currentIndex)) {
                        return currentIndex;
                    }

                    currentIndex += direction;
                    if (currentIndex < 0) currentIndex = totalItems - 1;
                    if (currentIndex >= totalItems) currentIndex = 0;
                    attempts++;
                }

                return startIndex;
            };
            const rows = Math.ceil(totalItems / columns);
            let newIndex = focusedIndex;

            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    newIndex = focusedIndex - columns;
                    if (newIndex < 0) {
                        newIndex = focusedIndex + columns * (rows - 1);
                        if (newIndex >= totalItems) {
                            newIndex = totalItems - 1;
                        }
                    }
                    newIndex = findNextEnabledIndex(newIndex, -columns);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    newIndex = focusedIndex + columns;
                    if (newIndex >= totalItems) {
                        newIndex = focusedIndex % columns;
                    }
                    newIndex = findNextEnabledIndex(newIndex, columns);
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    newIndex = focusedIndex - 1;
                    if (newIndex < 0) {
                        newIndex = totalItems - 1;
                    }
                    newIndex = findNextEnabledIndex(newIndex, -1);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    newIndex = focusedIndex + 1;
                    if (newIndex >= totalItems) {
                        newIndex = 0;
                    }
                    newIndex = findNextEnabledIndex(newIndex, 1);
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    onSelect(focusedIndex);
                    return;
                case 'Escape':
                    e.preventDefault();
                    e.stopPropagation();
                    if (onEscape) {
                        onEscape();
                    }
                    return;
            }

            setFocusedIndex(newIndex);
        },
        [focusedIndex, totalItems, columns, onSelect, onEscape, isDisabled]
    );

    useEffect(() => {
        if (itemRefs.current[focusedIndex]) {
            itemRefs.current[focusedIndex]?.focus();
        }
    }, [focusedIndex]);

    return {
        focusedIndex,
        setFocusedIndex,
        setItemRef,
        handleKeyDown,
    };
};
