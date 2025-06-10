import { Meta, StoryObj } from '@storybook/nextjs';

import { SteppedWorkflow } from './SteppedWorkflow';
import { Footer } from '../footer/Footer';
import { UserProvider } from '../providers/UserProvider';

const meta: Meta<typeof SteppedWorkflow> = {
  component: SteppedWorkflow,
  title: 'Components/SteppedWorkflow',
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    Story => (
      <>
        <UserProvider user={undefined}>
          <Story />
          <Footer />
        </UserProvider>
      </>
    ),
  ],
  tags: ['autodocs'],
  args: {
    workflowSteps: [
      {
        order: 1,
        url: 'i3ie',
        title: 'Step 1',
      },
      {
        order: 2,
        url: 'i3ie',
        title: 'Step 2',
      },
      {
        order: 3,
        url: 'i3ie',
        title: 'Step 3',
      },
    ],
  },
};

export default meta;

type Story = StoryObj<typeof SteppedWorkflow>;

export const GenericComponent: Story = {};
