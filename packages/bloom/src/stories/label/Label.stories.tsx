import type { Meta, StoryObj } from '@storybook/react';
import InfoIcon from '../../tokens/svg-assets/icons/circles/circle-info.svg';

import { Label, LabelProps } from './Label';

export default {
  title: 'Components/Label',
  component: Label,
  tags: ['autodocs'],
} as Meta<typeof Label>;

export const PopoverInteraction: StoryObj<LabelProps> = {
  args: {
    text: 'Label content',
    interactiveElements: [
      <InfoIcon width={16} height={16} />,
      <span
        className="typographyNavLinksSm"
        style={{
          color: 'var(--colorBaseTextTextLink)',
        }}
      >
        +2 other
      </span>,
    ],
  },
};
