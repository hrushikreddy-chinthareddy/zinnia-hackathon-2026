import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ReactElement } from 'react';

import { MenuContextualItemProps } from '../menu-contextual-item/menu-contextual-item';

export interface MenuContextualLabelProps {
    children: ReactElement<MenuContextualItemProps> | ReactElement<MenuContextualItemProps>[];
    label: string;
}

const MenuContextualLabel = ({ label, children }: MenuContextualLabelProps) => {
    return (
        <DropdownMenu.Label className="flex w-full flex-col gap-4">
            <p className="flex items-start gap-2 self-stretch px-4 font-primary text-base font-medium text-white">{label}</p>
            <ul className="flex flex-col gap-4">{children}</ul>
        </DropdownMenu.Label>
    );
};

export default MenuContextualLabel;
