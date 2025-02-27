import type { Meta, StoryObj } from '@storybook/react';
import { default as PomStyles } from '../../../../styles/pom.module.css';
import { generateAmlTraining } from '../../../../views/training-education/__mocks';
import clsx from 'clsx';
import { AmlTrainingSidesheet } from '../../../../views/training-education/aml-training/AmlTrainingSidesheet';

const meta = {
  title:
    'Views/Training and Education/AML Training/Sidesheets/View AML Training Sidesheet',
  component: AmlTrainingSidesheet,
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
} satisfies Meta<typeof AmlTrainingSidesheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    amlTraining: generateAmlTraining(1)[0],
    trigger: <span className={clsx(PomStyles.cta)}>View AML Training</span>,
  },
};
