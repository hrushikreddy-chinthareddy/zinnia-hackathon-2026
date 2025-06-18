import { StoryObj, Meta } from '@storybook/nextjs';

import { Footer } from '@/components/footer/Footer';
import { SystematicPremiumsProvider } from '@/components/providers/systematic-premiums/SystematicPremiumsProvider';
import { UserProvider } from '@/components/providers/UserProvider';

import { SystematicPremiums } from './SystematicPremiums';

const meta: Meta<typeof SystematicPremiums> = {
  component: SystematicPremiums,
  title: 'Components/SteppedWorkflow/Systematic-Premiums',
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
        <SystematicPremiumsProvider>
          <div data-theme="everglades">
            <Story />
            <Footer />
          </div>
        </SystematicPremiumsProvider>
      </UserProvider>
    );
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const SetUpPremiumAutopay: Story = {
  args: {
    currentStepOverride: 0,
  },
};

export const PaymentMethod: Story = {
  args: {
    currentStepOverride: 1,
  },
};


export const Summary: Story = {
  args: {
    currentStepOverride: 2,
  },
};

export const VerifyIdentity: Story = {
  args: {
    currentStepOverride: 3,
  },
};

export const Submitted: Story = {
  args: {
    currentStepOverride: 4,
  },
};
