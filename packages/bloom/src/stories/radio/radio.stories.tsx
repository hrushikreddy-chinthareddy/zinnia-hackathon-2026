import { Meta } from '@storybook/react';
import { useState } from 'react';

import Radio, { RadioItem, RadioVariant } from '../../components/radio/radio';

const meta: Meta<typeof Radio> = {
    title: 'Components/Radio',
    component: Radio,
    decorators: [
        Story => (
            <div className="container">
                <Story />
            </div>
        ),
    ],
};

export default meta;

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
