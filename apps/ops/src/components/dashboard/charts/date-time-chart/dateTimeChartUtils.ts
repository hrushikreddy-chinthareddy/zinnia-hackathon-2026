import dayjs from 'dayjs';

import { DashboardResponseData } from '@deps/queries/api/dashboard';

interface GroupByDataArgs {
    name: string;
    count: number;
    key: string;
    values?: Array<GroupByDataArgsLevel1> | null;
}
interface GroupByDataArgsLevel1 {
    name: string;
    count: number;
    key: string;
    values?: Array<GroupByDataArgsLevel2> | null;
}
interface GroupByDataArgsLevel2 {
    name: string;
    count: number;
    key: string;
}

// /**
//  * Groups data objects by the week of the year based on their name values.
//  * The name value in the returned object corresponds to the middle of the week.
//  *
//  * @param {DashboardResponseData[]} data - The array of data objects to be grouped.
//  * @returns {DashboardResponseData[]} - The array of grouped data objects.
//  *
//  * @example
//  * const sampleData = [
//  *   { key: '1', name: '2024-05-20', count: 5 },
//  *   { key: '2', name: '2024-05-21', count: 7 },
//  *   { key: '3', name: '2023-04-01', count: 15 }
//  * ];
//  * const groupedData = groupDataByWeek(sampleData);
//  * console.log(groupedData);
//  * // Output:
//  * // [
//  * //   { key: '2', name: '2024-05-22', count: 12 },
//  * //   { key: '3', name: '2023-04-04', count: 15 }
//  * // ]
//  */
export const groupDataByWeek = (
    data: GroupByDataArgs[] | GroupByDataArgsLevel1[]
): DashboardResponseData[] => {
    const weeklyCounts = new Map<string, { key: string; count: number }>(); // Map to store weekly counts
    if (!data || !data.length) return [];
    data.forEach((item) => {
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

export const calculateTickInterval = (timerange: {
    from: string;
    to: string;
}) => {
    const fromDate = dayjs(timerange.from);
    const toDate = dayjs(timerange.to);
    const daysDiff = toDate.diff(fromDate, 'day');

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

    const daysDiff = toDate.diff(fromDate, 'day');

    if (daysDiff <= 7) {
        return dayjs(tooltipContext.point.category).format('M/D/YYYY');
    }

    const startOfWeek = dayjs(tooltipContext.point.category).startOf('week');
    const endOfWeek = dayjs(tooltipContext.point.category).endOf('week');

    return `Week of ${startOfWeek.format('M/D/YYYY')} - ${dayjs(
        endOfWeek
    ).format('M/D/YYYY')}`;
};

export const getTooltipData = (
    points: Highcharts.TooltipFormatterContextObject[] | undefined
) => {
    if (!points || points.length === 0) return { labelData: [], total: 0 };

    let total = 0;

    const labelData: Array<{
        label: string;
        count: number;
        color: string;
    }> = points.map((point) => {
        total += point.y || 0;
        return {
            label: point.series.name,
            count: point.y || 0,
            color: (point.color as string) || '#000000',
        };
    });

    return { labelData, total };
};

export const xAxisLabelFormatter = (
    label: Highcharts.AxisLabelsFormatterContextObject
) => {
    const day = dayjs(label.value).format('MM/DD');

    return day || '';
};
