import { Meta, StoryObj } from '@storybook/nextjs';

import { ProgressBarSteps } from './ProgressBarSteps';

const meta: Meta<typeof ProgressBarSteps> = {
  component: ProgressBarSteps,
  title: 'Components/ProgressBarSteps',
  args: {
    totalSteps: 4,
    currentStep: 1,
  },
  tags: ['autodocs'],
};

export default meta;

export const Default: StoryObj<typeof ProgressBarSteps> = {};

export const SomeStepsComplete: StoryObj<typeof ProgressBarSteps> = {
  args: {
    currentStep: 3,
  },
};

export const AllStepsComplete: StoryObj<typeof ProgressBarSteps> = {
  args: {
    currentStep: 4,
  },
};

export const EverlyTheme: StoryObj<typeof ProgressBarSteps> = {
  args: {
    currentStep: 3,
  },
  parameters: {
    theme: 'everly',
  },
};

export const WellabeTheme: StoryObj<typeof ProgressBarSteps> = {
  args: {
    currentStep: 3,
  },
  parameters: {
    theme: 'wellabe',
  },
};
