import type { Meta, StoryObj } from '@storybook/react';
import { Success } from '../../components/success/Success';
import { Button } from '@zinnia/bloom/components';

const meta = {
  title: 'Components/Success',
  component: Success,
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
} satisfies Meta<typeof Success>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: 'Your form has been successfully submitted.',
  },
};

export const WithActionButton: Story = {
  args: {
    message: 'Your form has been successfully submitted.',
    action: <Button mode="primary">View Appointment</Button>,
  },
};

export const WithCloseButton: Story = {
  args: {
    message: 'Your form has been successfully submitted.',
    onClose: () => {
      console.log('close');
    },
  },
};
