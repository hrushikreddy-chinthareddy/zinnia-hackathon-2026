import { Meta } from '@storybook/react';

import Button, { ButtonProps } from './button';
import '@deps/styles/styles.css';

export const ButtonComponent = (args: ButtonProps) => <Button {...args} />;

const meta: Meta<typeof Button> = {
    title: 'Components/Button',
    component: Button,
    args: {
        children: 'Click me!',
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
