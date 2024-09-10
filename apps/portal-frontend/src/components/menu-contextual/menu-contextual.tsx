import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import clsx from 'clsx';
import { ReactNode, useCallback, useState } from 'react';

export interface MenuContextualProps {
    children: ReactNode;
    trigger: ReactNode;
    triggerAsChild?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const MenuContextual = ({ children, trigger, triggerAsChild = false, onOpenChange = () => {} }: MenuContextualProps) => {
    const [align, setAlign] = useState<DropdownMenu.DropdownMenuContentProps['align']>('end');
    const [side, setSide] = useState<DropdownMenu.DropdownMenuContentProps['side']>('bottom');

    const triggerRef = useCallback((node: HTMLButtonElement) => {
        if (node !== null && node.dataset.state === 'open') {
            const { bottom, left, right, top } = node.getBoundingClientRect();

            setSide(Math.floor((top + bottom) / 2) > Math.floor(window.innerHeight / 2) ? 'top' : 'bottom');
            setAlign(Math.floor((left + right) / 2) > Math.floor(window.innerWidth / 2) ? 'end' : 'start');
        }
    }, []);

    const placementClasses = clsx({
        'right-full': align === 'end',
        'left-full': align === 'start',
        'top-full mt-1': side === 'bottom',
        'bottom-full mb-1': side === 'top',
    });

    return (
        <DropdownMenu.Root
            modal={false}
            onOpenChange={(open: boolean) => {
                onOpenChange(open);
            }}
        >
            <DropdownMenu.Trigger asChild={triggerAsChild} className="default-focus group block rounded" ref={triggerRef}>
                {trigger}
            </DropdownMenu.Trigger>

            <DropdownMenu.Content
                className={clsx(
                    'absolute z-10 flex max-w-[320px] flex-col items-start justify-center gap-2 rounded bg-gray-900 py-4 shadow-elevation-light-16 data-[state=closed]:animate-fadeOut data-[state=open]:animate-fadeIn',
                    placementClasses
                )}
                side={side}
                align={align}
            >
                <ul className="flex flex-col items-start gap-4 rounded-md">{children}</ul>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    );
};

export default MenuContextual;
