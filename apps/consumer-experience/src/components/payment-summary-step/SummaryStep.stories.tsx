import { Meta, StoryObj } from '@storybook/react';

import { SummaryStep } from './SummaryStep';

const meta: Meta<typeof SummaryStep> = {
  component: SummaryStep,
  title: 'Components/SummaryStep',
  args: {},
  tags: ['autodocs'],
};

export default meta;

export const Default: StoryObj<typeof SummaryStep> = {
  args: {
    payorName: 'Nelson Williams',
    effectiveDate: '2022-01-01',
    bankDetails: {
      accountNumber: '3601234567890',
      branchName: 'capital one, inc.',
    },
    submittedAmount: 10000,
    fees: 600,
    feesTooltipText: 'Fees included in submitted amount',
  },
};

export const ExtendedAmount: StoryObj<typeof SummaryStep> = {
  args: {
    payorName: 'Nelson Williams',
    effectiveDate: '2022-01-01',
    bankDetails: {
      accountNumber: '3601234567890',
      branchName: 'capital one, inc.',
    },
    submittedAmount: 100000000,
    fees: 600,
    feesTooltipText: 'Fees included in submitted amount',
  },
};
