import dayjs from 'dayjs';
import { useMemo } from 'react';

import { dashboardChartTitleFormat } from '@deps/helpers/dashboard/dashboard-helpers';
import { Processes, Statuses } from '@deps/models/case/case';
import { getCaseDashboardStatsQuery } from '@deps/queries/tanstack/dashboard/dashboardQueries';
import {
    CaseCountGroupByEnum,
    CaseCountInputFilter,
    CaseCountOutputLevel1,
    ExceptionCountGroupByEnum,
    TaskCountGroupByEnum,
} from '@zinnia/api-types/types/analytics';

import { SimpleOption } from '../autocomplete/autocomplete.types';
import { ExtendedProcesses } from './filters/case-type-filter';

export enum TimeframeFilterOptions {
    LastWeek = '1W',
    Last1Month = '1M',
    Last3Months = '3M',
    Last6Months = '6M',
    Trailing12Months = '12M',
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
    [Statuses.Unresolved]: 'Unresolved',
    [Statuses.Resolved]: 'Resolved',
    [Statuses.Issued]: 'Issued',
};

export const defaultDateFormat = 'YYYY-MM-DD';

export const friendlyDateFormat = 'MMM D, YYYY';

export const startDates: Record<TimeframeFilterOptions, string> = {
    [TimeframeFilterOptions.Trailing12Months]: dayjs()
        .subtract(12, 'month')
        .format(defaultDateFormat),
    [TimeframeFilterOptions.Last6Months]: dayjs()
        .subtract(6, 'month')
        .format(defaultDateFormat),
    [TimeframeFilterOptions.Last3Months]: dayjs()
        .subtract(3, 'month')
        .format(defaultDateFormat),
    [TimeframeFilterOptions.Last1Month]: dayjs()
        .subtract(1, 'month')
        .format(defaultDateFormat),
    [TimeframeFilterOptions.LastWeek]: dayjs()
        .subtract(1, 'week')
        .format(defaultDateFormat),
};

