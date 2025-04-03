import { CardHeader } from '../../components/card-header/CardHeader';
import { Meta, StoryObj } from '@storybook/react';
import { IconType } from '@zinnia/bloom/components';

const meta: Meta<typeof CardHeader> = {
  title: 'Components/CardHeader',
  component: CardHeader,
  tags: ['autodocs'],
  argTypes: {
    iconType: {
      control: 'select',
      options: [IconType.USER, IconType.OFFICEBUILDING],
    },
  },
};

export default meta;
type Story = StoryObj<typeof CardHeader>;

export const Individual: Story = {
  args: {
    title: 'Ethan Conners',
    subtext: 'National producer number: 987654321',
    iconType: IconType.USER,
  },
};

export const Corporation: Story = {
  args: {
    title: 'Acme Corp.',
    subtext: 'National producer number: 987654321',
    iconType: IconType.OFFICEBUILDING,
  },
};
