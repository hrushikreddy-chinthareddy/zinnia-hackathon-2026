import {
    friendlyGroupByName,
    friendlyGroupByNameForUserViews,
} from '@deps/components/usage/utils';
import { getUserActivityCounts } from '@deps/queries/api/user-actvity-count';
import { getUserIllustrationActivityCount } from '@deps/queries/api/user-illustration-activity-count';
import { getUserTransactionCounts } from '@deps/queries/api/user-transaction-count';
import { getUserViewsCounts } from '@deps/queries/api/user-views-count';
import {
    UserActivityGroupByEnum,
    UserActivityInputFilter,
    UserIllustrationActivityGroupByEnum,
    UserIllustrationActivityInputFilter,
    UserTransactionGroupByEnum,
    UserTransactionInputFilter,
    UserViewsGroupByEnum,
    UserViewsInputFilter,
} from '@zinnia/api-types/types/analytics';

export const getUserActivityCountsQuery = async (
    filter: UserActivityInputFilter,
    groupBy: UserActivityGroupByEnum[]
) => {
    const userActivityResponse = await getUserActivityCounts({
        filter,
        groupBy,
    });

    if (!userActivityResponse || !('data' in userActivityResponse)) {
        throw new Error('userActivityResponse is undefined or empty');
    }
    const formattedData = userActivityResponse.data.map((item) => {
        if (item.name === '') {
            const friendlyName = friendlyGroupByName[groupBy[0]];
            item.name = `No ${friendlyName.toLowerCase()} name`;
        }
        return item;
    });

    return {
        ...userActivityResponse,
        data: formattedData,
    };
};

export const getUserViewsCountsQuery = async (
    filter: UserViewsInputFilter,
    groupBy: UserViewsGroupByEnum[]
) => {
    const userViewsResponse = await getUserViewsCounts({
        filter,
        groupBy,
    });
    if (!userViewsResponse || !('data' in userViewsResponse)) {
        throw new Error('userViewsResponse is undefined or empty');
    }
    const formattedData = userViewsResponse.data.map((item) => {
        if (item.name === '') {
            const friendlyName = friendlyGroupByNameForUserViews[groupBy[0]];
            item.name = `No ${friendlyName.toLowerCase()} name`;
        }
        return item;
    });

    return {
        ...userViewsResponse,
        data: formattedData,
    };
};

export const getUserTransactionCountsQuery = async (
    filter: UserTransactionInputFilter,
    groupBy: UserTransactionGroupByEnum[]
) => {
    const userTransactionResponse = await getUserTransactionCounts({
        filter,
        groupBy,
    });
    if (!userTransactionResponse || !('data' in userTransactionResponse)) {
        throw new Error('userTransactionResponse is undefined or empty');
    }

    const formattedData = userTransactionResponse.data.map((item) => {
        if (item.name === '') {
            item.name = 'Unknown';
        }
        return item;
    });

    return {
        ...userTransactionResponse,
        data: formattedData,
    };
};

export const getUserIllustrationActivityCountQuery = async (
    filter: UserIllustrationActivityInputFilter,
    groupBy: UserIllustrationActivityGroupByEnum[]
) => {
    const userTransactionResponse = await getUserIllustrationActivityCount({
        filter,
        groupBy,
    });
    if (!userTransactionResponse || !('data' in userTransactionResponse)) {
        throw new Error('userTransactionResponse is undefined or empty');
    }

    const formattedData = userTransactionResponse.data.map((item) => {
        if (!item?.name) {
            item.name = 'Unknown';
        }
        return item;
    });

    return {
        ...userTransactionResponse,
        data: formattedData,
    };
};
