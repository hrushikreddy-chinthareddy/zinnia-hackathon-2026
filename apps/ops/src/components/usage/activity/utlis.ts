import {
    UserViewsOutputLevel1,
    UserViewsOutputLevel2,
} from '@xd/api-types/dist/generated-types/analytics';
import dayjs from 'dayjs';

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

export const getCategories = (data: UserViewsOutputLevel1[]) => {
    const processSet = new Set<string>();

    data.map((userRole) => {
        userRole.values?.map((process) => {
            processSet.add(process.name);
        });
    });

    return Array.from(processSet).sort((a, b) => a.localeCompare(b));
};

export const generateChartSeries = (
    data: UserViewsOutputLevel1[],
    categories: string[]
) => {
    const series = data
        .filter(
            (userRole) =>
                userRole.key === 'userRole' && userRole.name !== 'Undefined' // because for some reason the api contains a role called Undefined
        )
        .map((userRole) => {
            const processCountMap = new Map<string, number>();
            (userRole.values ?? [])
                .filter(
                    (process: UserViewsOutputLevel2) =>
                        process.key === 'process'
                )
                .map((process: UserViewsOutputLevel2) =>
                    processCountMap.set(process.name, process.count)
                );

            const dataInChart = categories.map(
                (category) => processCountMap.get(category) ?? 0
            );

            return {
                type: 'column',
                name: userRole.name,
                data: dataInChart,
            };
        });

    return series;
};

export const PrepareTransactionsByRoleCSV = (
    data: UserViewsOutputLevel1[],
    filename = 'Submitted Transaction By Role.csv'
) => {
    const rows: string[] = ['Role, Transaction, Total counts'];

    for (const userRole of data) {
        if (userRole.name !== 'Undefined') {
            // because for some reason the api contains a role called Undefined
            if (!Array.isArray(userRole.values)) continue;

            for (const activity of userRole.values) {
                rows.push(
                    `${userRole.name},${activity.name},${activity.count}`
                );
            }
        }
    }

    const csv = rows.join('\n');
    downloadCSV(csv, filename);
};
