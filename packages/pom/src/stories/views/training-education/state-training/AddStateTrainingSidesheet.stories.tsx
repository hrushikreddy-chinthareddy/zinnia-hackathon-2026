import type { Meta, StoryObj } from '@storybook/react';
import { AddStateTrainingSidesheet } from '../../../../views/training-education/state-training/add/AddStateTrainingSidesheet';
import { default as PomStyles } from '../../../../styles/pom.module.css';

const meta = {
  title:
    'Views/Training and Education/State Training/Sidesheets/Add State Training Sidesheet',
  component: AddStateTrainingSidesheet,
  decorators: [
    Story => (
      <div id={PomStyles['producer-onboarding-maintenance']}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AddStateTrainingSidesheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
