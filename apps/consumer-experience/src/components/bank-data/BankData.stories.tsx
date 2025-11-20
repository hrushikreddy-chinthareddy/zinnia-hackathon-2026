import { Meta, StoryObj } from '@storybook/nextjs';

import { AccountType } from '@zinnia/api-types/types/sor';

import { BankData } from './BankData';
import { BankDetail } from '../person-data/types';

const meta: Meta<typeof BankData> = {
  component: BankData,
  title: 'Components/BankData',
};

export default meta;

export const DefaultBankData: StoryObj<BankDetail> = {
  args: {
    accountNumber: '1234',
    accountType: AccountType.CHECKING,
    routingNumber: '1234',
    branchName: 'Bank of America',
    nameOnAccount: 'Flora Anderson',
  },
};
