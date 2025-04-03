import type { Meta, StoryObj } from '@storybook/react';
import { ProducerType } from '../../types';
import Producer from '../../views/producer/Producer';

const meta = {
  title: 'Pages/Producer',
  component: Producer,
  args: {
    producerType: ProducerType.CORPORATION,
    isMockProducer: true,
  },
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    // layout: 'fullscreen',
  },
} satisfies Meta<typeof Producer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Corporation: Story = {
  args: {
    producerType: ProducerType.CORPORATION,
    isMockProducer: true,
  },
};

export const Individual: Story = {
  args: {
    producerType: ProducerType.INDIVIDUAL,
    isMockProducer: true,
  },
};
