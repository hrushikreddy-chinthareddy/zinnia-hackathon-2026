import { Meta, StoryObj } from '@storybook/react';

import { AllocationColorBar } from '../../components/allocation-color-bar';

const meta: Meta <typeof AllocationColorBar>= {
  title: 'Components/AllocationColorBar',
  component: AllocationColorBar,
  tags: ['autodocs']
};

export default meta;
export const AllocationColorBarBeneficiary: StoryObj<
  typeof AllocationColorBar
> = {
  args: {
    type: 'primary',
    allocations: Array(11).fill(9),
  }
};

export const AllocationColorBarContingent: StoryObj<typeof AllocationColorBar> =
  {
    args: {
      type: 'contingent',
      allocations: Array(7).fill(14),
    },
  };
