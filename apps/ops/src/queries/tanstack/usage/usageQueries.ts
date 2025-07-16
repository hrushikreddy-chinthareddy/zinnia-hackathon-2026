import {
    UserActivityGroupByEnum,
    UserActivityInputFilter,
} from '@xd/api-types/dist/generated-types/analytics';

import { friendlyGroupByName } from '@deps/components/usage/utils';
import { getUserActivityCounts } from '@deps/queries/api/user-actvity-count';

export const getUserActivityCountsQuery = async (
    filter: UserActivityInputFilter,
    groupBy: UserActivityGroupByEnum[]
) => {
    const userActivityResponse = await getUserActivityCounts({
        filter,
        groupBy,
    });

    if (
        !userActivityResponse ||
        'detail' in userActivityResponse ||
        !('data' in userActivityResponse)
    ) {
        throw userActivityResponse;
    }
    userActivityResponse.data = userActivityResponse.data.map((item) => {
        if (item.name === '') {
            const friendlyName = friendlyGroupByName[groupBy[0]];
            item.name = `No ${friendlyName.toLowerCase()} name`;
        }
        return item;
    });
    return userActivityResponse;
};
