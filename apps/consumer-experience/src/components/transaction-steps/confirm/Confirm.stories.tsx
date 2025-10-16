import { Meta, StoryObj } from '@storybook/nextjs';

import { UserProvider } from '@/components/providers/UserProvider';

import { Confirm } from './Confirm';

const meta: Meta = {
  component: Confirm,
  args: {
    confirmTitle: 'Are you sure you want to do that?',
    confirmMessage: 'you really ought to think about it before you do this',
    confirmButtonText: 'Confirm',
    confirmCallback: () => {},
    denyCallback: () => {},
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
  title: 'Components/TransactionSteps/Confirm',
};

export default meta;

type Story = StoryObj<typeof meta>;
export const Default: Story = {};
