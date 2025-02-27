import type { Meta, StoryObj } from '@storybook/react';
import { default as PomStyles } from '../../../../styles/pom.module.css';
import { generateProductTraining } from '../../../../views/training-education/__mocks';
import clsx from 'clsx';
import { ProductTrainingSidesheet } from '../../../../views/training-education/product-training/ProductTrainingSidesheet';

const meta = {
  title:
    'Views/Training and Education/Product Training/Sidesheets/View Product Training Sidesheet',
  component: ProductTrainingSidesheet,
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
} satisfies Meta<typeof ProductTrainingSidesheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    productTraining: generateProductTraining()[0],
    trigger: <span className={clsx(PomStyles.cta)}>View Product Training</span>,
  },
};
