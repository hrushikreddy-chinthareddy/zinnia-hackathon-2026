import '@deps/styles/styles.css';
import { Meta, StoryObj } from '@storybook/react';

import NavElement, {
    NavElementSize,
    NavElementVariant,
    NavElementType,
} from '@deps/components/nav-element/nav-element';

const meta: Meta<typeof NavElement> = {
    title: 'Components/NavElement',
    component: NavElement,
    args: {
        children: 'NavElement',
    },
    argTypes: {
        variant: {
            options: [
                NavElementVariant.Default,
                NavElementVariant.Primary,
                NavElementVariant.Text,
            ],
            control: 'select',
        },
        size: {
            options: [NavElementSize.Default, NavElementSize.Small],
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

export const NavElementComponent: StoryObj<typeof meta> = {
    render: ({ type, className, ...restArgs }) => {
        const handleClick = () => {
            console.log(`Nav${type}clicked`);
        };
        return (
            <NavElement
                type={type}
                className={className}
                {...restArgs}
                onClick={handleClick}
            />
        );
    },
};

export default meta;
