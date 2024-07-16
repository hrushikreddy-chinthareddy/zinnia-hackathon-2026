import { Meta, StoryObj } from '@storybook/react';

import { DateInput, DateInputProps } from './DateInput';

const meta: Meta<typeof DateInput> = {
  component: DateInput,
  title: 'Components/DateInput',
  tags: ['autodocs'],
};

export default meta;

export const Default: StoryObj<DateInputProps> = {
  args: {
    onSelect: () => {},
  },
};
