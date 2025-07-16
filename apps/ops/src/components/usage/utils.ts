import { UserActivityGroupByEnum } from '@xd/api-types/dist/generated-types/analytics';

export const friendlyGroupByName: Record<UserActivityGroupByEnum, string> = {
    [UserActivityGroupByEnum.ACTIVITY_DAY]: 'Activity day',
    [UserActivityGroupByEnum.SYSTEM_SOURCE]: 'System source',
    [UserActivityGroupByEnum.USER_ROLE]: 'User role',
    [UserActivityGroupByEnum.USER_STATUS]: 'User status',
};
