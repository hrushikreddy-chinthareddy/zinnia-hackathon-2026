import { Statuses, CaseDashboardStatsResponse, DashboardStatsElementResponse } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';

import { getCaseDashboardStats } from '../../api/cases';
import { CaseDashboardStatsQuery, DashboardSearchFilter } from '../../cases';

/**************************
 * ****General Case Dashboard Stats Query
 * You can use this for lots of the dashboard queries and just pass in filter and groupby
 * *************************
 */

const recursivelyFilter = (
    items: DashboardStatsElementResponse[],
    root: DashboardStatsElementResponse | null,
    filterString: string
): DashboardStatsElementResponse[] => {
    return items.filter(item => {
        if (item.name !== 'NOT_APPLICABLE') {
            if (item.values) {
                // Recursively process nested values, directly modifying them
                item.values = recursivelyFilter(item.values, item, filterString);
            }
            return true;
        } else {
            if (root) {
                root.count -= item.count; // Directly modify the root count
            }
            return false;
        }
    });
};

export const getCaseDashboardStatsQuery = async (baseFilter: DashboardSearchFilter, groupBy: GroupByOptions[]) => {
    const statsResponse = await getCaseDashboardStats({
        filter: baseFilter,
        groupBy,
    });
    if (!statsResponse || 'status' in statsResponse) {
        throw statsResponse;
    }

    // Recursively filter out objects with name: "NOT_APPLICABLE"

    const filteredData = recursivelyFilter(statsResponse.data || [], null, 'NOT_APPLICABLE');
    statsResponse.data = filteredData.sort((a, b) => b.count - a.count);

    return statsResponse;
};

/**************************
 * ****Sankey Chart Queries
 * *************************
 */

export const getStatsFromSelectionQuery = async (
    baseFilter: DashboardSearchFilter | undefined,
    l1SelectValue: GroupByOptions,
    l2SelectValue: GroupByOptions,
    l3SelectValue: GroupByOptions
) => {
    const filter: DashboardSearchFilter = Object.assign({}, baseFilter, {
        caseStatus: [Statuses.InProgress, Statuses.Exception, Statuses.NotStarted],
    });

    const query: CaseDashboardStatsQuery = {
        filter,
        groupBy: [l1SelectValue, l2SelectValue, l3SelectValue],
    };

    const statsResponse = await getCaseDashboardStats(query);
    if (!statsResponse || 'status' in statsResponse) {
        throw statsResponse;
    }
    return statsResponse as CaseDashboardStatsResponse;
};

/********************************
 * EXCEPTION SUMMARY QUERIES*****
 * ******************************
 */

export interface StatsDataResponse {
    data: {
        statsResponseData?: DashboardStatsElementResponse[];
        // exceptionData: MappedExceptionData;
    };
}

/**
 *
 * Get a bunch of stats response data and add to it. Then return the whole thing.
 */
export const getStatsData = async (filter: DashboardSearchFilter, groupBy: GroupByOptions[]) => {
    const statsResponse = await getCaseDashboardStats({
        filter,
        groupBy,
    });

    if (!statsResponse || 'status' in statsResponse) {
        throw statsResponse;
    }

    const filteredData = recursivelyFilter(statsResponse.data || [], null, 'NOT_APPLICABLE');
    statsResponse.data = filteredData.sort((a, b) => b.count - a.count);

    const { data: statsData } = { ...statsResponse };
    // Set up default data
    const parsedResponse: StatsDataResponse = {
        data: {
            statsResponseData: statsData,
        },
    };

    return parsedResponse;
};
