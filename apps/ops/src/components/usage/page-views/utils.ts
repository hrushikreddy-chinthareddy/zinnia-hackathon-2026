import {
    UserViewsOutputLevel1,
    UserViewsOutputLevel3,
} from '@xd/api-types/dist/generated-types/analytics';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { useTranslation } from 'react-i18next';

import { groupDataByWeek } from '@deps/components/dashboard/charts/date-time-chart/dateTimeChartUtils';
import { Timerange } from '@deps/components/dashboard/filters/time-filter/useTimeRangeFilter';
import { defaultDateFormat } from '@deps/components/dashboard/utils';
import { ZAHARA_DATE_FORMAT } from '@deps/helpers/date.helpers';

import { downloadCSV } from '../utils';

export enum TimeframeFilterOptions {
    Last6Months = '6M',
    Last3Months = '3M',
    Last1Month = '1M',
}

export const startDates: Record<TimeframeFilterOptions, string> = {
    [TimeframeFilterOptions.Last6Months]: dayjs()
        .subtract(6, 'month')
        .format(ZAHARA_DATE_FORMAT),
    [TimeframeFilterOptions.Last3Months]: dayjs()
        .subtract(3, 'month')
        .format(ZAHARA_DATE_FORMAT),
    [TimeframeFilterOptions.Last1Month]: dayjs()
        .subtract(1, 'month')
        .format(ZAHARA_DATE_FORMAT),
};

dayjs.extend(isoWeek);

export const roles = [
    { value: 'All', label: 'All' },
    { value: 'Call Center', label: 'Call Center' },
    { value: 'Operations', label: 'Operations' },
    { value: 'Selling Agent', label: 'Selling Agent' },
    { value: 'Zinnia User', label: 'Zinnia User' },
];

export const generateSeries = (
    loginsData: UserViewsOutputLevel1[] | undefined,
    timerange: { from: string; to: string },
    color: string[]
) => {
    if (!loginsData?.length) return [];

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
            data: data?.map((item: UserViewsOutputLevel3) => [
                dayjs(item.name).unix() * 1000,
                item.count,
            ]),
        };
    });
};

export const PrepareUserViewsCSV = (
    data: UserViewsOutputLevel1[],
    filename = 'Usage-Page-Views.csv'
) => {
    const rows: string[] = ['Date, Page Type, Total views'];

    for (const pageTypeEntry of data) {
        const pageType = pageTypeEntry.name;

        if (!Array.isArray(pageTypeEntry.values)) continue;

        for (const activity of pageTypeEntry.values) {
            const [year, month, day] = activity.name.split('-');
            const formattedDate = `${parseInt(month)}/${parseInt(day)}/${year}`;
            rows.push(`${formattedDate},${pageType},${activity.count}`);
        }
    }

    const csv = rows.join('\n');
    downloadCSV(csv, filename);
};

export const generateCSVFileName = (
    title: string,
    role: string,
    timerange: Timerange,
    optionaltitle?: string
) => {
    const { t } = useTranslation();
    const rolePart = role === 'All' ? 'All Roles' : role;
    const fromDate = dayjs(timerange.from).format(defaultDateFormat);
    const toDate = dayjs(timerange.to).format(defaultDateFormat);

    return `${t(title)} ${rolePart} ${t(
        optionaltitle || ''
    )} ${fromDate} to ${toDate}`;
};
