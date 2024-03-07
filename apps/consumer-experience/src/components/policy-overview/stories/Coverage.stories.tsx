import { Meta, StoryObj } from '@storybook/react';

import { policyOverviewData } from '@/services/mocks/policy';
import { policyRiders } from '@/services/mocks/policy-riders';
import { PolicyRiders } from '@/types/riders';

import { Coverage, Props } from '../Coverage';

const meta: Meta<typeof Coverage> = {
  component: Coverage,
  title: 'Components/PolicyOverview/Coverage',
  args: {
    totalCoverageAmount: policyOverviewData.coverage.totalCoverageAmount,
    policyStartDate: policyOverviewData.coverage.policyStartDate,
    maturityDate: policyOverviewData.coverage.maturityDate,
    beneficiaryCount: policyOverviewData.coverage.beneficiaryCount,
    riders: [policyRiders[0] as unknown as PolicyRiders],
  },
  tags: ['autodocs'],
};

export default meta;
type StoryType = StoryObj<Props>;

export const Default: StoryType = {};

export const ZeroValues: StoryType = {
  args: {
    totalCoverageAmount: 0,
    policyStartDate: '',
    maturityDate: '',
    beneficiaryCount: 0,
  },
};

export const APIFailed: StoryType = {
  args: {
    totalCoverageAmount: undefined,
    policyStartDate: undefined,
    maturityDate: undefined,
    beneficiaryCount: undefined,
    riders: undefined,
  },
};

export const NoBenes: StoryType = {
  args: {
    beneficiaryCount: 0,
  },
};

export const NoRiders: StoryType = {
  args: {
    riders: [],
  },
};
