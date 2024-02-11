import { Meta, StoryObj } from '@storybook/react';

import {
  AssistiveText,
  AssistiveTextVariant,
} from '../../components/assistive-text/AssistiveText';

export default {
  title: 'Components/AssistiveText',
  component: AssistiveText,
  tags: ['autodocs'],
} as Meta<typeof AssistiveText>;

export const DefaultAssistiveText: StoryObj<typeof AssistiveText> = {
  args: {
    text: 'Assistive message',
  },
};

export const Success = {
  args: {
    variant: AssistiveTextVariant.Success,
    text: 'Success message',
  },
};

export const Error = {
  args: {
    variant: AssistiveTextVariant.Error,
    text: 'Error message',
  },
};

export const Info = {
  args: {
    variant: AssistiveTextVariant.Info,
    text: 'Info message',
  },
};
