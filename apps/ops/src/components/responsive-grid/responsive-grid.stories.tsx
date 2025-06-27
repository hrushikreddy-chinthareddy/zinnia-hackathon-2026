import { Meta, StoryObj } from '@storybook/react';

import { generateFields } from '@deps/utils/mock/mockPolicyExtrasFields';
import { numberOfFieldsArgTypes } from '@deps/utils/storybook';

import ResponsiveGrid, { ResponsiveGridProps } from './responsive-grid';

type StoryProps = ResponsiveGridProps & {
    numberOfFields: number;
    rainbow: boolean;
};

type StoryType = StoryObj<StoryProps>;

const meta = {
    title: 'Components/ResponsiveGrid',
    component: ResponsiveGrid,
    argTypes: {
        ...numberOfFieldsArgTypes,
        className: {
            control: 'text',
        },
        Tag: {
            control: 'inline-radio',
            options: ['span', 'div', 'ul'],
        },
        columnGap: {
            control: 'text',
        },
        rowGap: {
            control: 'text',
        },
        maxColumns: {
            control: {
                type: 'range',
                min: 1,
                max: 12,
            },
        },
        rainbow: {
            control: 'boolean',
        },
    },
} as Meta<typeof ResponsiveGrid>;

export const Default: StoryType = {
    render: ({ numberOfFields, rainbow, ...args }) => (
        <ResponsiveGrid {...args}>
            {generateFields(numberOfFields, rainbow)}
        </ResponsiveGrid>
    ),
    args: {
        numberOfFields: 12,
        maxColumns: 4,
    },
};

export const NeverWrapText = {
    render: Default.render,
    args: {
        ...Default.args,
        neverWrapText: true,
    },
};

export const RainbowColors = {
    render: Default.render,
    args: {
        ...Default.args,
        rainbow: true,
    },
};

export const ManymaxColumns = {
    render: Default.render,
    args: {
        ...Default.args,
        maxColumns: 12,
    },
};

export const CustomClassName = {
    render: Default.render,
    args: {
        ...Default.args,
        className: 'bg-orange-600',
    },
};

export const NoGaps = {
    render: Default.render,
    args: {
        ...Default.args,
        columnGap: '0px',
        rowGap: '0px',
        rainbow: true,
    },
};

export default meta;
