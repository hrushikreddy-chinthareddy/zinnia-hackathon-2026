import {
    UserActivityGroupByEnum,
    UserActivityInputFilter,
    UserTransactionGroupByEnum,
    UserTransactionInputFilter,
    UserViewsGroupByEnum,
    UserViewsInputFilter,
} from '@xd/api-types/dist/generated-types/analytics';

import {
    friendlyGroupByName,
    friendlyGroupByNameForUserViews,
} from '@deps/components/usage/utils';
import { getUserActivityCounts } from '@deps/queries/api/user-actvity-count';
import { getUserTransactionCounts } from '@deps/queries/api/user-transaction-count';
import { getUserViewsCounts } from '@deps/queries/api/user-views-count';

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

export const getUserViewsCountsQuery = async (
    filter: UserViewsInputFilter,
    groupBy: UserViewsGroupByEnum[]
) => {
    const userViewsResponse = await getUserViewsCounts({
        filter,
        groupBy,
    });
    if (
        !userViewsResponse ||
        'detail' in userViewsResponse ||
        !('data' in userViewsResponse)
    ) {
        throw userViewsResponse;
    }
    userViewsResponse.data = userViewsResponse.data.map((item) => {
        if (item.name === '') {
            const friendlyName = friendlyGroupByNameForUserViews[groupBy[0]];
            item.name = `No ${friendlyName.toLowerCase()} name`;
        }
        return item;
    });
    return userViewsResponse;
};

export const getUserTransactionCountsQuery = async (
    filter: UserTransactionInputFilter,
    groupBy: UserTransactionGroupByEnum[]
) => {
    const userTransactionResponse = await getUserTransactionCounts({
        filter,
        groupBy,
    });
    if (
        !userTransactionResponse ||
        'detail' in userTransactionResponse ||
        !('data' in userTransactionResponse)
    ) {
        throw userTransactionResponse;
    }

    userTransactionResponse.data = userTransactionResponse.data.map((item) => {
        if (item.name === '') {
            item.name = 'Unknown';
        }
        return item;
    });

    return userTransactionResponse;
};
