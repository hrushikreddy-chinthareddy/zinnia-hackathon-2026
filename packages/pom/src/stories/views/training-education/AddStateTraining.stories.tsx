import type { Meta, StoryObj } from '@storybook/react';
import { AddStateTrainingSidesheet } from '../../../views/training-education/state-training/add/AddStateTrainingSidesheet';

const meta = {
  title: 'Views/Training and Education/Add State Training Sidesheet',
  component: AddStateTrainingSidesheet,
} satisfies Meta<typeof AddStateTrainingSidesheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
