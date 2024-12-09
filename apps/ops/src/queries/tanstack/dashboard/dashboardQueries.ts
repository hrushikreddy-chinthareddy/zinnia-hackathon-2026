import dayjs from 'dayjs';

import { SimpleOption } from '@deps/components/select/select.helpers';
import { getArrayIndexFromDate } from '@deps/helpers/date.helper';
import { Statuses, CaseDashboardStatsResponse, Processes, DashboardStatsElementResponse } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';

import { MappedExceptionData } from './types';
import { getCaseDashboardStats } from '../../api/cases';
import { CaseDashboardStatsQuery, DashboardSearchFilter } from '../../cases';

/**************************
 * ****Geneeral Case Dashboard Stats Query
 * You can use this for lots of the dashboard queries and just pass in filter and groupby
 * *************************
 */

export const getCaseDashboardStatsQuery = async (baseFilter: DashboardSearchFilter, groupBy: GroupByOptions[]) => {
    const statsResponse = await getCaseDashboardStats({
        filter: baseFilter,
        groupBy,
    });

    if (!statsResponse || 'status' in statsResponse) {
        throw statsResponse;
    }

    return statsResponse;
};

/*************************
 **** Active Applications Query****
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

/********************************
 * EXCEPTION SUMMARY QUERIES*****
 * ******************************
 */

interface ExceptionDataResponse {
    data: {
        statsResponseData: DashboardStatsElementResponse[];
        exceptionData: MappedExceptionData;
    };
}

/**
 *
 * Get a bunch of stats response data and add to it. Then return the whole thing.
 */
export const getExceptionData = async (
    createdDateStart: string,
    processSubType: string,
    carrierOrBrokerDealer = GroupByOptions.Carrier
) => {
    const filter: DashboardSearchFilter = {
        createdDateStart: createdDateStart,
        process: [Processes.NewBusiness],
        caseStatus: [Statuses.Completed],
        ...(processSubType ? { requestSubType: [processSubType] } : {}),
    };
    const statsResponse = await getCaseDashboardStats({
        filter,
        groupBy: [carrierOrBrokerDealer, GroupByOptions.ExceptionCategory, GroupByOptions.UpdatedAt],
    });

    if (!statsResponse || 'status' in statsResponse) {
        throw statsResponse;
    }

    const { data: statsData } = { ...statsResponse };
    // Get the number of elements we'll need for the charts based on current date and start date
    const maxDayIndex = getArrayIndexFromDate(dayjs().format('YYYY-MM-DD'), createdDateStart);
    const maxWeekIndex = getArrayIndexFromDate(dayjs().format('YYYY-MM-DD'), createdDateStart, 'week');
    const maxMonthIndex = getArrayIndexFromDate(dayjs().format('YYYY-MM-DD'), createdDateStart, 'month');

    // Set up default data
    const parsedResponse: ExceptionDataResponse = {
        data: {
            statsResponseData: statsData,
            exceptionData: {
                totalCasesByCarrier: {},
                total: {},
                daily: {},
                weekly: {},
                monthly: {},
                startMonth: dayjs(createdDateStart).month(),
                startYear: dayjs(createdDateStart).year(),
                carriers: [],
                exceptionCategories: [],
                totalMonths: maxMonthIndex + 1,
            },
        },
    };

    if (parsedResponse.data.statsResponseData.length) {
        parsedResponse.data.statsResponseData.forEach(carrierGroup => {
            const carrier = carrierGroup.name;
            parsedResponse.data.exceptionData.carriers.push(carrier);
            parsedResponse.data.exceptionData.totalCasesByCarrier[carrier] = carrierGroup.count;
            carrierGroup.values?.forEach(exceptionGroup => {
                // const exCat = exceptionGroup.name;
                // initialize the objects for the carrier
                parsedResponse.data.exceptionData.total[carrier] = 0;
                // Build up the arrays for daily and monthly charts (filled with nulls)
                parsedResponse.data.exceptionData.daily[carrier] = Array(maxDayIndex + 1)
                    .fill(null)
                    .map((_val, index) => [dayjs(createdDateStart).add(index, 'day').unix() * 1000, 0]);

                parsedResponse.data.exceptionData.weekly[carrier] = Array(maxWeekIndex + 1)
                    .fill(null)
                    .map(() => 0);
                parsedResponse.data.exceptionData.monthly[carrier] = Array(maxMonthIndex + 1).fill(null);

                let totalNigos = 0;
                exceptionGroup.values?.forEach(dayGroup => {
                    const dayIndex = getArrayIndexFromDate(dayGroup.name, createdDateStart);
                    const weekIndex = getArrayIndexFromDate(dayGroup.name, createdDateStart, 'week');
                    const monthIndex = getArrayIndexFromDate(dayGroup.name, createdDateStart, 'month');

                    if (dayGroup.count) {
                        totalNigos += dayGroup.count;
                        parsedResponse.data.exceptionData.total[carrier] += dayGroup.count;
                        parsedResponse.data.exceptionData.daily[carrier][dayIndex] = [
                            dayjs(dayGroup.name, 'YYYY-MM-DD').unix() * 1000,
                            dayGroup.count,
                        ];
                        (parsedResponse.data.exceptionData.weekly[carrier][weekIndex] =
                            dayGroup.count + (parsedResponse.data.exceptionData.weekly[carrier][weekIndex] || 0)),
                            (parsedResponse.data.exceptionData.monthly[carrier][monthIndex] =
                                dayGroup.count + (parsedResponse.data.exceptionData.monthly[carrier][monthIndex] || 0));
                    }
                });
                parsedResponse.data.exceptionData.total[carrier] = totalNigos;
            });
        });
        parsedResponse.data.exceptionData.carriers = parsedResponse.data.exceptionData.carriers.sort(
            (a, b) => parsedResponse.data.exceptionData.totalCasesByCarrier[b] - parsedResponse.data.exceptionData.totalCasesByCarrier[a]
        );
    }

    return parsedResponse;
};
