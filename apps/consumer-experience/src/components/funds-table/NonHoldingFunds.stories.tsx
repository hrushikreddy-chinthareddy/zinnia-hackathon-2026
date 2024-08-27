import { FundAccountTypeEnum } from '@zinnia/api-types/types/funds';

import type { Meta, StoryObj } from '@storybook/react';

import { mockIULFundResponse } from '@/services/mocks/funds';

import { NonHoldingFunds } from './NonHoldingFunds';

export default {
  title: 'Components/FundsTable/NonHoldingFunds',
  component: NonHoldingFunds,
  args: {
    funds: mockIULFundResponse.filter(
      fund => fund.fundAccountType !== FundAccountTypeEnum.HOLDING
    ),
  },
} as Meta<typeof NonHoldingFunds>;

type StoryType = StoryObj<typeof NonHoldingFunds>;

export const Default: StoryType = {
  args: {},
};
