import { Meta, StoryObj } from '@storybook/react';

import { Ticker } from '../../components/ticker/Ticker';
import { TickerProps } from '@/components/ticker/types';

const meta: Meta<typeof Ticker> = {
  component: Ticker,
  title: 'Components/Ticker',
  tags: ['autodocs'],
};

export default meta;

export const Default: StoryObj<TickerProps> = {
  args: {
    value: 0,
    subtext: 'this month',
  },
};

export const DefaultWithoutSubtext: StoryObj<TickerProps> = {
  args: {
    value: 0,
  },
};

export const Positive: StoryObj<TickerProps> = {
  args: {
    value: 250.53,
    subtext: 'this month',
  },
};

export const PositiveWithoutSubtext: StoryObj<TickerProps> = {
  args: {
    value: 250.53,
  },
};

export const Negative: StoryObj<TickerProps> = {
  args: {
    value: -250.53,
    subtext: 'this month',
  },
};

export const NegativeWithoutSubtext: StoryObj<TickerProps> = {
  args: {
    value: -250.53
  },
};
