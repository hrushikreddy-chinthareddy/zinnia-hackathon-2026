import { StoryObj, Meta } from '@storybook/nextjs';

import { Footer } from '@/components/footer/Footer';
import { UserProvider } from '@/components/providers/UserProvider';

import { Withdrawals } from './Withdrawals';

const meta: Meta<typeof Withdrawals> = {
  component: Withdrawals,
  title: 'Components/SteppedWorkflow/Withdrawals',
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
        <div data-theme="everglades">
          <Story />
          <Footer />
        </div>
      </UserProvider>
    );
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const IntroPage: Story = {
  args: {
    currentStepOverride: 0,
  },
};

export const WithdrawalAmount: Story = {
  args: {
    currentStepOverride: 1,
  },
};

export const WithdrawlMethod: Story = {
  args: {
    currentStepOverride: 2,
  },
};

export const TaxWithholdings: Story = {
  args: {
    currentStepOverride: 3,
  },
};

export const Payee: Story = {
  args: {
    currentStepOverride: 4,
  },
};

export const DistributionMethod: Story = {
  args: {
    currentStepOverride: 5,
  },
};

export const Summary: Story = {
  args: {
    currentStepOverride: 6,
  },
};

export const VerifyIdentity: Story = {
  args: {
    currentStepOverride: 7,
  },
};

export const Submitted: Story = {
  args: {
    currentStepOverride: 8,
  },
};