export const getDateRangeText = (to: string, from: string) => {
    const startDate = dayjs(from).format(friendlyDateFormat);
    const endDate = to
        ? dayjs(to).format(friendlyDateFormat)
        : dayjs().format(friendlyDateFormat);
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
        const chunkStartIndex = chunkedResponseLengths
            .slice(0, index)
            .reduce((acc, val) => acc + val, 1);
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
export const formatProcessListOptions = (
    data: CaseCountOutputLevel1[] | undefined
) => {
    if (!data || !data.length) throw new Error('No data');
    return (
        data
            .reduce<SimpleOption[]>((prev, curr) => {
                if (
                    curr.name &&
                    !prev.some((item) => item.value === curr.name)
                ) {
                    prev.push({
                        value: curr.name,
                        label: `${dashboardChartTitleFormat(curr.name, false)}`,
                    });
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
export const createBaseQuery = async (
    baseInsightQueryFilter: CaseCountInputFilter,
    groupBy: CaseCountGroupByEnum[]
) => {
    const response = await getCaseDashboardStatsQuery(
        baseInsightQueryFilter,
        groupBy
    );
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
    [CaseCountGroupByEnum.CASE_RESULT]: '',
};

interface generateLinkArgs {
    process?: Processes | ExtendedProcesses | undefined;
    carrierOrProductName?: string;
    submissionMethod?: string;
    groupBy?: CaseCountGroupByEnum;
    carrier?: string[] | string | null;
    product?: string;
    brokerDealer?: string[] | null;
    createdDateStart?: string;
    createdDateEnd?: string;
    updatedDateStart?: string;
    updatedDateEnd?: string;
    status?: string[] | null;
    category?: string | null;
    reason?: string | null;
    detailedReason?: string | null;
    issueStatus?: string[] | null;
}

export const generateCaseLink = ({
    process,
    carrierOrProductName,
    submissionMethod,
    groupBy,
    carrier,
    product,
    brokerDealer,
    status,
    createdDateStart,
    createdDateEnd,
    updatedDateStart,
    updatedDateEnd,
    category,
    reason,
    detailedReason,
    issueStatus,
}: generateLinkArgs) => {
    const statuses = status?.join('&caseStatus=') || '';
    const carriers = Array.isArray(carrier)
        ? carrier?.join('&carrier=')
        : carrier;
    const issues = Array.isArray(issueStatus)
        ? issueStatus?.join('&issueStatus=')
        : issueStatus;
    const brokerDealers = brokerDealer?.join('&brokerDealerName=') || '';
    const method = submissionMethod
        ? submissionMethod === 'Electronic (E-App)'
            ? 'electronic'
            : 'paper'
        : '';

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
        queryParams.push(
            `brokerDealerName=${encodeURIComponent(brokerDealers)}`
        );
    }

    //  Add date field based on the prop passed
    if (createdDateStart) {
        queryParams.push(`createdDateStart=${createdDateStart}`);
    }
    if (createdDateEnd) {
        queryParams.push(`createdDateEnd=${createdDateEnd}`);
    }
    if (updatedDateStart) {
        queryParams.push(`updatedDateStart=${updatedDateStart}`);
    }
    if (updatedDateEnd) {
        queryParams.push(`updatedDateEnd=${updatedDateEnd}`);
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

    if (category) {
        queryParams.push(`category=${category.toLowerCase()}`);
    }

    if (reason) {
        queryParams.push(`reason=${reason.toLowerCase()}`);
    }

    if (detailedReason) {
        queryParams.push(
            `detailedReason=${encodeURIComponent(detailedReason.toLowerCase())}`
        );
    }

    if (issues) {
        queryParams.push(`issueStatus=${issues}`);
    }

    return `/cases?${queryParams.join('&')}`;
};

export const friendlyGroupByName: Record<
    CaseCountGroupByEnum | ExceptionCountGroupByEnum | TaskCountGroupByEnum,
    string
> = {
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
    [ExceptionCountGroupByEnum.EXCEPTION_DETAILED_REASON]:
        'Exception detailed reason',
    [ExceptionCountGroupByEnum.EXCEPTION_REASON]: 'Exception reason',
    [ExceptionCountGroupByEnum.EXCEPTION_CREATED_DAY]: 'Exception created date',
    [ExceptionCountGroupByEnum.EXCEPTION_UPDATED_DAY]: 'Exception updated date',
    [CaseCountGroupByEnum.CASE_RESULT]: '',
    [TaskCountGroupByEnum.TASK_CATEGORY]: 'Task category',
    [TaskCountGroupByEnum.TASK_NAME]: 'Task name',
    [TaskCountGroupByEnum.TASK_STATUS]: 'Task status',
    [TaskCountGroupByEnum.TASK_CREATED_DAY]: 'Task created date',
    [TaskCountGroupByEnum.TASK_UPDATED_DAY]: 'Task updated date',
};

/**
 * Custom React hook to filter user roles for use in API calls or filtering logic.
 *
 * @param role - The currently selected role. Can be a specific role (e.g., 'Call Center') or the string 'All'.
 * @param roles - An array of all available roles, each as a SimpleOption (typically { label: string, value: string }).
 *
 * @returns A string array of roles that can be used in the payload of the API:
 *   - If `role` is `'All'`, it returns all role values except `'All'`.
 *   - Otherwise, it returns an array containing just the selected role.
 *
 * Example:
 *
 * const rolesToPass = useUserRolesFilter({ role: 'All', roles: [ { value: 'All', label: 'All' },
    { value: 'Call Center', label: 'Call Center' },
    { value: 'Operations', label: 'Operations' },] });

 * // rolesToPass => ['Call Center', 'Operations]
 * ```
 */

export const useUserRolesFilter = ({
    role,
    roles,
}: {
    role: string;
    roles: SimpleOption[];
}) => {
    return useMemo(() => {
        if (role === 'All') {
            return roles
                .filter(({ value }) => value !== 'All')
                .map(({ value }) => value);
        }
        return [role];
    }, [role, roles]);
};
