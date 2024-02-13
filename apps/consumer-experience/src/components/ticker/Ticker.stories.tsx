import { Meta, StoryObj } from '@storybook/react';

import { Ticker } from './Ticker';

const meta: Meta<typeof Ticker> = {
  component: Ticker,
  title: 'Components/Ticker',
  tags: ['autodocs'],
};

export default meta;

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
