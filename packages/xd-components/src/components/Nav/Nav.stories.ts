import type { Meta, StoryObj } from '@storybook/react';
import { Nav } from './Nav';
import { mockNavGroups } from '../../stories/mocks';

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
