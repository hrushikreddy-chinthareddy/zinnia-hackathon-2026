import { Meta, StoryObj } from '@storybook/react';

import { BankData } from './BankData';

const meta: Meta<typeof BankData> = {
  component: BankData,
  title: 'Components/BankData',
};

export default meta;

export const DefaultBankData: StoryObj<typeof BankData> = {
  args: {
    accountNumber: 1234,
    accountType: 'Checking',
    routingNumber: 121000358,
    bankName: 'Bank of America',
    nameOnAccount: 'Flora Anderson',
    title: 'Banking details',
  },
};
