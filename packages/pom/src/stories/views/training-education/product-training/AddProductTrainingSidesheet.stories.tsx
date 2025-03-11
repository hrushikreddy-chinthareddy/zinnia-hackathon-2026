import type { Meta, StoryObj } from '@storybook/react';
import { AddProductTrainingSidesheet } from '../../../../views/training-education/product-training/add/AddProductTrainingSidesheet';
import { default as PomStyles } from '../../../../styles/pom.module.css';

const meta = {
  title:
    'Views/Training and Education/Product Training/Sidesheets/Add Product Training Sidesheet',
  component: AddProductTrainingSidesheet,
  decorators: [
    Story => (
      <div id={PomStyles['producer-onboarding-maintenance']}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AddProductTrainingSidesheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
