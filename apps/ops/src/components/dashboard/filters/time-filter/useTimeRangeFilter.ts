import dayjs from 'dayjs';
import { useState } from 'react';

import { defaultDateFormat } from '@deps/components/dashboard/utils';
export type Timerange = { from: string; to: string };

/**
 * useTimeRangeFilter is a custom hook that manages time-based filtering:

 * This hook can be used whenever we need to implment the time range filter similar to already used within case stats and usage.

 * ## Arguments:

 * - TimeframeFilterOptions : This will be an enum of the time range options
 * - `startDates` : This will be Record<TimeframeFilterOptions, string>

 * - `defaultOption` :
 *    The initial/default selected timeframe option.
 *
 * - `dateFormat` (string, optional):
 *    The format string used for parsing and formatting dates, defaults to `defaultDateFormat`.
 *
 * ## Returns 2 states and 2 functions which are everything needed to implement this filter.

 * ## Usage Example: Please refer the file ==> digital-experience-monorepo/apps/ops/src/components/dashboard/sections/issue-counts-by-status/context/issue-counts-by-status-context.tsx around line number 106
 */
export const useTimeRangeFilter = <TimeframeFilterOptions extends string>({
    startDates,
    defaultOption,
    dateFormat = defaultDateFormat,
}: {
    startDates: Record<TimeframeFilterOptions, string>;
    defaultOption: TimeframeFilterOptions;
    dateFormat?: string;
}) => {
    const [timeframeRadio, setTimeframeRadio] = useState<
        TimeframeFilterOptions | undefined
    >(defaultOption);
    const [timerange, setTimerange] = useState({
        from: timeframeRadio !== undefined ? startDates[timeframeRadio] : '',
        to: dayjs().format(dateFormat),
    });
    const handleTimeframeRadioChange = (value: TimeframeFilterOptions) => {
        setTimeframeRadio(value);
        setTimerange({
            from: startDates[value],
            to: dayjs().format(dateFormat),
        });
    };
    const handleRangeChange = (value: Timerange) => {
        setTimerange(value);
        setTimeframeRadio(undefined);
    };
    return {
        timeframeRadio,
        timerange,
        handleTimeframeRadioChange,
        handleRangeChange,
    };
};
