import { FundAccountTypeEnum } from '@zinnia/api-types/types/funds';

import type { Meta, StoryObj } from '@storybook/nextjs';

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

export const Loading: StoryType = {
  args: { isLoading: true, funds: [] },
};

export const EverlyLoading: StoryType = {
  parameters: {
    theme: 'everly',
  },
  args: { isLoading: true, funds: [] },
};

export const WellabeLoading: StoryType = {
  parameters: {
    theme: 'wellabe',
  },
  args: { isLoading: true, funds: [] },
};
