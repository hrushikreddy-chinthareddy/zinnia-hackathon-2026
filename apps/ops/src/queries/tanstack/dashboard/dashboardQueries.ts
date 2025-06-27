import {
    CaseCountGroupByEnum,
    CaseCountInput,
    CaseCountInputFilter,
    CompletedCaseTimeGroupByEnum,
    CompletedCaseTimeInputFilter,
    ExceptionCountGroupByEnum,
} from '@zinnia/api-types/types/analytics';

import { friendlyGroupByName } from '@deps/components/dashboard/utils';
import { Statuses } from '@deps/models/case/case';
import { getDashboardExceptionStats } from '@deps/queries/api/exception-refs';

import { getCaseDashboardStats, getCaseTimingData } from '../../api/cases';

export const getCaseDashboardStatsQuery = async (
    baseFilter: CaseCountInputFilter,
    groupBy: CaseCountGroupByEnum[]
) => {
    const statsResponse = await getCaseDashboardStats({
        filter: baseFilter,
        groupBy,
    });
    if (
        !statsResponse ||
        'detail' in statsResponse ||
        !('data' in statsResponse)
    ) {
        throw statsResponse;
    }

    statsResponse.data = statsResponse.data
        .map((item) => {
            if (item.name === '') {
                const friendlyName = friendlyGroupByName[groupBy[0]];
                item.name = `No ${friendlyName.toLowerCase()} name`;
            }
            return item;
        })
        .sort((a, b) => b.count - a.count);

    return statsResponse;
};

export const getCaseDashboardTimingQuery = async (
    baseFilter: CompletedCaseTimeInputFilter,
    groupBy: CompletedCaseTimeGroupByEnum[]
) => {
    const statsResponse = await getCaseTimingData({
        filter: baseFilter,
        groupBy,
    });
    if (
        !statsResponse ||
        'detail' in statsResponse ||
        !('data' in statsResponse)
    ) {
        throw statsResponse;
    }

    statsResponse.data = statsResponse.data.map((item) => {
        if (item.name === '') {
            const friendlyName = friendlyGroupByName[groupBy[0]];
            item.name = `No ${friendlyName.toLowerCase()} name`;
        }
        return item;
    });

    return statsResponse.data;
};

export const getExceptionCountQuery = async (
    baseFilter: CaseCountInputFilter,
    groupBy: ExceptionCountGroupByEnum[]
) => {
    const exceptionResponse = await getDashboardExceptionStats({
        filter: baseFilter,
        groupBy,
    });
    if (
        !exceptionResponse ||
        'detail' in exceptionResponse ||
        !('data' in exceptionResponse)
    ) {
        throw exceptionResponse;
    }

    exceptionResponse.data = exceptionResponse.data.map((item) => {
        if (item.name === '') {
            const friendlyName = friendlyGroupByName[groupBy[0]];
            item.name = `No ${friendlyName.toLowerCase()} name`;
        }
        return item;
    });

    exceptionResponse.data = [...exceptionResponse.data].sort(
        (a, b) => b.count - a.count
    );

    return exceptionResponse;
};

/**************************
 * ****Sankey Chart Queries
 * *************************
 */

export const getStatsFromSelectionQuery = async (
    baseFilter: CaseCountInputFilter | undefined,
    l1SelectValue: CaseCountGroupByEnum,
    l2SelectValue: CaseCountGroupByEnum,
    l3SelectValue: CaseCountGroupByEnum
) => {
    const filter = Object.assign({}, baseFilter, {
        caseStatus: [
            Statuses.InProgress,
            Statuses.Exception,
            Statuses.NotStarted,
        ],
    });

    const query: CaseCountInput = {
        filter,
        groupBy: [l1SelectValue, l2SelectValue, l3SelectValue],
    };

    const statsResponse = await getCaseDashboardStats(query);
    if (
        !statsResponse ||
        'detail' in statsResponse ||
        !('data' in statsResponse)
    ) {
        throw statsResponse;
    }
    return statsResponse;
};
