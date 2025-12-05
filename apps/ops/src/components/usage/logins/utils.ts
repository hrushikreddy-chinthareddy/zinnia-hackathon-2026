import dayjs from 'dayjs';

import { groupDataByWeek } from '@deps/components/dashboard/charts/date-time-chart/dateTimeChartUtils';
import {
    UserActivityOutputLevel1,
    UserActivityOutputLevel3,
} from '@zinnia/api-types/types/analytics';

import { downloadCSV } from '../utils';

export const generateSeries = (
    loginsData: UserActivityOutputLevel1[] | undefined,
    timerange: { from: string; to: string },
    color: string[]
) => {
    if (!loginsData || !loginsData.length) return [];

    const fromDate = dayjs(timerange.from);
    const toDate = dayjs(timerange.to);
    const olderThanOneWeek = toDate.diff(fromDate, 'week') > 1;

    return loginsData.map((item, index) => {
        const data = olderThanOneWeek
            ? groupDataByWeek(item.values!)
            : item.values;
        return {
            type: 'line',
            name: item.name,
            color: color[index],
            data: data?.map((item: UserActivityOutputLevel3) => [
                dayjs(item.name).unix() * 1000,
                item.count,
            ]),
        };
    });
};

export const downloadUserActivityCSV = (
    data: UserActivityOutputLevel1[],
    filename = 'Usage-Logins.csv'
) => {
    const rows: string[] = ['Date,User Group,Count'];

    const userRoleEntries = data.filter((d) => d.key === 'userRole');

    for (const entry of userRoleEntries) {
        if (!Array.isArray(entry.values)) continue;

        const userGroup = entry.name;

        for (const activity of entry.values) {
            const [year, month, day] = activity.name.split('-');
            const formattedDate = `${parseInt(month)}/${parseInt(day)}/${year}`;
            rows.push(`${formattedDate},${userGroup},${activity.count}`);
        }
    }
    const csv = rows.join('\n');
    downloadCSV(csv, filename);
};
