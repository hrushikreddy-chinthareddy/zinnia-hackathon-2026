import type { Meta, StoryObj } from '@storybook/react';
import TrainingEducation from '../../../views/training-education/TrainingEducation';

const meta = {
  title: 'Views/Training and Education',
  component: TrainingEducation,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'padded',
  },
} satisfies Meta<typeof TrainingEducation>;

export default meta;

type StoryType = StoryObj<typeof TrainingEducation>;

export const Page: StoryType = {
  args: {},
};
