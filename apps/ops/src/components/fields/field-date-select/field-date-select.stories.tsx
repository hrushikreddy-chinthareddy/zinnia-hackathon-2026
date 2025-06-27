import '@deps/styles/styles.css';
import { Meta } from '@storybook/react';
import { useState } from 'react';

import { FieldSize } from '@deps/components/fields/field';

import FieldDateSelect from './field-date-select';

export default {
    title: 'Components/Field',
    component: FieldDateSelect,
    decorators: [
        (Story) => (
            <div className="max-w-[300px]">
                <Story />
            </div>
        ),
    ],
} as Meta<typeof FieldDateSelect>;

export const DateSelect = () => {
    const [value, setValue] = useState('');

    return (
        <FieldDateSelect
            value={value}
            size={FieldSize.Default}
            onChange={(e) => setValue(e.target.value)}
        />
    );
};
