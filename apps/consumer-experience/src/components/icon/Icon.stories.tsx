import { Meta } from '@storybook/react';

import { Icon, IconProps, IconType } from './Icon';

export default {
  title: 'Components/Icon',
  component: Icon,
  tags: ['autodocs'],
  args: {
    type: IconType.CLOUD,
  },
  argTypes: {
    color: {
      control: {
        type: 'color',
        default: '#000',
      },
    },
  },
} as Meta<typeof Icon>;

export const IconExample = (args: IconProps) => <Icon {...args} />;
