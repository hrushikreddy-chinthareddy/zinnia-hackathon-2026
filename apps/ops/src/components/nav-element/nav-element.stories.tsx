import '@deps/styles/styles.css';
import { Meta } from '@storybook/react';

import NavElement from '@deps/components/nav-element/nav-element';
import classes, { NavElementSize, NavElementVariant, NavElementType } from '@deps/components/nav-element/nav-element';

import NavButton from './nav-button/nav-button';
import NavLink from './nav-link/nav-link';

const meta: Meta<typeof NavElement> = {
    title: 'Components/NavElement',
    component: NavElement,
    args: {
        children: 'NavElement',
    },
    argTypes: {
        variant: {
            options: [NavElementVariant.Default, NavElementVariant.Primary, NavElementVariant.Text],
            control: 'select',
        },
        size: {
            options: [NavElementSize.Default, NavElementSize.ExtraSmall, NavElementSize.Small],
            control: 'select',
        },
        startIcon: {
            table: {
                disable: true,
            },
        },
        type: {
            options: [NavElementType.Button, NavElementType.Link],
        },
        disabled: {
            control: 'boolean',
        },
    },
};

export const NavElementComponent = (args: any) => {
    return args.type === NavElementType.Button ? (
        <NavButton onClick={() => console.log('NavButton clicked')} className={classes} {...args} />
    ) : (
        <NavLink onClick={() => console.log('NavLink clicked')} className={classes} {...args} />
    );
};
export default meta;
