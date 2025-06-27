import { Dispatch, RefObject, SetStateAction, useEffect } from 'react';

export const useOutsideClick = (
    ref: RefObject<HTMLElement>,
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>> | ((isOpen: boolean) => void),
    onOutsideClick?: () => void,
    useCapture = true
) => {
    useEffect(() => {
        const onMouseDown = (e: MouseEvent) => {
            const isDescendantOfRoot =
                ref.current && ref.current.contains(e.target as Node);
            if (!isDescendantOfRoot) {
                document.addEventListener('mouseup', onMouseUp, {
                    capture: useCapture,
                });
            }
        };

        const onMouseUp = (e: MouseEvent) => {
            const isDescendantOfRoot =
                ref.current && ref.current.contains(e.target as Node);
            document.removeEventListener('mouseup', onMouseUp, {
                capture: useCapture,
            });

            if (!isDescendantOfRoot) {
                setIsOpen(false);
            }

            if (onOutsideClick) {
                onOutsideClick();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', onMouseDown, {
                capture: useCapture,
            });
        }

        return () => {
            document.removeEventListener('mousedown', onMouseDown, {
                capture: useCapture,
            });
            document.removeEventListener('mouseup', onMouseUp, {
                capture: useCapture,
            });
        };
    }, [isOpen, useCapture, onOutsideClick, setIsOpen]);

    return isOpen;
};
