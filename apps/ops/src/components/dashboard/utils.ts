import dayjs from 'dayjs';

import { dashboardChartTitleFormat } from '@deps/helpers/dashboard/dashboard-helpers';
import { DashboardStatsElementResponse, Processes } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';
import { DashboardSearchFilter } from '@deps/queries/cases';
import { getCaseDashboardStatsQuery } from '@deps/queries/tanstack/dashboard/dashboardQueries';

import { SimpleOption } from '../autocomplete/autocomplete.types';
import { ExtendedProcesses } from './filters/case-type-filter';

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

/**
 *
 * Formats the time ranges into a friendly date format.
 */
export const getDateRangeText = (timeframe: TimeframeFilterOptions) => {
    const startDate = dayjs(startDates[timeframe]).format(friendlyDateFormat);
    const endDate = dayjs().format(friendlyDateFormat);
    return `${startDate} - ${endDate}`;
};

/**
 *
 * When generating a carousel of charts, this tells you which data indexes are shown for each chunk.
 * For instance, if you have 5 chunks, and 4 data points per chunk,
 * this will return an array of [{ start: 1, end: 5, total: 20 }, { start: 6, end: 10, total: 20 }, etc]
 */
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

/**
 *
 * formats select dropdown options for processes.
 */
export const formatProcessListOptions = (data: DashboardStatsElementResponse[] | undefined) => {
    if (!data || !data.length) throw new Error('No data');
    return (
        data
            .reduce<SimpleOption[]>((prev, curr) => {
                if (curr.name && !prev.some(item => item.value === curr.name)) {
                    prev.push({ value: curr.name, label: `${dashboardChartTitleFormat(curr.name, false)}` });
                }
                return prev;
            }, [])
            // alphabetize
            .sort((item1, item2) => item1.label.localeCompare(item2.label))
    );
};

/**
 *
 * The main API call for the dashboard we use in tanstack queries
 */
export const createBaseQuery = async (baseInsightQueryFilter: DashboardSearchFilter, groupBy: GroupByOptions[]) => {
    const response = await getCaseDashboardStatsQuery(baseInsightQueryFilter, groupBy);
    if (!response?.data) {
        console.error(
            'createBaseQuery::An error occurred while getting case dashboard stats results',
            response?.data?.length,
            JSON.stringify(response)
        );
        throw response;
    } else {
        return response;
    }
};

/**
 *
 * Takes in a process and returns it in an array. If extendedprocess.ALL, it returns an empty array
 */
export const formatProcessFilter = (process: Processes | ExtendedProcesses) => {
    return process === ExtendedProcesses.ALL ? [] : [process];
};
