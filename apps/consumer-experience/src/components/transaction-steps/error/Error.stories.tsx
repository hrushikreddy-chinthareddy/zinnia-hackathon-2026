import { Meta, StoryObj } from '@storybook/nextjs';

import { UserProvider } from '@/components/providers/UserProvider';

import { Error } from './Error';

const meta: Meta = {
  component: Error,
  args: {
    errorTitle: 'Oh no something went wrong',
    errorMessage: 'press close and we can both forget it ever happened',
    correlationId: '13456-78910-112345',
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
  title: 'Components/TransactionSteps/Error',
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const ServerError: Story = {
  args: {
    isServerError: true,
    errorTitle: '500 Server Error',
    errorMessage: 'press close and we can both forget it ever happened',
    correlationId: '13456-78910-112345',
  },
};
