import '@deps/styles/styles.css';
import { Meta } from '@storybook/react';

import NavLink, { NavLinkProps } from './nav-link';
import { NavElementVariant, NavElementSize } from '../nav-element';

const meta: Meta<typeof NavLink> = {
    title: 'Components/NavLink',
    component: NavLink,
    args: {
        children: 'NavLink',
        type: 'link',
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
        href: {
            table: {
                disable: true,
            },
        },
        isNewPage: {
            table: {
                disable: true,
            },
        },
        disabled: {
            control: 'boolean',
        },
    },
};

export const NavLinkComponent = (args: NavLinkProps) => (
    <NavLink onClick={() => console.log('NavLink clicked')} {...args}>
        {args.children}
    </NavLink>
);

export default meta;
