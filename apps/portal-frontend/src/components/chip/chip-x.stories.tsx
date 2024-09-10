import { Meta, StoryObj } from '@storybook/react';

import ChipX, { ChipXProps } from './chip-x';

const meta: Meta<typeof ChipX> = {
    title: 'Components/ChipX',
    component: ChipX,
    args: {
        label: 'Chip',
        onDelete: () => {
          console.log('Deleting chip')
        }
    },
    parameters: {
      layout: 'centered',
    },
};

export default meta;

type StoryType = StoryObj<ChipXProps>;

export const Default: StoryType = {};
