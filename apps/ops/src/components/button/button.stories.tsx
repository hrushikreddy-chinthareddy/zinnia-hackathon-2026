import { Meta, StoryObj } from '@storybook/react';

import Button, { ButtonProps, ButtonType, ButtonVariant } from './button';
import '@deps/styles/styles.css';

export const ButtonComponent = (args: ButtonProps) => <Button {...args} />;

const meta: Meta<typeof Button> = {
    title: 'Components/Button',
    component: Button,
    args: {
        children: 'Click me!',
        type: ButtonType.Primary,
    },
    argTypes: {
        variant: {
            options: ['default', 'inactive', 'selective'],
        },
        size: {
            options: ['default', 'small'],
        },
        type: {
            options: ['primary', 'secondary', 'contrast'],
        },
    },
};
export default meta;

type StoryType = StoryObj<ButtonProps>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Primary: StoryType = {};

export const Secondary: StoryType = {
    args: {
        type: ButtonType.Secondary,
    },
};

export const Selected: StoryType = {
    args: {
        type: ButtonType.Primary,
        variant: ButtonVariant.Selected,
    },
};

export const Disabled: StoryType = {
    args: {
        type: ButtonType.Primary,
        variant: ButtonVariant.Inactive,
    },
};
