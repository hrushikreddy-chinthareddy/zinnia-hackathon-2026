import '@deps/styles/styles.css';
import { Meta } from '@storybook/react';

import { NavElementSize, NavElementVariant } from '@deps/components/nav-element/nav-element';

import NavButton, { NavButtonProps } from './nav-button';

const meta: Meta<typeof NavButton> = {
    title: 'Components/NavButton',
    component: NavButton,
    args: {
        children: 'NavButton',
        type: 'button',
    },
    argTypes: {
        variant: {
            options: [NavElementVariant.Default, NavElementVariant.Primary, NavElementVariant.Text],
        },
        size: {
            options: [NavElementSize.Default, NavElementSize.ExtraSmall, NavElementSize.Small],
        },
        startIcon: {
            table: {
                disable: true,
            },
        },
        type: {
            table: {
                disable: true,
            },
        },
    },
};

export default meta;

export const NavButtonComponent = (args: NavButtonProps) => (
    <NavButton onClick={() => console.log('NavButton clicked')} {...args}>
        {args.children}
    </NavButton>
);
