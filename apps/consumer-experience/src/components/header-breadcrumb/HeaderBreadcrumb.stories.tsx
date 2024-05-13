import { Meta, StoryObj } from '@storybook/react';

import { HeaderBreadcrumb, HeaderBreadcrumbProps } from './HeaderBreadcrumb';

const meta: Meta<typeof HeaderBreadcrumb> = {
  component: HeaderBreadcrumb,
  title: 'Components/HeaderBreadcrumb',
};

export default meta;

export const Default: StoryObj<HeaderBreadcrumbProps> = {
  args: {
    title: 'Coverage',
  },
};

export const WithPopover = {
  args: {
    title: 'Coverage',
    popover: {
      content: <p>Popover Content</p>,
      title: <p>Popover Title</p>,
    },
  },
};
