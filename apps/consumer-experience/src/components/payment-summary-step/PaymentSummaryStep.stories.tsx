import { Meta, StoryObj } from '@storybook/react';

import { PaymentSummaryStep } from './PaymentSummaryStep';

const meta: Meta<typeof PaymentSummaryStep> = {
  component: PaymentSummaryStep,
  title: 'Components/PaymentSummaryStep',
  args: {},
  tags: ['autodocs'],
};

export default meta;

export const Default: StoryObj<typeof PaymentSummaryStep> = {
  args: {
    transactionSummary: [
      {
        label: 'Submitted Amount',
        value: 10000,
        tooltipText: '',
      },
      {
        label: 'Fees',
        value: 450,
        tooltipText: 'Fees appended by seller',
      },
    ],
  },
};

export const ExtendedAmount: StoryObj<typeof PaymentSummaryStep> = {
  args: {
    transactionSummary: [
      {
        label: 'Submitted Amount',
        value: 10000000000,
        tooltipText: '',
      },
      {
        label: 'Fees',
        value: 4500,
        tooltipText: 'Fees appended by seller',
      },
      {
        label: 'Taxes',
        value: 1500,
        tooltipText: 'Taxes applied by agents',
      },
      {
        label: 'Misc',
        value: 8150,
        tooltipText: 'Miscellaneous fees and charges',
      },
    ],
  },
};
