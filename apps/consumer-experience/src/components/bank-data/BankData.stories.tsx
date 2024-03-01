import { Meta, StoryObj } from '@storybook/react';

import { BankData, BankDataProps } from './BankData';

const meta: Meta<typeof BankData> = {
  component: BankData,
  title: 'Components/BankData',
};

export default meta;

export const DefaultBankData: StoryObj<BankDataProps> = {
  args: {
    accountNumber: 1234,
    accountType: 'Checking',
    routingNumber: '1234',
    bankName: 'Bank of America',
    nameOnAccount: 'Flora Anderson',
    title: 'Banking details',
  },
};
