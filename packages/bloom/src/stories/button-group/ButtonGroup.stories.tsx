import type { Meta, StoryObj } from '@storybook/react';

import { ButtonGroup } from '@/components/button-group/ButtonGroup';
import { ButtonGroupProps } from '@/components/button-group/types';
import { Icon, IconType, Label } from '@/components';

const meta: Meta<typeof ButtonGroup> = {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    items: [
      { children: <span>Button Item 1</span>, value: 'button1' },
      { children: <span>Button Item 2</span>, value: 'button2' },
      { children: <span>Button Item 3</span>, value: 'button3' },
    ],
  },
};

export default meta;
type StoryType = StoryObj<ButtonGroupProps>;

export const Default: StoryType = {};

export const WithLabel: StoryType = {
  args: {
    label: <Label labelFor="buttonGroupTest">Label</Label>,
    id: 'buttonGroupTest',
    items: [
      { children: <span>Button Item 1</span>, value: 'button1' },
      { children: <span>Button Item 2</span>, value: 'button2' },
      { children: <span>Button Item 3</span>, value: 'button3' },
    ],
  },
};

export const Inactive: StoryType = {
  args: {
    inactive: true,
    items: [
      { children: <span>Button Item 1</span>, value: 'button1' },
      { children: <span>Button Item 2</span>, value: 'button2' },
      { children: <span>Button Item 3</span>, value: 'button3' },
    ],
  },
};

export const InactiveWithLabel: StoryType = {
  args: {
    label: <Label labelFor="buttonGroupTestInactive">Label</Label>,
    id: 'buttonGroupTestInactive',
    inactive: true,
    items: [
      { children: <span>Button Item 1</span>, value: 'button1' },
      { children: <span>Button Item 2</span>, value: 'button2' },
      { children: <span>Button Item 3</span>, value: 'button3' },
    ],
  },
};

export const IconsOnly: StoryType = {
  args: {
    items: [
      { children: <Icon type={IconType.CLOUD} />, value: 'cloud1' },
      { children: <Icon type={IconType.CLOUD} />, value: 'cloud2' },
      { children: <Icon type={IconType.CLOUD} />, value: 'cloud3' },
    ],
  },
};

export const IconsOnlyWithLabel: StoryType = {
  args: {
    label: <Label labelFor="buttonGroupTestIcons">Label</Label>,
    id: 'buttonGroupTestIcons',
    items: [
      { children: <Icon type={IconType.CLOUD} />, value: 'cloud1' },
      { children: <Icon type={IconType.CLOUD} />, value: 'cloud2' },
      { children: <Icon type={IconType.CLOUD} />, value: 'cloud3' },
    ],
  },
};
