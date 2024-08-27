import { FundAccountTypeEnum } from '@zinnia/api-types/types/funds';

import type { Meta, StoryObj } from '@storybook/react';

import { mockIULFundResponse } from '@/services/mocks/funds';

import { HoldingFunds } from './HoldingFunds';

export default {
  title: 'Components/FundsTable/HoldingFunds',
  component: HoldingFunds,
  args: {
    funds: mockIULFundResponse.filter(
      fund => fund.fundAccountType === FundAccountTypeEnum.HOLDING
    ),
  },
} as Meta<typeof HoldingFunds>;

type StoryType = StoryObj<typeof HoldingFunds>;

export const Default: StoryType = {
  args: {},
};
