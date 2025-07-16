import { StoryObj, Meta } from '@storybook/nextjs';

import { Footer } from '@/components/footer/Footer';
import { OttpProvider } from '@/components/providers/one-time-premium-payment/OttpProvider';
import { UserProvider } from '@/components/providers/UserProvider';

import { OneTimePremium } from './OneTimePremium';

const meta: Meta<typeof OneTimePremium> = {
  component: OneTimePremium,
  title: 'Components/SteppedWorkflow/One-Time-Premium',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: Story => {
    return (
      <UserProvider user={undefined}>
        <OttpProvider>
          <div data-theme="everglades">
            <Story />
            <Footer />
          </div>
        </OttpProvider>
      </UserProvider>
    );
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Amount: Story = {
  args: {
    currentStepOverride: 0,
  },
};

export const Bank: Story = {
  args: {
    currentStepOverride: 1,
  },
};

export const Summary: Story = {
  args: {
    currentStepOverride: 2,
  },
};

export const Submitted: Story = {
  args: {
    currentStepOverride: 3,
  },
};
