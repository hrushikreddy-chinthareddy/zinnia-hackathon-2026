import dayjs from 'dayjs';

import { dashboardChartTitleFormat } from '@deps/helpers/dashboard/dashboard-helpers';
import { DashboardStatsElementResponse } from '@deps/models/case/case';

import { SimpleOption } from '../autocomplete/autocomplete.types';

export enum TimeframeFilterOptions {
    Trailing12Months = '12M',
    Last6Months = '6M',
    Last3Months = '3M',
    Last1Month = '1M',
    LastWeek = '1W',
}

const defaultDateFormat = 'YYYY-MM-DD';

const friendlyDateFormat = 'MMM D, YYYY';

export const startDates: Record<TimeframeFilterOptions, string> = {
    [TimeframeFilterOptions.Trailing12Months]: dayjs().subtract(12, 'month').format(defaultDateFormat),
    [TimeframeFilterOptions.Last6Months]: dayjs().subtract(6, 'month').format(defaultDateFormat),
    [TimeframeFilterOptions.Last3Months]: dayjs().subtract(3, 'month').format(defaultDateFormat),
    [TimeframeFilterOptions.Last1Month]: dayjs().subtract(1, 'month').format(defaultDateFormat),
    [TimeframeFilterOptions.LastWeek]: dayjs().subtract(1, 'week').format(defaultDateFormat),
};

export const getDateRangeText = (timeframe: TimeframeFilterOptions) => {
    const startDate = dayjs(startDates[timeframe]).format(friendlyDateFormat);
    const endDate = dayjs().format(friendlyDateFormat);
    return `${startDate} - ${endDate}`;
};

export const generateCarouselDataLengths = (chunkedResponseLengths: number[]) =>
    chunkedResponseLengths.map((chunkLength, index) => {
        const total = chunkedResponseLengths.reduce((acc, val) => acc + val, 0);
        const chunkStartIndex = chunkedResponseLengths.slice(0, index).reduce((acc, val) => acc + val, 1);
        const chunkEndIndex = chunkStartIndex + chunkLength - 1;
        return {
            start: chunkStartIndex,
            end: chunkEndIndex,
            total,
        };
    });

export const formatProcessListOptions = (data: DashboardStatsElementResponse[] | undefined) => {
    if (!data || !data.length) throw new Error('No data');
    return (
        data
            .reduce<SimpleOption[]>((prev, curr) => {
                if (curr.name && !prev.some(item => item.value === curr.name)) {
                    prev.push({ value: curr.name, label: `${dashboardChartTitleFormat(curr.name, 16)} (${curr.count})` });
                }
                return prev;
            }, [])
            // alphabetize
            .sort((item1, item2) => item1.label.localeCompare(item2.label))
    );
};
