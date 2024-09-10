import { Dispatch, SetStateAction, createContext, useContext, useMemo, useState } from 'react';

import { NOOP } from '@deps/types/constants';

export enum EventFilterKeys {
    All = 'all',
    Transactions = 'transactions',
    Policy = 'policy',
    People = 'people',
}

export enum PeopleFilters {
    All = 'all',
    Address = 'address',
    BankAccount = 'bankAccount',
    // CommunicationPreference = 'communicationPreference', BPB - TODO: DEPU-2218
    Email = 'email',
    Phone = 'phone',
}

export enum PolicyFilters {
    All = 'all',
    Anniversary = 'anniversary',
    Coverage = 'coverage',
    KeyDates = 'keyDates',
}

export enum TransactionFilters {
    All = 'all',
    Premiums = 'premiums',
    Loans = 'loans',
    Withdrawals = 'withdrawals',
}

export interface EventFilters {
    [EventFilterKeys.Policy]?: PolicyFilters;
    [EventFilterKeys.Transactions]?: TransactionFilters;
    [EventFilterKeys.People]?: PeopleFilters;
}

export type YearFilters = string;

export type AllFilters = EventFilterKeys | PolicyFilters | TransactionFilters | PeopleFilters;

export interface HistoryFilters {
    eventFilter?: EventFilters;
    yearFilter?: YearFilters;
}

export type SetHistoryFilters = Dispatch<SetStateAction<HistoryFilters>>;

interface HistoryFiltersProps {
    historyFilters: HistoryFilters;
    setHistoryFilters: SetHistoryFilters;
}

export const initialFilter: HistoryFilters = {};

export const HistoryFiltersContext = createContext<HistoryFiltersProps>({
    historyFilters: initialFilter,
    setHistoryFilters: NOOP,
});

export const HistoryFiltersProvider = ({ children }: any) => {
    const [historyFilters, setHistoryFilters] = useState(initialFilter);

    const memoizedValues = useMemo(() => ({ historyFilters, setHistoryFilters }), [historyFilters]);

    return <HistoryFiltersContext.Provider value={memoizedValues}>{children}</HistoryFiltersContext.Provider>;
};

export const useHistoryFiltersContext = (): HistoryFiltersProps => {
    return useContext(HistoryFiltersContext);
};
