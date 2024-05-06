import { Meta, StoryObj } from '@storybook/react';

import { Badge } from '../../components/badge';
import { BadgeVariant } from '@/components/badge/types';

export default {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: {
    label: 'Text',
  },
} as Meta<typeof Badge>;

export const Default: StoryObj<typeof Badge> = {};

export const Success = {
  args: {
    variant: BadgeVariant.SUCCESS,
  },
};

export const Error = {
  args: {
    variant: BadgeVariant.ERROR,
  },
};

export const Info = {
  args: {
    variant: BadgeVariant.INFO,
  },
};

export const Pending = {
  args: {
    variant: BadgeVariant.PENDING,
  },
};

export const Warning = {
  args: {
    variant: BadgeVariant.WARNING,
  },
};

export const Inactive = {
  args: {
    variant: BadgeVariant.INACTIVE,
  },
};
