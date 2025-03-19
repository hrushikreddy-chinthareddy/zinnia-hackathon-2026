import type { Meta, StoryObj } from '@storybook/react';
import { Search } from '../../../views/search/Search';

const meta = {
  title: 'Views/Index Page',
  component: Search,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof Search>;

export default meta;

type StoryType = StoryObj<typeof Search>;

export const Page: StoryType = {
  args: {},
};
