import { SimpleOption } from '@deps/components/select/select.helpers';
import { Statuses, CaseDashboardStatsResponse } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';

import { getCaseDashboardStats } from '../api/cases';
import { CaseDashboardStatsQuery, DashboardSearchFilter } from '../cases';

/*************************
 **** Active Applications Queries****
 **************************
 */

export const getProcessListOptions = async (createdDateStart: string) => {
    const baseDashboardQueryFilter: DashboardSearchFilter = {
        caseStatus: [Statuses.InProgress, Statuses.Exception, Statuses.NotStarted],
        createdDateStart,
    };
    const query: CaseDashboardStatsQuery = {
        filter: baseDashboardQueryFilter,
        groupBy: [GroupByOptions.Process],
    };
    const statsResponse = await getCaseDashboardStats(query);
    if (!statsResponse || 'status' in statsResponse) {
        throw statsResponse;
    }
    const listOptions = statsResponse.data
        .reduce<SimpleOption[]>((prev, curr) => {
            if (curr.name && !prev.some(item => item.value === curr.name)) {
                prev.push({ value: curr.name, label: curr.name });
            }
            return prev;
        }, [])
        .sort((item1, item2) => item1.label.localeCompare(item2.label));

    return listOptions;
};

export const getCountByCarrierInsightStats = async (baseInsightQueryFilter: DashboardSearchFilter) => {
    const query = {
        filter: baseInsightQueryFilter,
        groupBy: [GroupByOptions.Carrier],
    };
    const statsResponse = await getCaseDashboardStats(query);
    if (!statsResponse || 'status' in statsResponse) {
        throw statsResponse;
    }
    return statsResponse;
};

export const getCountBySubProcessInsightStats = async (baseInsightQueryFilter: DashboardSearchFilter) => {
    const query = {
        filter: baseInsightQueryFilter,
        groupBy: [GroupByOptions.ProcessSubType],
    };
    const statsResponse = await getCaseDashboardStats(query);
    if (!statsResponse || 'status' in statsResponse) {
        throw statsResponse;
    }
    return statsResponse;
};

export const getCreatedBySubProcessInsightStats = async (baseInsightQueryFilter: DashboardSearchFilter) => {
    const query = {
        filter: baseInsightQueryFilter,
        groupBy: [GroupByOptions.ProcessSubType, GroupByOptions.CreatedAt],
    };
    const statsResponse = await getCaseDashboardStats(query);
    if (!statsResponse || 'status' in statsResponse) {
        throw statsResponse;
    }
    return statsResponse;
};

export const getOpenExceptionCategoriesByCreatedInsightStats = async (baseInsightQueryFilter: DashboardSearchFilter) => {
    const query = {
        filter: baseInsightQueryFilter,
        groupBy: [GroupByOptions.CreatedAt, GroupByOptions.ExceptionCategory],
    };
    const statsResponse = await getCaseDashboardStats(query);
    if (!statsResponse || 'status' in statsResponse) {
        throw statsResponse;
    }
    return statsResponse;
};

export const getExceptionCategoryStats = async (baseInsightQueryFilter: DashboardSearchFilter) => {
    const query = {
        filter: baseInsightQueryFilter,
        groupBy: [GroupByOptions.ExceptionCategory],
    };
    const statsResponse = await getCaseDashboardStats(query);
    if (!statsResponse || 'status' in statsResponse) {
        throw statsResponse;
    }
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
    l3SelectValue: GroupByOptions,
    createdDateStart: string
) => {
    const filter: DashboardSearchFilter = Object.assign({}, baseFilter, {
        caseStatus: [Statuses.InProgress, Statuses.Exception, Statuses.NotStarted],
        createdDateStart,
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

/**************************
 * ****Issued Business Queries
 * *************************
 */

export const getCases = async (baseFilter: DashboardSearchFilter) => {
    const statsResponse = await getCaseDashboardStats({
        filter: baseFilter,
        groupBy: [GroupByOptions.ProcessSubType, GroupByOptions.ExceptionCategory],
    });

    if (!statsResponse || 'status' in statsResponse) {
        throw statsResponse;
    }

    return statsResponse;
};
