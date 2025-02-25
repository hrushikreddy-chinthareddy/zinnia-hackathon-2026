import type { Meta, StoryObj } from '@storybook/react';
import StateTraining from '../../../views/training-education/state-training/StateTraining';
import { generateStateTraining } from '../../../views/training-education/__mocks';

const meta = {
  title: 'Views/Training and Education/State Training',
  component: StateTraining,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen',
  },
} satisfies Meta<typeof StateTraining>;

export default meta;

type StoryType = StoryObj<typeof StateTraining>;

export const Default: StoryType = {
  args: {
    items: generateStateTraining(10),
  },
};
