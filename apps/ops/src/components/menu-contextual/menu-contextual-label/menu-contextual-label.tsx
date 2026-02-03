import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useId } from 'react';

export interface MenuContextualLabelProps {
    children: React.ReactNode;
    label: string;

    hideLabel?: boolean;
}

const MenuContextualLabel = ({
    label,
    children,
    hideLabel = false,
}: MenuContextualLabelProps) => {
    const labelId = useId();

    return (
        <DropdownMenu.Group
            className="flex w-full flex-col gap-4"
            aria-labelledby={labelId}
        >
            <DropdownMenu.Label
                id={labelId}
                className={`flex items-start gap-2 self-stretch px-4 font-primary text-base font-medium text-white ${
                    hideLabel ? 'sr-only' : ''
                }`}
            >
                {label}
            </DropdownMenu.Label>
            <div className="flex flex-col gap-4">{children}</div>
        </DropdownMenu.Group>
    );
};

export default MenuContextualLabel;
