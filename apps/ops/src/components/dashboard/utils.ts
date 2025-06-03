import {
    CaseCountGroupByEnum,
    CaseCountInputFilter,
    CaseCountOutputLevel1,
    ExceptionCountGroupByEnum,
} from '@zinnia/api-types/types/analytics';
import dayjs from 'dayjs';

import { dashboardChartTitleFormat } from '@deps/helpers/dashboard/dashboard-helpers';
import { Processes, Statuses } from '@deps/models/case/case';
import { getCaseDashboardStatsQuery } from '@deps/queries/tanstack/dashboard/dashboardQueries';

import { SimpleOption } from '../autocomplete/autocomplete.types';
import { ExtendedProcesses } from './filters/case-type-filter';

export enum TimeframeFilterOptions {
    Trailing12Months = '12M',
    Last6Months = '6M',
    Last3Months = '3M',
    Last1Month = '1M',
    LastWeek = '1W',
}

export const caseStatusMap = {
    [Statuses.InProgress]: 'In progress',
    [Statuses.Exception]: 'Not in good order',
    [Statuses.NotStarted]: 'Not started',
    [Statuses.Completed]: 'Completed',
    [Statuses.Canceled]: 'Canceled',
    [Statuses.New]: 'New',
    [Statuses.Overridden]: 'Overridden',
    [Statuses.Withdrawn]: 'Withdrawn',
    [Statuses.Inprogress]: 'In progress',
    [Statuses.Pending]: 'Pending',
};

export const defaultDateFormat = 'YYYY-MM-DD';

export const friendlyDateFormat = 'MMM D, YYYY';

export const startDates: Record<TimeframeFilterOptions, string> = {
    [TimeframeFilterOptions.Trailing12Months]: dayjs().subtract(12, 'month').format(defaultDateFormat),
    [TimeframeFilterOptions.Last6Months]: dayjs().subtract(6, 'month').format(defaultDateFormat),
    [TimeframeFilterOptions.Last3Months]: dayjs().subtract(3, 'month').format(defaultDateFormat),
    [TimeframeFilterOptions.Last1Month]: dayjs().subtract(1, 'month').format(defaultDateFormat),
    [TimeframeFilterOptions.LastWeek]: dayjs().subtract(1, 'week').format(defaultDateFormat),
};

export const getDateRangeText = (to: string, from: string) => {
    const startDate = dayjs(from).format(friendlyDateFormat);
    const endDate = to ? dayjs(to).format(friendlyDateFormat) : dayjs().format(friendlyDateFormat);
    return `${startDate} - ${endDate}`;
};

/**
 *
 * When generating a carousel of charts, this tells you which data indexes are shown for each chunk.
 * For instance, if you have 5 chunks, and 4 data points per chunk,
 * this will return an array of [{ start: 1, end: 5, total: 20 }, { start: 6, end: 10, total: 20 }, etc]
 */
export const generateCarouselDataLengths = (chunkedResponseLengths: number[]) =>
    chunkedResponseLengths.map((chunkLength, index) => {
        const total = chunkedResponseLengths.reduce((acc, val) => acc + val, 0);
        const chunkStartIndex = chunkedResponseLengths.slice(0, index).reduce((acc, val) => acc + val, 1);
        const chunkEndIndex = chunkStartIndex + chunkLength - 1;
        return {
            start: chunkStartIndex,
            end: chunkEndIndex,
            total,
        };
    });

/**
 *
 * formats select dropdown options for processes.
 */
export const formatProcessListOptions = (data: CaseCountOutputLevel1[] | undefined) => {
    if (!data || !data.length) throw new Error('No data');
    return (
        data
            .reduce<SimpleOption[]>((prev, curr) => {
                if (curr.name && !prev.some(item => item.value === curr.name)) {
                    prev.push({ value: curr.name, label: `${dashboardChartTitleFormat(curr.name, false)}` });
                }
                return prev;
            }, [])
            // alphabetize
            .sort((item1, item2) => item1.label.localeCompare(item2.label))
    );
};

/**
 *
 * The main API call for the dashboard we use in tanstack queries
 */
export const createBaseQuery = async (baseInsightQueryFilter: CaseCountInputFilter, groupBy: CaseCountGroupByEnum[]) => {
    const response = await getCaseDashboardStatsQuery(baseInsightQueryFilter, groupBy);
    if (!response?.data) {
        console.error(
            'createBaseQuery::An error occurred while getting case dashboard stats results',
            response?.data?.length,
            JSON.stringify(response)
        );
        throw response;
    } else {
        return response;
    }
};

