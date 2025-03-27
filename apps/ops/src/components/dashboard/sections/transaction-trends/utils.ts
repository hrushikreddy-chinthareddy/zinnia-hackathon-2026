export enum TransactionTrendsTimeframe {
    Trailing12Months = '12M',
    Last6Months = '6M',
    Last90Days = '3M',
    Last60Days = '2M',
    LastMonth = '1M',
}

import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

import { TimeframeFilterOptions } from '@deps/components/dashboard/utils';
import { DashboardResponseData } from '@deps/queries/api/dashboard';

export const colors = ['#D385A5', '#BD85D3', '#8593D3', '#00628B', '#021936'];
dayjs.extend(isoWeek);

/**
 *
 * This series generator assumes that the 'name' value comes back as a string in the format of 'YYYY-MM-DD'
 * the data for the series it returns is like [[unixTimestamp, yValue], [unixTimestamp, yValue]] aka: [[x, y], [x, y]]
 *
 */
export const generateSeries = (transactionTrendsData: DashboardResponseData[] | undefined, timeframe: TimeframeFilterOptions) => {
    if (!transactionTrendsData || !transactionTrendsData.length) return [];
    const sortedByCount = transactionTrendsData.sort((a, b) => b.count - a.count);
    const top5 = sortedByCount.slice(0, 5);
    return top5.map((item, index) => {
        // TODO: In the future, we're going to support a custom date range. When that happens, we'll need to change the code to check
        // how much time is being requested, then possibly group the data slightly differently (ie, if custom range is a week, show the days, if its 3 months, show weekly grouping).
        const data = timeframe === TimeframeFilterOptions.LastWeek ? item.values : groupDataByWeek(item.values!);

        return {
            type: 'line',
            name: item.name,
            color: colors[index],
            data: data?.map(item => [dayjs(item.name).unix() * 1000, item.count]),
        };
    });
};

/**
 * Groups data objects by the week of the year based on their name values.
 * The name value in the returned object corresponds to the middle of the week.
 *
 * @param {DashboardResponseData[]} data - The array of data objects to be grouped.
 * @returns {DashboardResponseData[]} - The array of grouped data objects.
 *
 * @example
 * const sampleData = [
 *   { key: '1', name: '2024-05-20', count: 5 },
 *   { key: '2', name: '2024-05-21', count: 7 },
 *   { key: '3', name: '2023-04-01', count: 15 }
 * ];
 * const groupedData = groupDataByWeek(sampleData);
 * console.log(groupedData);
 * // Output:
 * // [
 * //   { key: '2', name: '2024-05-22', count: 12 },
 * //   { key: '3', name: '2023-04-04', count: 15 }
 * // ]
 */
export const groupDataByWeek = (data: DashboardResponseData[]): DashboardResponseData[] => {
    const weeklyCounts = new Map<string, { key: string; count: number }>(); // Map to store weekly counts

    data.forEach(item => {
        const date = dayjs(item.name); // Convert the name ('2023-04-01') to a Day.js object
        const weekStart = date.startOf('isoWeek'); // Get the start of the week for that day
        const weekMiddle = weekStart.add(3, 'day').format('YYYY-MM-DD'); // get the middle of the week for that day

        // Check if the middle of the week is already in the map
        if (weeklyCounts.has(weekMiddle)) {
            // If it is, update the count
            const current = weeklyCounts.get(weekMiddle)!;
            current.count += item.count;
            current.key = item.key;
        } else {
            // If it's not, add it
            weeklyCounts.set(weekMiddle, { key: item.key, count: item.count });
        }
    });

    const result: DashboardResponseData[] = [];
    // Convert the map back to an array
    weeklyCounts.forEach((value, name) => {
        result.push({ name, count: value.count, key: value.key });
    });

    return result;
};

//TODO: Support custom timeframe as well. Calculate how much time gets passed and categorize it somewhere in here
export const calculateTickInterval = (timeframe: TimeframeFilterOptions) => {
    const dailyTickInterval = 1 * 24 * 3600 * 1000;
    const weeklyTickInterval = 7 * 24 * 3600 * 1000;
    const monthlyTickInterval = 30 * 24 * 3600 * 1000;

    switch (timeframe) {
        case TimeframeFilterOptions.Trailing12Months:
            return monthlyTickInterval;
        case TimeframeFilterOptions.Last6Months:
            return monthlyTickInterval;
        case TimeframeFilterOptions.Last3Months:
            return monthlyTickInterval;
        case TimeframeFilterOptions.Last1Month:
            return weeklyTickInterval;
        case TimeframeFilterOptions.LastWeek:
            return dailyTickInterval;
    }
};

//TODO: Support custom timeframe. We will need to group and show a label depending on how long the custom range is.
export const calculateTooltipRanges = (tooltipContext: Highcharts.TooltipFormatterContextObject, timeframe: TimeframeFilterOptions) => {
    if (timeframe === TimeframeFilterOptions.LastWeek) return dayjs(tooltipContext.point.category).format('M/D/YYYY');

    const startOfWeek = dayjs(tooltipContext.point.category).startOf('week');
    const endOfWeek = dayjs(tooltipContext.point.category).endOf('week');

    return `Week of ${startOfWeek.format('M/D/YYYY')} - ${dayjs(endOfWeek).format('M/D/YYYY')}`;
};

export const getTooltipData = (points: Highcharts.TooltipFormatterContextObject[] | undefined) => {
    if (!points || points.length === 0) return { labelData: [], total: 0 };

    let total = 0;

    const labelData: Array<{
        label: string;
        count: number;
        color: string;
    }> = points.map(point => {
        total += point.y || 0;
        return {
            label: point.series.name,
            count: point.y || 0,
            color: (point.color as string) || '#000000',
        };
    });

    return { labelData, total };
};
