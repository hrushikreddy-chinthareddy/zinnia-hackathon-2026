import type { Meta, StoryObj } from '@storybook/react';
import { Accordion } from './Accordion';

const meta: Meta<typeof Accordion> = {
  title: 'Components/Accordion',
  component: Accordion,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    sectionLabel: 'Section label',
    children: (
      <>
        <p>
          Lorem ipsum dolor sit amet consectetur adipiscing elit suscipit
          tincidunt consequat consectetur adipiscing elit suscipit tincidunt
          consequat consectetur adipiscing elit suscipit tincidunt consequat
          consectetur adipiscing elit suscipit tincidunt consequat
        </p>
        <p>
          Lorem ipsum dolor sit amet consectetur adipiscing elit suscipit
          tincidunt consequat consectetur adipiscing elit suscipit tincidunt
          consequat consectetur adipiscing elit suscipit tincidunt consequat
          consectetur adipiscing elit suscipit tincidunt consequat
        </p>
        <p>
          Lorem ipsum dolor sit amet consectetur adipiscing elit suscipit
          tincidunt consequat consectetur adipiscing elit suscipit tincidunt
          consequat consectetur adipiscing elit suscipit tincidunt consequat
          consectetur adipiscing elit suscipit tincidunt consequat
        </p>
      </>
    ),
  },
};
