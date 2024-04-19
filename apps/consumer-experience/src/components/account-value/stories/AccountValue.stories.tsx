import { Meta, StoryObj } from '@storybook/react';

import { AccountValue } from '../../account-value/AccountValue';

const meta: Meta<typeof AccountValue> = {
  component: AccountValue,
  title: 'Components/PolicyOverview/AccountValue',

  tags: ['autodocs'],
};

export default meta;
type StoryType = StoryObj;

export const Default: StoryType = {
  args: {},
};

export const ZeroValues: StoryType = {
  args: {},
};

export const MainValueNull: StoryType = {
  args: {},
};

export const APIFailed: StoryType = {
  args: {},
};
