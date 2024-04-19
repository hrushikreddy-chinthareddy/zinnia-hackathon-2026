import { Meta, StoryObj } from '@storybook/react';

import { UpcomingPremium } from '../UpcomingPremium';

const meta: Meta<typeof UpcomingPremium> = {
  component: UpcomingPremium,
  title: 'Components/PolicyOverview/UpcomingPremium',
  args: {},
  tags: ['autodocs'],
};

export default meta;
type StoryType = StoryObj;

export const Default: StoryType = {};

export const ZeroValues = {
  args: {},
};

export const LapsedStatus = {
  args: {},
};
