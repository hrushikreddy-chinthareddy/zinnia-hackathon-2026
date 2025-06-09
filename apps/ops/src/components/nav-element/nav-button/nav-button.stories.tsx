import '@deps/styles/styles.css';
import { Meta } from '@storybook/react';

import NavButton, { NavButtonProps } from './nav-button';

const meta: Meta<typeof NavButton> = {
    title: 'Components/NavButton',
    component: NavButton,
    args: {
        children: 'NavButton',
        type: 'button',
    },
    argTypes: {
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
