import { Meta, StoryObj } from '@storybook/react';
import { Layout } from './Layout';

const meta = {
  title: 'Example/Layout',
  component: Layout,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Layout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <p>Some content</p>,
  },
};
export const WithLongContent: Story = {
  args: {
    children: (
      <div>
        <p>Some content</p>
        <p>Some content</p>
        <p>Some content</p>
        <p>Some content</p>
        <p>Some content</p>
        <p>Some content</p>
        <p>Some content</p>
        <p>Some content</p>
        <p>Some content</p>
        <p>Some content</p>
      </div>
    ),
  },
};
