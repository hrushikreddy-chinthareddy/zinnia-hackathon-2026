import { Meta, StoryObj } from '@storybook/react';

import { Coverage } from '../Coverage';

const meta: Meta<typeof Coverage> = {
  component: Coverage,
  title: 'Components/PolicyOverview/Coverage',
  args: {},
  tags: ['autodocs'],
};

export default meta;
type StoryType = StoryObj;

export const Default: StoryType = {};

export const ZeroValues: StoryType = {
  args: {},
};

export const APIFailed: StoryType = {
  args: {},
};

export const NoBenes: StoryType = {
  args: {},
};

export const NoRiders: StoryType = {
  args: {},
};
