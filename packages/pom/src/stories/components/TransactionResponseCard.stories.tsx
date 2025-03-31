import type { Meta, StoryObj } from '@storybook/react';
import { TransactionResponseCard } from '../../components/transaction-response-card/TransactionResponseCard';
import { Button, Icon, IconType } from '@zinnia/bloom/components';

const meta = {
  title: 'Components/TransactionResponseCard',
  component: TransactionResponseCard,
  decorators: [
    Story => (
      <div
        style={{
          height: '700px',
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TransactionResponseCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Pending: Story = {
  args: {
    message: 'Pending submission',
    title: 'Pending',
    icon: <Icon type={IconType.CLOCK} width={50} height={50} color="blue" />,
  },
};

export const Success: Story = {
  args: {
    message: 'Your appointment has been successfully submitted.',
    title: 'Success',
    icon: (
      <Icon
        type={IconType.CIRCLE_CHECKMARK}
        width={50}
        height={50}
        color="green"
      />
    ),
    action: <Button mode="primary">View Appointment</Button>,
  },
};

export const Error: Story = {
  args: {
    message: 'Error submitting your appointment.',
    title: 'Error',
    icon: (
      <Icon
        type={IconType.ALERT_EXCLAMATION}
        width={50}
        height={50}
        color="red"
      />
    ),
    onClose: () => {
      console.log('close');
    },
  },
};
