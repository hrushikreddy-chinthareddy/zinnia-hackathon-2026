import type { Meta, StoryObj } from '@storybook/react';

import { ButtonGroup } from '@/components/button-group/ButtonGroup';
import { ButtonGroupProps } from '@/components/button-group/types';
import { Icon, IconType, Label } from '@/components';

const itemsWithText = [
  { children: <span>Button Item 1</span>, value: 'button1' },
  { children: <span>Button Item 2</span>, value: 'button2' },
  { children: <span>Button Item 3</span>, value: 'button3' },
];

const iconItems = [
  { children: <Icon type={IconType.CLOUD} />, value: 'cloud1' },
  { children: <Icon type={IconType.CLOUD} />, value: 'cloud2' },
  { children: <Icon type={IconType.CLOUD} />, value: 'cloud3' },
];

const meta: Meta<typeof ButtonGroup> = {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
  tags: ['autodocs'],
  args: {
    items: itemsWithText,
  },
};

export default meta;
type StoryType = StoryObj<ButtonGroupProps>;

export const Default: StoryType = {};

export const WithLabel: StoryType = {
  args: {
    label: <Label labelFor="buttonGroupTest">Label</Label>,
    id: 'buttonGroupTest',
    items: itemsWithText,
  },
};

export const Inactive: StoryType = {
  args: {
    inactive: true,
    items: itemsWithText,
  },
};

export const InactiveWithLabel: StoryType = {
  args: {
    label: <Label labelFor="buttonGroupTestInactive">Label</Label>,
    id: 'buttonGroupTestInactive',
    inactive: true,
    items: itemsWithText,
  },
};

export const IconsOnly: StoryType = {
  args: {
    items: iconItems,
  },
};

export const IconsOnlyWithLabel: StoryType = {
  args: {
    label: <Label labelFor="buttonGroupTestIcons">Label</Label>,
    id: 'buttonGroupTestIcons',
    items: iconItems,
  },
};
