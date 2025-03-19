import { FC, useState } from 'react';

import { ChipRadio, RadioOption } from '@deps/components/chip-radio/chip-radio';
import { getDateRangeText, TimeframeFilterOptions } from '@deps/components/dashboard/utils';
interface TimeFilterProps {
    defaultValue: RadioOption['value'];
    onValueChange: (val: string) => void;
    timeframeOptions?: { [key: string]: string };
    controlledTimeValue?: RadioOption['value'];
    controlledRangeText?: string;
}

export const TimeFilter: FC<TimeFilterProps> = ({
    defaultValue,
    onValueChange,
    timeframeOptions,
    controlledTimeValue,
    controlledRangeText,
}) => {
    const [time, setTime] = useState(defaultValue);
    const options = timeframeOptions
        ? Object.values(timeframeOptions).map(option => ({
              label: option,
              ariaLabel: option,
              value: option,
              displayText: option,
          }))
        : Object.values(TimeframeFilterOptions).map(option => ({
              label: option,
              ariaLabel: option,
              value: option,
              displayText: option,
          }));

    const handleTimeChange = (val: string) => {
        setTime(val);
        onValueChange(val);
    };
    const timerangeText =
        controlledRangeText || getDateRangeText((controlledTimeValue as TimeframeFilterOptions) || (time as TimeframeFilterOptions));
    return (
        <div>
            <p className="field-label text-right my-4">{timerangeText}</p>
            <ChipRadio
                id="timeframe-select"
                options={options}
                defaultValue={defaultValue}
                onValueChange={handleTimeChange}
                value={controlledTimeValue || time}
            />
        </div>
    );
};
