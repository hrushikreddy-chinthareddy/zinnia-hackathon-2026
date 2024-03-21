import { Meta, StoryObj } from '@storybook/react';

import { Pagination, PaginationProps } from '@/components/pagination';

const meta: Meta<typeof Pagination> = {
  title: 'Components/Pagination',
  component: Pagination,
  tags: ["autodocs"],
  args: {
    total: 50,
    limit: 10, 
    offset: 0
  }
};

export default meta;
type StoryType = StoryObj<PaginationProps>;

export const Default: StoryType = {};