import { Meta, StoryObj } from '@storybook/react';

import { PolicyStatus } from '@/types/policy';

import { policyOverviewData } from '../../../services/mocks/policy';
import { AccountValue, Props } from '../AccountValue';

const meta: Meta<typeof AccountValue> = {
  component: AccountValue,
  title: 'Components/PolicyOverview/AccountValue',

  tags: ['autodocs'],
};

export default meta;
type StoryType = StoryObj<Props>;

export const Default: StoryType = {
  args: {
    totalFundValue: policyOverviewData.accountValue.totalFundValue,
    timestamp: policyOverviewData.accountValue.timestamp,
    valueChange: policyOverviewData.accountValue.valueChange,
    policyStatus: PolicyStatus.Active,
  },
};

export const ZeroValues: StoryType = {
  args: {
    totalFundValue: 0,
    valueChange: 0,
  },
};

export const MainValueNull: StoryType = {
  args: {
    totalFundValue: null,
    timestamp: policyOverviewData.accountValue.timestamp,
    valueChange: null,
    policyStatus: PolicyStatus.Active,
  },
};

export const APIFailed: StoryType = {
  args: {},
};

// TODO: add other policy statuses here
export const PolicyLapsed: StoryType = {
  args: {
    totalFundValue: policyOverviewData.accountValue.totalFundValue,
    timestamp: policyOverviewData.accountValue.timestamp,
    valueChange: policyOverviewData.accountValue.valueChange,
    policyStatus: PolicyStatus.Lapse,
  },
};
