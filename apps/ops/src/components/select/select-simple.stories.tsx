import { useArgs } from '@storybook/client-api';
import { Meta } from '@storybook/react';

import '@deps/styles/styles.css';

import Select from './select';
import { SelectProps } from './select.helpers';

export default {
    title: 'Components/Select/Simple',
    component: Select,
    decorators: [
        (Story) => (
            <div className="ml-32 w-64 p-10">
                <div
                    style={{
                        width: 'auto',
                    }}
                >
                    <Story />
                </div>
            </div>
        ),
    ],
} as Meta<typeof Select>;

const sortValues = [
    {
        label: 'Sort: Newest',
        value: 'asc',
    },
    {
        label: 'Sort: Oldest',
        value: 'desc',
    },
];

export const Default = (args: SelectProps) => {
    const [, updateArgs] = useArgs();
    const handleChange = (value: string) => updateArgs({ value });

    return <Select {...args} onChange={handleChange} />;
};

Default.args = {
    disabled: false,
    options: sortValues,
    value: 'asc',
    size: 'small',
    // eslint-disable-next-line
    onChange: () => {},
};

const lotsOfOptions = [
    {
        label: 'Rhubarb',
        value: 'Rhubarb',
    },
    {
        label: 'Strawberry',
        value: 'Strawberry',
    },
    {
        label: 'Blueberry',
        value: 'Blueberry',
    },
    {
        label: 'Boysenberry',
        value: 'Boysenberry',
    },
    {
        label: 'Apple',
        value: 'Apple',
    },
    {
        label: 'Peach',
        value: 'Peach',
    },
    {
        label: 'Banana',
        value: 'Banana',
    },
    {
        label: 'Lemon',
        value: 'Lemon',
    },
];

export const LotsOfOptions = (args: SelectProps) => {
    const [, updateArgs] = useArgs();
    const handleChange = (value: string) => updateArgs({ value });

    return <Select {...args} onChange={handleChange} />;
};

LotsOfOptions.args = {
    disabled: false,
    options: lotsOfOptions,
    value: 'asc',
    size: 'small',
    // eslint-disable-next-line
    onChange: () => {},
};
