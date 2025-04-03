import { FC } from 'react';

import { ChipRadio, RadioOption } from '@deps/components/chip-radio/chip-radio';
import { TimeframeFilterOptions } from '@deps/components/dashboard/utils';

import { CustomDateRange } from './custom-date-range';
interface TimeFilterProps {
    defaultValue: RadioOption['value'] | undefined;
    onRadioChange: (val: string) => void;
    timeframeOptions?: { [key: string]: string | undefined };
    controlledTimeValue?: RadioOption['value'];
    timerange: { from: string; to: string };
    handleTimerangeChange?: (value: { from: string; to: string }) => void;
}

export const TimeFilter: FC<TimeFilterProps> = ({
    defaultValue,
    onRadioChange,
    timeframeOptions,
    controlledTimeValue,
    timerange,
    handleTimerangeChange,
}) => {
    const options = timeframeOptions
        ? Object.values(timeframeOptions).map(option => ({
              label: option ?? '',
              ariaLabel: option ?? '',
              value: option ?? '',
              displayText: option ?? '',
          }))
        : Object.values(TimeframeFilterOptions).map(option => ({
              label: option ?? '',
              ariaLabel: option ?? '',
              value: option ?? '',
              displayText: option ?? '',
          }));

    return (
        <div>
            <CustomDateRange timerange={timerange} handleTimerangeChange={handleTimerangeChange} />
            <ChipRadio
                id="timeframe-select"
                options={options}
                defaultValue={defaultValue}
                onValueChange={onRadioChange}
                value={controlledTimeValue}
            />
        </div>
    );
};
