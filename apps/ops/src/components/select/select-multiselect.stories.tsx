import { Meta } from '@storybook/react';
import { useState } from 'react';
import '@deps/styles/styles.css';

import { ReactComponent as SparklesIcon } from '@deps/styles/elements/icons/icons_outlined/sparkles.svg';
import { getCarrierListItem } from '@deps/utils/carriers';

import Select from './select';
import { MultiselectOption } from './select.helpers';
import { FieldSize } from '../fields/field';

export default {
    title: 'Components/Select/Multiselect',
    component: Select,
    decorators: [
        Story => (
            <div className="ml-32 mt-16 w-96">
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

const sortValues: MultiselectOption[] = [
    {
        label: 'Sort: Newest',
        value: 'asc',
        displayText: 'Newest',
    },
    {
        label: 'Sort: Oldest',
        value: 'desc',
        displayText: 'Oldest',
    },
];

export const Default = (args: { disabled: boolean; options: MultiselectOption[]; size: FieldSize }) => {
    const [selections, setSelections] = useState<{ [key: string]: string }>({});

    const updateSelection = (value: string, displayText: string) => {
        const newSelections = { ...selections };
        if (newSelections[value]) {
            delete newSelections[value];
        } else {
            newSelections[value] = displayText;
        }
        setSelections(newSelections);
    };

    return <Select {...args} value={selections} onChange={updateSelection} isMultiselect />;
};

Default.args = {
    isMultiselect: true,
    disabled: false,
    options: sortValues,
    size: 'small',
};

const lotsOfOptions: MultiselectOption[] = [
    {
        label: 'Rhubarb',
        value: 'Rhubarb',
        displayText: 'Rhubarb',
    },
    {
        label: 'Strawberry',
        value: 'Strawberry',
        displayText: 'Strawberry',
    },
    {
        label: 'Blueberry',
        value: 'Blueberry',
        displayText: 'Blueberry',
    },
    {
        label: 'Boysenberry',
        value: 'Boysenberry',
        displayText: 'Boysenberry',
    },
    {
        label: 'Apple',
        value: 'Apple',
        displayText: 'Apple',
    },
    {
        label: 'Peach',
        value: 'Peach',
        displayText: 'Peach',
    },
    {
        label: 'Banana',
        value: 'Banana',
        displayText: 'Banana',
    },
    {
        label: (
            <div className="flex">
                {' '}
                <SparklesIcon width={20} height={20} /> Lemon
            </div>
        ),
        value: 'Lemon',
        displayText: 'Lemon',
    },
];

export const LotsOfOptions = (args: { disabled: boolean; options: MultiselectOption[]; size: FieldSize }) => {
    const [selections, setSelections] = useState<{ [key: string]: string }>({});

    const updateSelection = (value: string, displayText: string) => {
        const newSelections = { ...selections };
        if (newSelections[value]) {
            delete newSelections[value];
        } else {
            newSelections[value] = displayText;
        }
        setSelections(newSelections);
    };

    return <Select {...args} value={selections} onChange={updateSelection} isMultiselect />;
};

LotsOfOptions.args = {
    disabled: false,
    options: lotsOfOptions,
    size: 'small',
};

const carrierSamples: MultiselectOption[] = [
    {
        label: getCarrierListItem('mass'),
        value: 'mass',
        displayText: 'Mass Mutual',
    },
    {
        label: getCarrierListItem('sbgc'),
        value: 'sbgc',
        displayText: 'SBGC',
    },
    {
        label: getCarrierListItem('usaa'),
        value: 'usaa',
        displayText: 'USAA',
    },
    {
        label: getCarrierListItem('nlg'),
        value: 'nlg',
        displayText: 'National Life Group',
    },
    {
        label: getCarrierListItem('emrs'),
        value: 'emrs',
        displayText: 'Empower Retirement',
    },
];

export const CarrierExample = (args: { disabled: boolean; options: MultiselectOption[]; size: FieldSize }) => {
    const [selections, setSelections] = useState<{ [key: string]: string }>({});

    const updateSelection = (value: string, displayText: string) => {
        const newSelections = { ...selections };
        if (newSelections[value]) {
            delete newSelections[value];
        } else {
            newSelections[value] = displayText;
        }
        setSelections(newSelections);
    };

    return <Select {...args} value={selections} onChange={updateSelection} isMultiselect />;
};

CarrierExample.args = {
    disabled: false,
    options: carrierSamples,
    size: 'small',
};
