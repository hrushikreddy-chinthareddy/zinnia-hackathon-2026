import type { Meta, StoryObj } from '@storybook/react';

import { HoldingFunds } from './HoldingFunds';

export default {
  title: 'Components/FundsTable/HoldingFunds',
  component: HoldingFunds,
  args: { href: '#', text: 'HoldingFunds' },
} as Meta<typeof HoldingFunds>;

type StoryType = StoryObj<typeof HoldingFunds>;

export const Default: StoryType = {
  args: {},
};
