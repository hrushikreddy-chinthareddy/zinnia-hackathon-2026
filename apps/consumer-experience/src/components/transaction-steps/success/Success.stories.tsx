import { Meta, StoryObj } from '@storybook/nextjs';

import { UserProvider } from '@/components/providers/UserProvider';

import { Success } from './Success';

const meta: Meta = {
  component: Success,
  args: {
    successTitle: 'Success',
    successMessage: 'You did it! We are all so proud of you!',
  },
  decorators: [
    Story => (
      <UserProvider user={undefined}>
        <div style={{ maxWidth: '400px' }}>
          <Story />
        </div>
      </UserProvider>
    ),
  ],
  title: 'Components/TransactionSteps/Success',
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
