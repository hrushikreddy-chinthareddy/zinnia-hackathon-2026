import { Meta, StoryObj } from '@storybook/react';

import { Ticker, Props } from './Ticker';

const meta: Meta<typeof Ticker> = {
  component: Ticker,
  title: 'Components/Ticker',
  tags: ['autodocs'],
};

export default meta;

export const Default: StoryObj<Props> = {
  args: {
    value: 0,
  },
};

export const Positive: StoryObj<Props> = {
  args: {
    value: 250.53,
  },
};

export const Negative: StoryObj<Props> = {
  args: {
    value: -250.53,
  },
};

export const WithSubtext: StoryObj<Props> = {
  args: {
    value: -250.53,
    subtext: 'this month',
  },
};

export const UndefinedValue: StoryObj<Props> = {
  args: {
    value: undefined,
    subtext: 'this month',
  },
};
