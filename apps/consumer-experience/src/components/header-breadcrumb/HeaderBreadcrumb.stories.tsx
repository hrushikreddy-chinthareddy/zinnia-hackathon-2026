import { Meta, StoryObj } from '@storybook/react';

import { HeaderBreadcrumb } from './HeaderBreadcrumb';

export default {
  component: HeaderBreadcrumb,
  title: 'Components/HeaderBreadcrumb',
} as Meta<typeof HeaderBreadcrumb>;

export const Default: StoryObj<typeof HeaderBreadcrumb> = {
  args: {
    title: 'Increase coverage',
    href: '#',
    label: '',
  },
};

export const WithPopover = {
  args: {
    title: 'Increase coverage',
    href: '#',
    label: '',
    popover: {
      content: <p>Popover Content</p>,
      title: <p>Popover Title</p>,
    },
  },
};
