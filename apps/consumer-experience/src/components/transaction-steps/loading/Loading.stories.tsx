import { Meta, StoryObj } from '@storybook/nextjs';

import { UserProvider } from '@/components/providers/UserProvider';

import { Loading } from './Loading';

const meta: Meta = {
  component: Loading,
  decorators: [
    Story => (
      <UserProvider user={undefined}>
        <div style={{ maxWidth: '400px' }}>
          <Story />
        </div>
      </UserProvider>
    ),
  ],
  title: 'Components/TransactionSteps/Loading',
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
