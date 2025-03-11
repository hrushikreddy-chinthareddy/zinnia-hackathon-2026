import type { Meta, StoryObj } from '@storybook/react';
import { CreateProducerForm } from '../../../views/create-producer/CreateProducerForm';

const meta = {
  title: 'Views/Create Producer Form',
  component: CreateProducerForm,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof CreateProducerForm>;

export default meta;

type StoryType = StoryObj<typeof CreateProducerForm>;

export const Page: StoryType = {
  args: {},
};
