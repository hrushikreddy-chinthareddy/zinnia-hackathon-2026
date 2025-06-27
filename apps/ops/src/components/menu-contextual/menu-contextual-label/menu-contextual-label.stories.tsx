import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { Meta } from '@storybook/react';

import MenuContextualLabel, {
    MenuContextualLabelProps,
} from '@deps/components/menu-contextual/menu-contextual-label/menu-contextual-label';

import '@deps/styles/styles.css';

export default {
    title: 'Components/MenuContextual',
    component: MenuContextualLabel,
    parameters: {
        layout: 'centered',
    },
    decorators: [
        (Story) => (
            <div className="w-fit rounded-sm bg-gray-900">
                <Story />
            </div>
        ),
    ],
    args: {
        label: 'Section Label',
    },
} as Meta<typeof MenuContextualLabel>;

export const MenuContextualLabelStory = ({
    label,
}: MenuContextualLabelProps) => {
    const props = {
        label,
        // intentionally omitting children for storybook
    } as MenuContextualLabelProps;
    return (
        <NavigationMenu.Root>
            <MenuContextualLabel {...props} />
        </NavigationMenu.Root>
    );
};
