import dayjs from 'dayjs';
import { isEmpty } from 'lodash';

import {
    DatesFilter,
    EventFilterKeys,
    EventFilters,
    HistoryFilters,
    PeopleFilters,
    PolicyFilters,
    TransactionFilters,
    YearFilters,
} from '@deps/contexts/HistoryFiltersContext';
import { determineRange } from '@deps/helpers/numbers.helpers';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { GetTransactionsSummaryProps } from '@deps/queries/tanstack/transactions/types';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';
import { TransactionStatus } from '@zinnia/api-types/types/sor';

export const getYearOptions = (policyIssueDate: string | undefined) => {
    const issueDate = dayjs(policyIssueDate);

    if (!issueDate.isValid()) {
        return [];
    }

    const year = dayjs().year();
    const years = determineRange(year, issueDate.year());
    const options = [
        { label: DEFAULT_ERROR_STRING, value: DEFAULT_ERROR_STRING },
    ];

    years.map((year) => {
        const yearStr = year.toString();

        options.push({ label: yearStr, value: yearStr });
    });

    return options;
};

export const hasFilter = (
    filter?:
        | 'all'
        | EventFilters
        | YearFilters
        | TransactionStatus
        | DatesFilter
        | null
) => {
    return !isNullEmptyOrUndefined(filter) && filter !== 'all';
};

export const getFilter = (eventFilter?: EventFilters) => {
    const [filterName, subfilterName] = hasFilter(eventFilter)
        ? Object.entries(eventFilter as EventFilters)[0]
        : [];

    return { filterName, subfilterName };
};

export const getFilterEnumKey = (filter: string) => {
    const enums = {
        [EventFilterKeys.People]: { ...PeopleFilters },
        [EventFilterKeys.Transactions]: { ...TransactionFilters },
        [EventFilterKeys.Policy]: { ...PolicyFilters },
    };

    // This finds the EventFilterKey enum property by the value or returns ALL when the subfilter is All
    for (const [key, value] of Object.entries(enums)) {
        if (
            filter !== EventFilterKeys.All &&
            Object.values(value).includes(filter)
        ) {
            return key;
        }
    }
    return EventFilterKeys.All;
};

// TODO: Use more type safe definitions
export const filterEventFilters = (
    state: EventFilters | undefined,
    filterKey: Exclude<EventFilterKeys, 'All'>,
    subfilter: string
) => {
    const newState = { ...state };
    if (Array.isArray(newState?.[filterKey])) {
        if (newState[filterKey].includes(subfilter)) {
            const filtered = newState[filterKey].filter(
                (filter: string) => filter !== subfilter
            );
            if (isEmpty(filtered)) {
                delete newState[filterKey];
                return newState;
            }
            return {
                ...newState,
                [filterKey]: filtered,
            };
        }
        return {
            ...newState,
            [filterKey]: [...newState[filterKey], subfilter],
        };
    }
    return {
        ...newState,
        [filterKey]: [subfilter],
    };
};

export const buildTransactionApiArgsFromFilters = (
    historyFilters: HistoryFilters
): Pick<GetTransactionsSummaryProps, 'year' | 'startDate' | 'endDate'> => {
    const args: Pick<
        GetTransactionsSummaryProps,
        'year' | 'startDate' | 'endDate'
    > = {};

    if (hasFilter(historyFilters?.yearFilter)) {
        args.year = dayjs(historyFilters.yearFilter).format('YYYY-01-01');
    }

    if (historyFilters?.datesFilter) {
        if (historyFilters?.datesFilter?.from) {
            args.startDate = dayjs(historyFilters.datesFilter.from).format(
                'YYYY-MM-DD'
            );
        }
        if (historyFilters?.datesFilter?.to) {
            args.endDate = dayjs(historyFilters.datesFilter.to).format(
                'YYYY-MM-DD'
            );
        }
    }

    return args;
};
