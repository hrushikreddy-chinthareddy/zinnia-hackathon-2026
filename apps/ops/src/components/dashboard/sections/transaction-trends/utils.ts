export enum TransactionTrendsTimeframe {
    Trailing12Months = '12M',
    Last6Months = '6M',
    Last90Days = '3M',
    Last60Days = '2M',
    LastMonth = '1M',
}

import { CaseCountOutputLevel1, CaseCountOutputLevel2 } from '@zinnia/api-types/types/analytics';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

import { DashboardResponseData } from '@deps/queries/api/dashboard';

export const colors = ['#D385A5', '#BD85D3', '#8593D3', '#00628B', '#021936'];
dayjs.extend(isoWeek);

/**
 *
 * This series generator assumes that the 'name' value comes back as a string in the format of 'YYYY-MM-DD'
 * the data for the series it returns is like [[unixTimestamp, yValue], [unixTimestamp, yValue]] aka: [[x, y], [x, y]]
 *
 */
export const generateSeries = (transactionTrendsData: CaseCountOutputLevel1[] | undefined, timerange: { from: string; to: string }) => {
    if (!transactionTrendsData || !transactionTrendsData.length) return [];
    const sortedByCount = transactionTrendsData.sort((a, b) => b.count - a.count);
    const top5 = sortedByCount.slice(0, 5);

    const fromDate = dayjs(timerange.from);
    const toDate = dayjs(timerange.to);
    const olderThanOneWeek = toDate.diff(fromDate, 'week') > 1;

    return top5.map((item, index) => {
        const data = olderThanOneWeek ? groupDataByWeek(item.values!) : item.values;

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
export const groupDataByWeek = (data: CaseCountOutputLevel1[] | CaseCountOutputLevel2[]): DashboardResponseData[] => {
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

export const calculateTickInterval = (timerange: { from: string; to: string }) => {
    const fromDate = dayjs(timerange.from);
    const toDate = dayjs(timerange.to);

    const duration = dayjs.duration(toDate.diff(fromDate));

    const daysDiff = duration.asDays();
    const dailyTickInterval = 1 * 24 * 3600 * 1000;
    const weeklyTickInterval = 7 * 24 * 3600 * 1000;
    const monthlyTickInterval = 30 * 24 * 3600 * 1000;

    if (daysDiff <= 7) return dailyTickInterval;
    if (daysDiff <= 30) return dailyTickInterval;
    if (daysDiff <= 100) return weeklyTickInterval;

    return monthlyTickInterval;
};

export const calculateTooltipRanges = (
    tooltipContext: Highcharts.TooltipFormatterContextObject,
    timerange: { from: string; to: string }
) => {
    const fromDate = dayjs(timerange.from);
    const toDate = dayjs(timerange.to);

    const duration = dayjs.duration(toDate.diff(fromDate));
    const daysDiff = duration.asDays();

    if (daysDiff <= 7) {
        return dayjs(tooltipContext.point.category).format('M/D/YYYY');
    }

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

export const calculateAverage = (count: number, timerange: { from: string; to: string }) => {
    const from = dayjs(timerange.from);
    const to = dayjs(timerange.to);

    const monthsDiff = to.diff(from, 'months');
    if (monthsDiff >= 1) {
        return Math.round(count / monthsDiff);
    }

    const numberOfDays = to.diff(from, 'days');
    return Math.round(count / numberOfDays);
};
