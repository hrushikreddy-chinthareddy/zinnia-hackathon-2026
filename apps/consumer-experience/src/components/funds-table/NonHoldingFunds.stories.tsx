import type { Meta, StoryObj } from '@storybook/react';

import { NonHoldingFunds } from './NonHoldingFunds';

export default {
  title: 'Components/FundsTable/NonHoldingFunds',
  component: NonHoldingFunds,
  args: { href: '#', text: 'NonHoldingFunds' },
} as Meta<typeof NonHoldingFunds>;

type StoryType = StoryObj<typeof NonHoldingFunds>;

export const Default: StoryType = {
  args: {},
};
