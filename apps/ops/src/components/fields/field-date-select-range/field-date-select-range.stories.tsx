import '@deps/styles/styles.css';
import { Meta } from '@storybook/react';
import dayjs from 'dayjs';
import { useState } from 'react';

import { NUMERIC_DATE_FORMAT } from '@deps/types/constants';

import FieldDateSelectRange from './field-date-select-range';

export default {
    title: 'Components/Field',
    component: FieldDateSelectRange,
    decorators: [
        Story => (
            <div className="max-w-[575px]">
                <Story />
            </div>
        ),
    ],
} as Meta<typeof FieldDateSelectRange>;

export const DateRangeSelect = () => {
    const [startValue, setStartValue] = useState('');
    const [endValue, setEndValue] = useState('');

    const startOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStartValue = e.target.value;
        setStartValue(newStartValue);

        const isAfter = dayjs(newStartValue, NUMERIC_DATE_FORMAT).isAfter(dayjs(endValue, NUMERIC_DATE_FORMAT));
        if (isAfter) {
            setEndValue('');
        }
    };

    const endOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEndValue = e.target.value;

        const isBefore = dayjs(newEndValue, NUMERIC_DATE_FORMAT).isBefore(dayjs(startValue, NUMERIC_DATE_FORMAT));
        if (isBefore) {
            setStartValue(newEndValue);
            setEndValue('');
        } else {
            setEndValue(newEndValue);
        }
    };

    return (
        <FieldDateSelectRange
            startValue={startValue}
            endValue={endValue}
            startLabel={'Start'}
            endLabel={'End'}
            startOnChange={startOnChange}
            endOnChange={endOnChange}
            closeOnDateSelect={true}
        />
    );
};
