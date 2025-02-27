import type { Meta, StoryObj } from '@storybook/react';
import StateTraining from '../../../../views/training-education/state-training/StateTraining';
import { generateStateTraining } from '../../../../views/training-education/__mocks';
import { default as PomStyles } from '../../../../styles/pom.module.css';

const meta = {
  title: 'Views/Training and Education/State Training',
  component: StateTraining,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen',
  },
  decorators: [
    Story => (
      <div id={PomStyles['producer-onboarding-maintenance']}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StateTraining>;

export default meta;

type StateTrainingStory = StoryObj<typeof StateTraining>;

export const Table: StateTrainingStory = {
  args: {
    items: generateStateTraining(15),
  },
};
