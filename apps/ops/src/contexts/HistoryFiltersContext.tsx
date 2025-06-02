import { TransactionStatus } from '@zinnia/api-types/types/sor';
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
    Beneficiary = 'beneficiary',
    CommunicationPreference = 'communicationPreference',
    Email = 'email',
    Name = 'name',
    Phone = 'phone',
    Role = 'role',
    TPD = 'tpd',
}

export enum PolicyFilters {
    All = 'all',
    Anniversary = 'anniversary',
    Coverage = 'coverage',
    Fees = 'fees',
    KeyDates = 'keyDates',
}

export enum TransactionFilters {
    All = 'all',
    Premiums = 'premiums',
    Loans = 'loans',
    SystematicPrograms = 'systematicPrograms',
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
    statusFilter?: TransactionStatus;
    yearFilter?: YearFilters;
}

export type SetHistoryFilters = Dispatch<SetStateAction<HistoryFilters>>;

interface HistoryFiltersProps {
    historyFilters: HistoryFilters;
    setHistoryFilters: SetHistoryFilters;
}

export const initialFilter: HistoryFilters = { statusFilter: TransactionStatus.COMPLETED };

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
