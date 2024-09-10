import dayjs from 'dayjs';

import {
    AllFilters,
    EventFilterKeys,
    EventFilters,
    SetHistoryFilters,
    YearFilters,
    initialFilter,
} from '@deps/contexts/HistoryFiltersContext';
import { determineRange } from '@deps/helpers/numbers.helper';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helper';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

export const getYearOptions = (policyIssueDate: string | undefined) => {
    const issueDate = dayjs(policyIssueDate);

    if (!issueDate.isValid()) {
        return [];
    }

    const year = dayjs().year();
    const years = determineRange(year, issueDate.year());
    const options = [{ label: DEFAULT_ERROR_STRING, value: DEFAULT_ERROR_STRING }];

    years.map(year => {
        const yearStr = year.toString();

        options.push({ label: yearStr, value: yearStr });
    });

    return options;
};

export const hasFilter = (filter?: 'all' | EventFilters | YearFilters | null) => {
    return !isNullEmptyOrUndefined(filter) && filter !== 'all';
};

export const getFilter = (eventFilter?: EventFilters) => {
    const [filterName, subfilterName] = hasFilter(eventFilter) ? Object.entries(eventFilter as EventFilters)[0] : [];

    return { filterName, subfilterName };
};

export const setFilter = (setHistoryFilters: SetHistoryFilters, filter: EventFilterKeys, subfilter: AllFilters) => {
    setHistoryFilters(prevState => ({
        ...prevState,
        eventFilter: {
            [filter]: subfilter,
        },
    }));
};

export const setYearFilter = (setHistoryFilters: SetHistoryFilters, year: YearFilters) => {
    setHistoryFilters(prevState => ({
        ...prevState,
        yearFilter: year,
    }));
};

export const removeAllFilters = (setHistoryFilters: SetHistoryFilters) => {
    setHistoryFilters(initialFilter);
};

export const removeEventFilter = (setHistoryFilters: SetHistoryFilters) => {
    setHistoryFilters(prevState => {
        const { eventFilter, ...updatedState } = prevState;
        return updatedState;
    });
};

export const removeYearFilter = (setHistoryFilters: SetHistoryFilters) => {
    setHistoryFilters(prevState => {
        const { yearFilter, ...updatedState } = prevState;
        return updatedState;
    });
};
