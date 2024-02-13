import { Meta, StoryObj } from '@storybook/react';

import { HeaderBreadcrumb, HeaderBreadcrumbProps } from './HeaderBreadcrumb';

const meta: Meta<typeof HeaderBreadcrumb> = {
  component: HeaderBreadcrumb,
  title: 'Components/HeaderBreadcrumb',
};

export default meta;

export const Default: StoryObj<HeaderBreadcrumbProps> = {
  args: {
    title: 'Increase coverage',
  },
};

export const WithPopover = {
  args: {
    title: 'Increase coverage',
    popover: {
      content: <p>Popover Content</p>,
      title: <p>Popover Title</p>,
    },
  },
};
