import { mockNavGroups } from './mocks';
import { Nav } from './Nav';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Nav> = {
    title: 'Components/Nav',
    component: Nav,
    parameters: {
        layout: 'centered',
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        navGroups: mockNavGroups,
        activeNavItem: 'home',
    },
};

export const NoSearch: Story = {
    args: {
        navGroups: mockNavGroups,
        activeNavItem: 'home',
        displaySearch: false,
    },
};
