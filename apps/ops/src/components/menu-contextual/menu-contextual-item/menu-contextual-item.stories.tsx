import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { Meta } from '@storybook/react';

import MenuContextualItem, {
    MenuContextualItemProps,
} from '@deps/components/menu-contextual/menu-contextual-item/menu-contextual-item';
import { ReactComponent as Logout } from '@deps/styles/elements/icons/actions/logout.svg';

import '@deps/styles/styles.css';

export default {
    title: 'Components/MenuContextual',
    component: MenuContextualItem,
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
        content: 'Sample item',
    },
} as Meta<typeof MenuContextualItem>;

export const MenuContextualItemStory = ({
    content,
}: MenuContextualItemProps) => {
    return (
        <NavigationMenu.Root className="list-none">
            <MenuContextualItem
                content={content}
                href="/"
                icon={<Logout height={20} width={20} />}
            />
        </NavigationMenu.Root>
    );
};
