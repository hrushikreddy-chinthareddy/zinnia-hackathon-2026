import { Meta } from '@storybook/react';

import MenuContextual from '@deps/components/menu-contextual/menu-contextual';
import MenuContextualItem from '@deps/components/menu-contextual/menu-contextual-item/menu-contextual-item';
import MenuContextualLabel from '@deps/components/menu-contextual/menu-contextual-label/menu-contextual-label';
import { ReactComponent as ChevronDown } from '@deps/styles/elements/icons/arrow/chevron-down.svg';
import { ReactComponent as TrashIcon } from '@deps/styles/elements/icons/icons_outlined/trash.svg';

import '@deps/styles/styles.css';

export default {
    title: 'Components/MenuContextual',
    component: MenuContextual,
    parameters: {
        layout: 'centered',
    },
} as Meta<typeof MenuContextual>;

const Button = () => {
    return (
        <div className="pointer flex items-center justify-center gap-1 text-secondary hover:text-secondary-dark">
            <p className="font-primary text-md font-semibold hover:underline hover:decoration-2 hover:underline-offset-[5px]">
                Quick actions
            </p>
            <ChevronDown
                className="simple-transition text-secondary group-data-[state=open]:rotate-180"
                height={16}
                width={16}
            />
        </div>
    );
};

export const MenuContextualStory = () => {
    return (
        <MenuContextual trigger={<Button />}>
            <MenuContextualLabel label="Section 1">
                <MenuContextualItem
                    content="Input selection 1"
                    href="/"
                    icon={<TrashIcon height={20} width={20} />}
                />
                <MenuContextualItem
                    content="Input selection 2"
                    href="/"
                    icon={<TrashIcon height={20} width={20} />}
                />
            </MenuContextualLabel>
            <MenuContextualLabel label="Section 2">
                <MenuContextualItem
                    content="Input selection 3"
                    href="/"
                    icon={<TrashIcon height={20} width={20} />}
                />
                <MenuContextualItem
                    content="Input selection 4"
                    href="/"
                    icon={<TrashIcon height={20} width={20} />}
                />
            </MenuContextualLabel>
        </MenuContextual>
    );
};
