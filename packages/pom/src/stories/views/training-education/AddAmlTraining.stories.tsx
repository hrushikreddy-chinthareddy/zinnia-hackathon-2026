import type { Meta, StoryObj } from '@storybook/react';
import { default as PomStyles } from '../../../styles/pom.module.css';
import { AddAmlTrainingSidesheet } from '../../../views/training-education/aml-training/add/AddAmlTrainingSidesheet';

const meta = {
  title: 'Views/Training and Education/Add AML Training Sidesheet',
  component: AddAmlTrainingSidesheet,
} satisfies Meta<typeof AddAmlTrainingSidesheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  decorators: [
    Story => (
      <div id={PomStyles['producer-onboarding-maintenance']}>
        <Story />
      </div>
    ),
  ],
};
