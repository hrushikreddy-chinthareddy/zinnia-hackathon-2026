import { Meta, StoryObj } from '@storybook/react';

import ResponsivePadding, { ResponsivePaddingProps } from './responsive-padding';

type StoryType = StoryObj<ResponsivePaddingProps>;

const meta = {
    title: 'Components/ResponsivePadding',
    component: ResponsivePadding,
    argTypes: {
        Tag: {
            control: 'inline-radio',
            options: ['section', 'div'],
        },
    },
} as Meta<typeof ResponsivePadding>;

export const Default: StoryType = {
    render: ({ ...args }) => <ResponsivePadding {...args}>Responsive padding</ResponsivePadding>,
    args: {
        className: 'border-2 border-primary',
        Tag: 'section',
    },
};

export default meta;
