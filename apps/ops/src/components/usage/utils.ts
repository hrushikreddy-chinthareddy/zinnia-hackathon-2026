import {
    UserActivityGroupByEnum,
    UserViewsGroupByEnum,
} from '@xd/api-types/dist/generated-types/analytics';

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
