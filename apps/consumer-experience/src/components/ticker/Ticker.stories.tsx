import { Meta, StoryObj } from '@storybook/react';

import { Ticker } from './Ticker';

export default {
  title: 'Components/Ticker',
  component: Ticker,
  tags: ['autodocs'],
} as Meta<typeof Ticker>;

export const Default: StoryObj<typeof Ticker> = {
  args: {
    value: 0,
  },
};

export const Positive: StoryObj<typeof Ticker> = {
  args: {
    value: 250.53,
  },
};

export const Negative: StoryObj<typeof Ticker> = {
  args: {
    value: -250.53,
  },
};

export const WithSubtext: StoryObj<typeof Ticker> = {
  args: {
    value: -250.53,
    subtext: 'this month',
  },
};

export const UndefinedValue: StoryObj<typeof Ticker> = {
  args: {
    value: undefined,
    subtext: 'this month',
  },
};
