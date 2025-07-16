export enum TransactionTrendsTimeframe {
    Trailing12Months = '12M',
    Last6Months = '6M',
    Last90Days = '3M',
    Last60Days = '2M',
    LastMonth = '1M',
}

import { CaseCountOutputLevel1 } from '@zinnia/api-types/types/analytics';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

import { groupDataByWeek } from '@deps/components/dashboard/charts/date-time-chart/dateTimeChartUtils';

export const colors = ['#D385A5', '#BD85D3', '#8593D3', '#00628B', '#021936'];
dayjs.extend(isoWeek);

/**
 *
 * This series generator assumes that the 'name' value comes back as a string in the format of 'YYYY-MM-DD'
 * the data for the series it returns is like [[unixTimestamp, yValue], [unixTimestamp, yValue]] aka: [[x, y], [x, y]]
 *
 */
export const generateSeries = (
    transactionTrendsData: CaseCountOutputLevel1[] | undefined,
    timerange: { from: string; to: string }
) => {
    if (!transactionTrendsData || !transactionTrendsData.length) return [];
    const sortedByCount = transactionTrendsData.sort(
        (a, b) => b.count - a.count
    );
    const top5 = sortedByCount.slice(0, 5);

    const fromDate = dayjs(timerange.from);
    const toDate = dayjs(timerange.to);
    const olderThanOneWeek = toDate.diff(fromDate, 'week') > 1;

    return top5.map((item, index) => {
        const data = olderThanOneWeek
            ? groupDataByWeek(item.values!)
            : item.values;

        return {
            type: 'line',
            name: item.name,
            color: colors[index],
            data: data?.map((item) => [
                dayjs(item.name).unix() * 1000,
                item.count,
            ]),
        };
    });
};

export const calculateAverage = (
    count: number,
    timerange: { from: string; to: string }
) => {
    const from = dayjs(timerange.from);
    const to = dayjs(timerange.to);

    const monthsDiff = to.diff(from, 'months');
    if (monthsDiff >= 1) {
        return Math.round(count / monthsDiff);
    }

    const numberOfDays = to.diff(from, 'days');
    return Math.round(count / numberOfDays);
};
