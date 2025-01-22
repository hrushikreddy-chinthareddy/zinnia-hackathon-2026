import dayjs from 'dayjs';
import { SeriesOptionsType } from 'highcharts';

import { DashboardStatsElementResponse } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';
import { DashboardSearchFilter } from '@deps/queries/cases';
import { getCaseDashboardStatsQuery } from '@deps/queries/tanstack/dashboard/dashboardQueries';

type TransformedData = {
    [key: string]: { [key: string]: number };
};

export const submissionTypeQuery = async (baseInsightQueryFilter: DashboardSearchFilter, groupBy: GroupByOptions[]) => {
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

// Application Type
export const transformData = (data: DashboardStatsElementResponse[]): TransformedData => {
    return data.reduce((result, item) => {
        const parentName = item.name; // "MASS"
        const childValues = item.values || []; // Array of { name: "Electronic", count: 6634 }, etc.

        result[parentName] = childValues.reduce((childResult, child) => {
            childResult[child.name] = child.count; // Map name to count
            return childResult;
        }, {} as Record<string, number>);

        return result;
    }, {} as TransformedData);
};

export const generateSeries = (transformedData: TransformedData): SeriesOptionsType[] => {
    const applicationTypeCategories = Object.keys(transformedData); // e.g., ["MASS", "ANOTHER"]

    // Find all unique application types (e.g., "Electronic", "Digital", "Paper")
    const allApplicationTypes = Array.from(new Set(applicationTypeCategories.flatMap(category => Object.keys(transformedData[category]))));

    // Create the series
    const series: SeriesOptionsType[] = allApplicationTypes.map(applicationType => {
        const data = applicationTypeCategories.map(category => {
            // Use 0 if the value for the applicationType is missing
            return transformedData[category][applicationType] || 0;
        });

        return {
            name: applicationType,
            type: 'bar',
            data,
        };
    });

    return series;
};

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