/**
 *
 * Takes in a process and returns it in an array. If extendedprocess.ALL, it returns an empty array
 */
export const formatProcessFilter = (process: Processes | ExtendedProcesses) => {
    return process === ExtendedProcesses.ALL ? [] : [process];
};

export const groupByUrlMap: Record<CaseCountGroupByEnum, string> = {
    [CaseCountGroupByEnum.PROCESS]: 'process',
    [CaseCountGroupByEnum.PROCESS_SUB_TYPE]: 'requestSubType',
    [CaseCountGroupByEnum.CARRIER]: 'carrier',
    [CaseCountGroupByEnum.BROKER_DEALER_NAME]: 'brokerDealerName',
    [CaseCountGroupByEnum.PRODUCT_NAME]: 'productName',
    [CaseCountGroupByEnum.CREATED_DAY]: 'createdDate',
    [CaseCountGroupByEnum.UPDATED_DAY]: 'updatedDate',
    [CaseCountGroupByEnum.APPLICATION_TYPE]: 'applicationType',
    [CaseCountGroupByEnum.CASE_STATUS]: 'caseStatus',
};

interface generateLinkArgs {
    process?: Processes | ExtendedProcesses | undefined;
    carrierOrProductName?: string;
    submissionMethod?: string;
    startDate?: string;
    endDate?: string;
    groupBy?: CaseCountGroupByEnum;
    carrier?: string[] | string | null;
    product?: string;
    brokerDealer?: string[] | null;
    status?: string[] | undefined | null;
}

export const generateCaseLink = ({
    process,
    carrierOrProductName,
    submissionMethod,
    startDate,
    endDate,
    groupBy,
    carrier,
    product,
    brokerDealer,
    status,
}: generateLinkArgs) => {
    const statuses = status?.join('&caseStatus=') || '';
    const carriers = Array.isArray(carrier) ? carrier?.join('&carrier=') : carrier;
    const brokerDealers = brokerDealer?.join('&brokerDealerName=') || '';
    const method = submissionMethod ? (submissionMethod === 'Electronic (E-App)' ? 'electronic' : 'paper') : '';

    const queryParams = [];

    if (process && process !== 'all') {
        queryParams.push(`process=${process}`);
    }

    // Only add this if users aren't grouping by carrier
    if (carriers && groupBy !== CaseCountGroupByEnum.CARRIER) {
        queryParams.push(`carrier=${carriers}`);
    }
    if (product) {
        queryParams.push(`requestSubType=${product}`);
    }

    // Only add this if users aren't grouping by broker dealer
    if (brokerDealers && groupBy !== CaseCountGroupByEnum.BROKER_DEALER_NAME) {
        queryParams.push(`brokerDealerName=${brokerDealers}`);
    }
    if (startDate) {
        queryParams.push(`createdDateStart=${startDate}`);
    }
    if (endDate) {
        queryParams.push(`createdDateEnd=${endDate}`);
    }
    if (statuses) {
        queryParams.push(`caseStatus=${statuses}`);
    }

    // If we're grouping by something specific, we prefer that over global things like broker dealer or carrier
    if (groupBy) {
        const groupByParam = groupByUrlMap[groupBy];
        if (carrierOrProductName) {
            queryParams.push(`${groupByParam}=${carrierOrProductName}`);
        }
    }
    if (method) {
        queryParams.push(`applicationType=${method}`);
    }

    return `/cases?${queryParams.join('&')}`;
};

export const friendlyGroupByName: Record<CaseCountGroupByEnum | ExceptionCountGroupByEnum, string> = {
    [CaseCountGroupByEnum.APPLICATION_TYPE]: 'Application type',
    [CaseCountGroupByEnum.BROKER_DEALER_NAME]: 'Distribution partner',
    [CaseCountGroupByEnum.PRODUCT_NAME]: 'Product',
    [CaseCountGroupByEnum.CARRIER]: 'Carrier',
    [CaseCountGroupByEnum.PROCESS_SUB_TYPE]: 'Case subtype',
    [CaseCountGroupByEnum.CASE_STATUS]: 'Case status',
    [CaseCountGroupByEnum.PROCESS]: 'Process',
    [CaseCountGroupByEnum.CREATED_DAY]: 'Created date',
    [CaseCountGroupByEnum.UPDATED_DAY]: 'Updated date',
    [ExceptionCountGroupByEnum.EXCEPTION_CATEGORY]: 'Exception category',
};
