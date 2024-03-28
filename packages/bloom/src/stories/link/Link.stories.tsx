import type { Meta, StoryObj } from '@storybook/react';
import { Link, LinkProps } from '../../components/link/Link';
import { IconType } from '@/components';

export default {
  title: 'Components/Link',
  component: Link,
  tags: ['autodocs'],
  args: { href: '#', text: 'link' },
} as Meta<typeof Link>;

type StoryType = StoryObj<LinkProps>;

export const Default: StoryType = {
  args: {},
};

export const Small: StoryType = {
  args: {
    size: 'small',
  },
};

export const WithIcon: StoryType = {
  args: {
    iconType: IconType.CLOUD,
  },
};

export const LinkAsButton: StoryType = {
  args: {
    variant: 'button',
  },
};
