import { Meta, StoryObj } from '@storybook/react';

import { policyOverviewData } from '@/services/mocks/policy';
import { PolicyStatus } from '@/types/policy';

import { Props, UpcomingPremium } from '../UpcomingPremium';

const meta: Meta<typeof UpcomingPremium> = {
  component: UpcomingPremium,
  title: 'Components/PolicyOverview/UpcomingPremium',
  args: {
    amount: policyOverviewData.upcomingPremium.amount,
    nextActivityDate: policyOverviewData.upcomingPremium.nextActivityDate,
    policyStatus: PolicyStatus.Active,
  },
  tags: ['autodocs'],
};

export default meta;
type StoryType = StoryObj<Props>;

export const Default: StoryType = {};

export const ZeroValues = {
  args: {
    amount: 0,
    nextActivityDate: 0,
    policyStatus: PolicyStatus.Active,
  },
};

export const LapsedStatus = {
  args: {
    policyStatus: PolicyStatus.Lapse,
  },
};
