import { ButtonSize } from '@deps/components/button/button';
import SpinnerButton, { SpinnerButtonProps } from '@deps/components/spinner-button/spinner-button';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof SpinnerButton> = {
    title: 'Components/SpinnerButton',
    component: SpinnerButton,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        size: ButtonSize.Default,
        text: 'Click me',
        onClick: () => {
            console.log('You clicked me!');
        },
    },
    argTypes: {
        size: {
            control: 'select',
            options: Object.values(ButtonSize),
        },
    },
};

export default meta;

type StoryType = StoryObj<SpinnerButtonProps>;

export const Default: StoryType = {};

export const Small: StoryType = {
    args: {
        size: ButtonSize.Small,
    },
};
