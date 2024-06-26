import { Meta, StoryObj } from '@storybook/react';

import { ProgressBarSteps } from './ProgressBarSteps';

const meta: Meta<typeof ProgressBarSteps> = {
  component: ProgressBarSteps,
  title: 'Components/ProgressBarSteps',
  args: {},
  tags: ['autodocs'],
};

export default meta;

export const Default: StoryObj<typeof ProgressBarSteps> = {
  args: {
    totalSteps: 4,
    currentStep: 1,
  },
};

export const SomeStepsComplete: StoryObj<typeof ProgressBarSteps> = {
  args: {
    totalSteps: 4,
    currentStep: 3,
  },
};

export const AllStepsComplete: StoryObj<typeof ProgressBarSteps> = {
  args: {
    totalSteps: 4,
    currentStep: 4,
  },
};
