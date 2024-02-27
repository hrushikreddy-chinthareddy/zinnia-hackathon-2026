import { Meta, StoryObj } from '@storybook/react';

import { AllocationColorBar } from '../../components/allocation-color-bar';

export default {
  title: 'Components/AllocationColorBar',
  component: AllocationColorBar,
} as Meta<typeof AllocationColorBar>;

export const AllocationColorBarBeneficiary: StoryObj<
  typeof AllocationColorBar
> = {
  args: {
    type: 'beneficiary',
    allocations: Array(11).fill(9),
  },
};

export const AllocationColorBarContingent: StoryObj<typeof AllocationColorBar> =
  {
    args: {
      type: 'contingent',
      allocations: Array(7).fill(14),
    },
  };
