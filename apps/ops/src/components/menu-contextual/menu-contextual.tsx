import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import clsx from 'clsx';
import { ReactNode, useCallback, useRef, useState } from 'react';

import styles from './menu-contextual.module.css';
import { calculateMenuPlacement } from './menu-placement';

export interface MenuContextualProps {
    children: ReactNode;
    trigger: ReactNode;
    triggerAsChild?: boolean;
    onOpenChange?: (open: boolean) => void;
    'data-testid'?: string;
    role?: string;
}

export const MenuContextual = ({
    children,
    trigger,
    triggerAsChild = false,
    onOpenChange = () => {},
    'data-testid': dataTestId,
    role,
}: MenuContextualProps) => {
    const [align, setAlign] =
        useState<DropdownMenu.DropdownMenuContentProps['align']>('end');
    const [side, setSide] =
        useState<DropdownMenu.DropdownMenuContentProps['side']>('bottom');
    const [open, setOpen] = useState(false);
    const menuContentRef = useRef<HTMLDivElement>(null);

    const calculateAndSetPlacement = useCallback(
        (triggerElement: HTMLButtonElement) => {
            const triggerRect = triggerElement.getBoundingClientRect();
            const viewport = {
                scrollY: window.scrollY,
                innerHeight: window.innerHeight,
                innerWidth: window.innerWidth,
            };

            let dimensions = { height: 300, width: 320 };

            if (menuContentRef.current) {
                const menuRect = menuContentRef.current.getBoundingClientRect();
                dimensions = {
                    height: menuRect.height || 300,
                    width: menuRect.width || 320,
                };
            }

            const placement = calculateMenuPlacement(
                triggerRect,
                viewport,
                dimensions
            );
            setSide(placement.side);
            setAlign(placement.align);
        },
        []
    );

    const triggerRef = useCallback(
        (node: HTMLButtonElement) => {
            if (!node?.dataset.state || node.dataset.state !== 'open') return;
            calculateAndSetPlacement(node);
        },
        [calculateAndSetPlacement]
    );

    const handleOpenChange = useCallback(
        (isOpen: boolean) => {
            setOpen(isOpen);
            onOpenChange(isOpen);
        },
        [onOpenChange]
    );

    const placementClasses = clsx({
        'right-full': align === 'end' && (side === 'top' || side === 'bottom'),
        'left-full': align === 'start' && (side === 'top' || side === 'bottom'),
        'top-full mt-1': side === 'bottom',
        'bottom-full mb-1': side === 'top',
        'right-full ml-1': side === 'left',
    });

    return (
        <DropdownMenu.Root
            modal={false}
            onOpenChange={handleOpenChange}
            open={open}
        >
            <DropdownMenu.Trigger
                asChild={triggerAsChild}
                className={triggerAsChild ? '' : styles.trigger}
                data-testid={dataTestId}
                ref={triggerRef}
            >
                {trigger}
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    className={clsx(
                        'absolute z-[300] max-w-[320px] sm:max-h-[65vh] md:max-h-[40vh] overflow-y-auto rounded bg-gray-900 shadow-elevation-light-16 data-[state=closed]:animate-fadeOut data-[state=open]:animate-fadeIn',
                        placementClasses
                    )}
                    side={side}
                    align={align}
                    onClick={() => setOpen(false)}
                    onEscapeKeyDown={() => setOpen(false)}
                    onInteractOutside={() => setOpen(false)}
                    role={role ?? 'menu'}
                >
                    <div className="flex flex-col items-start gap-4 rounded-md py-4">
                        {children}
                    </div>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
};

export default MenuContextual;
