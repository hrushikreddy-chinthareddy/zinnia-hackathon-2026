import type { Meta, StoryObj } from '@storybook/react';
import { AddAmlTrainingSidesheet } from '../../../../views/training-education/aml-training/add/AddAmlTrainingSidesheet';
import { default as PomStyles } from '../../../../styles/pom.module.css';

const meta = {
  title:
    'Views/Training and Education/AML Training/Sidesheets/Add AML Training Sidesheet',
  component: AddAmlTrainingSidesheet,
  decorators: [
    Story => (
      <div id={PomStyles['producer-onboarding-maintenance']}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AddAmlTrainingSidesheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
