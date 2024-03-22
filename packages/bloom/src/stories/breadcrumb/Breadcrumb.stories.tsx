import type { Meta, StoryObj } from '@storybook/react';

import { Breadcrumb } from '../../components/breadcrumb';
import { BreadcrumbProps } from '@/components/breadcrumb/types';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    text: 'breadcrumb',
    url: '#',
  },
};

export default meta;
type StoryType = StoryObj<BreadcrumbProps>;

export const Default: StoryType = {};
