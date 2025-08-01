import {
    UserActivityGroupByEnum,
    UserViewsGroupByEnum,
} from '@xd/api-types/dist/generated-types/analytics';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import { Timerange } from '../dashboard/filters/time-filter/useTimeRangeFilter';
import { defaultDateFormat } from '../dashboard/utils';

export const friendlyGroupByName: Record<UserActivityGroupByEnum, string> = {
    [UserActivityGroupByEnum.ACTIVITY_DAY]: 'Activity day',
    [UserActivityGroupByEnum.SYSTEM_SOURCE]: 'System source',
    [UserActivityGroupByEnum.USER_ROLE]: 'User role',
    [UserActivityGroupByEnum.USER_STATUS]: 'User status',
};

export const friendlyGroupByNameForUserViews: Record<
    UserViewsGroupByEnum,
    string
> = {
    [UserViewsGroupByEnum.ACTIVITY_DAY]: 'Activity day',
    [UserViewsGroupByEnum.CARRIER]: 'Carrier',
    [UserViewsGroupByEnum.PAGE_TYPE]: 'Page Type',
    [UserViewsGroupByEnum.PROCESS]: 'Process',
    [UserViewsGroupByEnum.PROCESS_SUB_TYPE]: 'Process Sub Type',
    [UserViewsGroupByEnum.USER_ROLE]: 'User Role',
};

export const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const generateCSVFileName = (
    title: string,
    timerange: Timerange,
    role?: string,
    optionaltitle?: string
) => {
    const { t } = useTranslation();
    const rolePart = role === 'All' ? 'All Roles' : role;
    const fromDate = dayjs(timerange.from).format(defaultDateFormat);
    const toDate = dayjs(timerange.to).format(defaultDateFormat);

    return `${t(title)} ${rolePart || ''} ${t(
        optionaltitle || ''
    )} ${fromDate} to ${toDate}`;
};

export const colors = [
    '#00628B',
    '#072838',
    '#6CC2F6',
    '#D47ACC',
    '#C0C64F',
    '#F26003',
    '#E89510',
    '#DA021C',
    '#752671',
    '#489A9D',
    '#BB3D05',
    '#3A3E01',
    '#560F08',
    '#9D5400',
];
