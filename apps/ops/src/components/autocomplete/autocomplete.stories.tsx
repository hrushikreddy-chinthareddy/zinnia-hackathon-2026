import { useArgs } from '@storybook/client-api';
import { Meta } from '@storybook/react';

import '@deps/styles/styles.css';

import Autocomplete from './autocomplete';
import { SelectProps } from './autocomplete.types';

export default {
    title: 'Components/Autocomplete',
    component: Autocomplete,
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
} as Meta<typeof Autocomplete>;

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
export const Default = (args: SelectProps) => {
    const [, updateArgs] = useArgs();
    const handleChange = (value: string) => updateArgs({ value });

    return <Autocomplete {...args} onChange={handleChange} />;
};

Default.args = {
    disabled: false,
    options: lotsOfOptions,
    value: 'asc',
    size: 'small',
    // eslint-disable-next-line
    onChange: () => {},
};
