import { friendlyGroupByName } from '@deps/components/dashboard/utils';
import { Statuses } from '@deps/models/case/case';
import { getCompletedTaskTimeData } from '@deps/queries/api/completed-task-times';
import { getDashboardExceptionStats } from '@deps/queries/api/exception-refs';
import { getTaskCountData } from '@deps/queries/api/tasks-volume-count';
import {
    CaseCountGroupByEnum,
    CaseCountInput,
    CaseCountInputFilter,
    CompletedCaseTimeGroupByEnum,
    CompletedCaseTimeInputFilter,
    ExceptionCountGroupByEnum,
    TaskCountGroupByEnum,
    TaskCountInputFilter,
    CompletedTaskTimeInputFilter,
    CompletedTaskTimeGroupByEnum,
} from '@zinnia/api-types/types/analytics';

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

export const getTaskCountQuery = async (
    baseFilter: TaskCountInputFilter,
    groupBy: TaskCountGroupByEnum[]
) => {
    const taskCountResponse = await getTaskCountData({
        filter: baseFilter,
        groupBy: groupBy,
    });

    if (
        !taskCountResponse ||
        'detail' in taskCountResponse ||
        !('data' in taskCountResponse)
    ) {
        throw taskCountResponse;
    }
    taskCountResponse.data = taskCountResponse.data
        .filter((item) => item.name !== null && item.name !== 'null')
        .map((item) => {
            // Handle empty names
            if (item.name === '') {
                const friendlyName = friendlyGroupByName[groupBy[0]];
                item.name = `No ${friendlyName.toLowerCase()} name`;
            }

            // Filter nested values as well
            if (item.values && item.values.length > 0) {
                item.values = item.values
                    .filter(
                        (value) => value.name !== null && value.name !== 'null'
                    )
                    .map((value) => {
                        // Handle empty or missing task names
                        if (value.name === '' || !value.name) {
                            value.name = 'Unknown task';
                        }
                        return value;
                    });
            }

            return item;
        });

    return taskCountResponse;
};

export const getCompletedTaskTimeQuery = async (
    baseFilter: CompletedTaskTimeInputFilter,
    groupBy: CompletedTaskTimeGroupByEnum[]
) => {
    const completedTaskTimesResponse = await getCompletedTaskTimeData({
        filter: baseFilter,
        groupBy: groupBy,
    });

    if (
        !completedTaskTimesResponse ||
        'detail' in completedTaskTimesResponse ||
        !('data' in completedTaskTimesResponse)
    ) {
        throw completedTaskTimesResponse;
    }

    completedTaskTimesResponse.data = completedTaskTimesResponse.data
        .filter((item) => item.name !== null && item.name !== 'null')
        .map((item) => {
            // Handle empty names
            if (item.name === '') {
                const friendlyName = friendlyGroupByName[groupBy[0]];
                item.name = `No ${friendlyName.toLowerCase()} name`;
            }

            // Filter nested values as well
            if (item.values && item.values.length > 0) {
                item.values = item.values
                    .filter(
                        (value) => value.name !== null && value.name !== 'null'
                    )
                    .map((value) => {
                        // Handle empty or missing task names
                        if (value.name === '' || !value.name) {
                            value.name = 'Unknown task';
                        }
                        return value;
                    });
            }

            // Sort tasks by total
            const sortedItem = {
                ...item,
                values: item?.values
                    ? [...item.values].sort((a, b) => b.count - a.count)
                    : [],
            };

            return sortedItem;
        });

    return completedTaskTimesResponse;
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
