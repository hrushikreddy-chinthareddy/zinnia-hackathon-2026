import { Meta, StoryObj } from '@storybook/nextjs';
import { Icon, IconType, Label } from '@zinnia/bloom/components';

import { FieldDataActive } from './FieldDataActive';
import { FieldStatus } from '../types';

const meta: Meta<typeof FieldDataActive> = {
  component: FieldDataActive,
  title: 'Components/Field/FieldDataActive',
  tags: ['autodocs'],
};

export default meta;

export const Default: StoryObj<typeof FieldDataActive> = {
  args: {
    onSelect: () => {},
    label: <Label>Data Active</Label>,
  },
};

export const WithError: StoryObj<typeof FieldDataActive> = {
  args: {
    label: <Label>Data Active</Label>,
    icon: <Icon type={IconType.CALENDAR} />,
    fieldStatus: FieldStatus.ERROR,
  },
};

export const WithIcon: StoryObj<typeof FieldDataActive> = {
  args: {
    label: <Label>Data Active</Label>,
    icon: <Icon type={IconType.CALENDAR} />,
  },
};
