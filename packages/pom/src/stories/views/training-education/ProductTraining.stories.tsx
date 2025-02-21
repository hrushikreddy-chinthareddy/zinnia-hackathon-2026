import type { Meta, StoryObj } from '@storybook/react';
import ProductTraining from '../../../views/training-education/product-training/ProductTraining';
import { generateProductTraining } from '../../../views/training-education/__mocks';

const meta = {
  title: 'Views/Training and Education/Product Training',
  component: ProductTraining,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ProductTraining>;

export default meta;

type StoryType = StoryObj<typeof ProductTraining>;

export const Default: StoryType = {
  args: {
    items: generateProductTraining(15),
  },
};
