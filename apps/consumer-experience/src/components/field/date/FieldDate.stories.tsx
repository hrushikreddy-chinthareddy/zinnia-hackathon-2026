import { Meta, StoryObj } from '@storybook/nextjs';
import { Label } from '@zinnia/bloom/components';

import { FieldDate } from './FieldDate';

const meta: Meta<typeof FieldDate> = {
  component: FieldDate,
  title: 'Components/Field/FieldDate',
  tags: ['autodocs'],
};

export default meta;

export const Default: StoryObj<typeof meta> = {
  args: {
    label: <Label>Date</Label>,
  },
};
