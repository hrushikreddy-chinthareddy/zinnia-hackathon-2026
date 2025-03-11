import type { Meta, StoryObj } from '@storybook/react';
import AmlTraining from '../../../../views/training-education/aml-training/AmlTraining';
import { generateAmlTraining } from '../../../../views/training-education/__mocks';
import { default as PomStyles } from '../../../../styles/pom.module.css';

const meta = {
  title: 'Views/Training and Education/AML Training',
  component: AmlTraining,
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
} satisfies Meta<typeof AmlTraining>;

export default meta;

type StoryType = StoryObj<typeof AmlTraining>;

export const Table: StoryType = {
  args: {
    items: generateAmlTraining(15),
  },
};
