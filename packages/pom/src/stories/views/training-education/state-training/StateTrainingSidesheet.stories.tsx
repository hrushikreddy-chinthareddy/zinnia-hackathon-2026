import type { Meta, StoryObj } from '@storybook/react';
import { default as PomStyles } from '../../../../styles/pom.module.css';
import { StateTrainingSidesheet } from '../../../../views/training-education/state-training/StateTrainingSidesheet';
import { generateStateTraining } from '../../../../views/training-education/__mocks';
import clsx from 'clsx';

const meta = {
  title:
    'Views/Training and Education/State Training/Sidesheets/View State Training Sidesheet',
  component: StateTrainingSidesheet,
  args: {
    overrideOpen: true,
  },
  decorators: [
    Story => (
      <div id={PomStyles['producer-onboarding-maintenance']}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StateTrainingSidesheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    stateTraining: generateStateTraining(1)[0],
    trigger: <span className={clsx(PomStyles.cta)}>View State Training</span>,
  },
};
