import { FC, useState } from 'react';

import { ChipRadio, RadioOption } from '@deps/components/chip-radio/chip-radio';

import { getDateRangeText, TimeframeFilterOptions } from '../utils';
interface TimeFilterProps {
    defaultValue: RadioOption['value'];
    onValueChange: (val: string) => void;
}

export const TimeFilter: FC<TimeFilterProps> = ({ defaultValue, onValueChange }) => {
    const [time, setTime] = useState(defaultValue);
    const timeframeOptions = Object.values(TimeframeFilterOptions).map(option => ({
        label: option,
        ariaLabel: option,
        value: option,
        displayText: option,
    }));

    const handleTimeChange = (val: string) => {
        setTime(val);
        onValueChange(val);
    };
    const timerangeText = getDateRangeText(time as TimeframeFilterOptions);
    return (
        <div>
            <p className="field-label text-right my-4">{timerangeText}</p>
            <ChipRadio id="timeframe-select" options={timeframeOptions} defaultValue={defaultValue} onValueChange={handleTimeChange} />
        </div>
    );
};
