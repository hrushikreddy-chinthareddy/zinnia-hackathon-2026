import '@deps/styles/styles.css';
import { Meta } from '@storybook/react';
import { useState } from 'react';

import Radio, { RadioItem, RadioVariant } from './radio';
import Content, { ContentVariant } from '../content/content';
import Field, { FieldSize, FieldType } from '../fields/field';
import FieldLabel from '../fields/field-label';

export default {
    title: 'Components/Radio',
    component: Radio,
    decorators: [
        Story => (
            <div className="container">
                <Story />
            </div>
        ),
    ],
} as Meta<typeof Radio>;

export const RadioComponent = () => {
    const items: RadioItem[] = [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
        { label: 'Option 3', value: 'option3' },
    ];

    const [value, setValue] = useState('');
    const handleChange = (event: any) => setValue(event.target.value);

    return (
        <div className="flex flex-col gap-5">
            <Radio label="Group 1" items={items} required={true} value={value} onChange={handleChange} />
            <Radio label="Group 2" items={items} variant={RadioVariant.Inactive} value={value} onChange={handleChange} />
        </div>
    );
};

export const RadioFieldComponent = () => {
    const [value, setValue] = useState('$0.00');
    const [customAmount, setCustomAmount] = useState('0.00');
    const handleChange = (event: any) => {
        if (event.target.value !== '$0.00') {
            setCustomAmount('0.00');
        }
        setValue(event.target.value);
    };
    const handleChangeCustom = (event: any) => setCustomAmount(event.target.value);

    const items: RadioItem[] = [
        {
            label: 'Option 0',
            value: '$0.00',
            subElement: (
                <Field
                    size={FieldSize.Small}
                    label="Custom amount"
                    leading="$"
                    type={FieldType.BaseActive}
                    value={customAmount}
                    onChange={handleChangeCustom}
                    maxLength={9}
                    onClick={() => setValue('$0.00')}
                    formatOptions={{
                        type: 'number',
                        format: '',
                        decimalPlaces: 2,
                    }}
                    min={0.0}
                    max={50000.0}
                />
            ),
        },
        {
            label: 'Option 1',
            value: '$9,000.00',
            subElement: (
                <div className="flex flex-col">
                    <FieldLabel label={'Cost basis'} labelTooltip="Cost basis yes" />
                    <Content details="$9,000.00" variant={ContentVariant.BodySm} contentClassName="flex" />
                </div>
            ),
        },
        {
            label: 'Option 2',
            value: '$25,000.00',
            subElement: (
                <div className="flex flex-col">
                    <FieldLabel label={'Coverage preservation limit'} labelTooltip="Coverage preservation limit yes" />
                    <Content details="$25,000.00" variant={ContentVariant.BodySm} contentClassName="flex" />
                </div>
            ),
        },
        {
            label: 'Option 3',
            value: '$50,000.00',
            subElement: (
                <div className="flex flex-col">
                    <FieldLabel label={'Maximum amount'} labelTooltip="Maximum amount yes" />
                    <Content details="$50,000.00" variant={ContentVariant.BodySm} contentClassName="flex" />
                </div>
            ),
        },
    ];

    return (
        <div className="flex flex-col gap-5">
            <Radio label="Money Money Money" items={items} required={true} value={value} onChange={handleChange} />
        </div>
    );
};
