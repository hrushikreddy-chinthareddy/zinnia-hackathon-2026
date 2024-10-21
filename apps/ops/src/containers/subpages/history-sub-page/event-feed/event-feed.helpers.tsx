import dayjs from 'dayjs';
import { Dispatch, SetStateAction } from 'react';

import { hasFilter } from '@deps/components/history/filters/filter.helpers';
import {
    EventFilterKeys,
    EventFilters,
    HistoryFilters,
    PeopleFilters,
    PolicyFilters,
    TransactionFilters,
} from '@deps/contexts/HistoryFiltersContext';
import {
    allTransactions,
    allTransactionTypes,
    financialTransactions,
    peopleTransactions,
    policyTransactions,
} from '@deps/helpers/transaction-types.helper';
import { Policy, Transaction, TransactionStatus } from '@deps/models/policy/sor-policy';
import { getPolicyTransactions } from '@deps/queries/api/policies';

export interface Transactions {
    completed: Transaction[] | [];
    upcoming: Transaction[] | [];
}

interface GetTransactionsProps {
    historyFilters: HistoryFilters;
    policy: Policy;
    setIsLoading: Dispatch<SetStateAction<boolean>>;
    setTransactions: Dispatch<SetStateAction<Transactions>>;
}

export const getEvents = (eventFilter?: EventFilters) => {
    if (!hasFilter(eventFilter)) {
        return {
            completedTransactionTypes: allTransactionTypes,
            pendingTransactionTypes: allTransactionTypes,
        };
    }

    const values: string[] = [];

    const [filterName, subfilterName] = Object.entries(eventFilter as EventFilters)[0];

    switch (filterName) {
        case EventFilterKeys.Policy:
            switch (subfilterName) {
                case PolicyFilters.Anniversary:
                    return {
                        completedTransactionTypes: policyTransactions[PolicyFilters.Anniversary],
                        pendingTransactionTypes: policyTransactions[PolicyFilters.Anniversary],
                    };
                case PolicyFilters.Coverage:
                    return {
                        completedTransactionTypes: policyTransactions[PolicyFilters.Coverage],
                        pendingTransactionTypes: policyTransactions[PolicyFilters.Coverage],
                    };
                case PolicyFilters.Fees:
                    return {
                        completedTransactionTypes: policyTransactions[PolicyFilters.Fees],
                        pendingTransactionTypes: policyTransactions[PolicyFilters.Fees],
                    };
                case PolicyFilters.KeyDates:
                    return {
                        completedTransactionTypes: policyTransactions[PolicyFilters.KeyDates],
                        pendingTransactionTypes: policyTransactions[PolicyFilters.KeyDates],
                    };
                default:
                    return {
                        completedTransactionTypes: policyTransactions.all,
                        pendingTransactionTypes: policyTransactions.all,
                    };
            }

        case EventFilterKeys.Transactions:
            switch (subfilterName) {
                case TransactionFilters.Loans:
                    return {
                        completedTransactionTypes: financialTransactions[TransactionFilters.Loans],
                        pendingTransactionTypes: financialTransactions[TransactionFilters.Loans],
                    };
                case TransactionFilters.Premiums:
                    return {
                        completedTransactionTypes: financialTransactions[TransactionFilters.Premiums],
                        pendingTransactionTypes: financialTransactions[TransactionFilters.Premiums],
                    };
                case TransactionFilters.SystematicPrograms:
                    return {
                        completedTransactionTypes: financialTransactions[TransactionFilters.SystematicPrograms],
                        pendingTransactionTypes: financialTransactions[TransactionFilters.SystematicPrograms],
                    };
                case TransactionFilters.Withdrawals:
                    return {
                        completedTransactionTypes: financialTransactions[TransactionFilters.Withdrawals],
                        pendingTransactionTypes: financialTransactions[TransactionFilters.Withdrawals],
                    };
                default:
                    return {
                        completedTransactionTypes: financialTransactions.all,
                        pendingTransactionTypes: financialTransactions.all,
                    };
            }

        case EventFilterKeys.People:
            switch (subfilterName) {
                case PeopleFilters.Address:
                    return {
                        completedTransactionTypes: peopleTransactions[PeopleFilters.Address],
                        pendingTransactionTypes: peopleTransactions[PeopleFilters.Address],
                    };
                case PeopleFilters.BankAccount:
                    return {
                        completedTransactionTypes: peopleTransactions[PeopleFilters.BankAccount],
                        pendingTransactionTypes: peopleTransactions[PeopleFilters.BankAccount],
                    };
                case PeopleFilters.Beneficiary:
                    return {
                        completedTransactionTypes: peopleTransactions[PeopleFilters.Beneficiary],
                        pendingTransactionTypes: peopleTransactions[PeopleFilters.Beneficiary],
                    };
                case PeopleFilters.CommunicationPreference:
                    return {
                        completedTransactionTypes: peopleTransactions[PeopleFilters.CommunicationPreference],
                        pendingTransactionTypes: peopleTransactions[PeopleFilters.CommunicationPreference],
                    };
                case PeopleFilters.Email:
                    return {
                        completedTransactionTypes: peopleTransactions[PeopleFilters.Email],
                        pendingTransactionTypes: peopleTransactions[PeopleFilters.Email],
                    };
                case PeopleFilters.Name:
                    return {
                        completedTransactionTypes: peopleTransactions[PeopleFilters.Name],
                        pendingTransactionTypes: peopleTransactions[PeopleFilters.Name],
                    };
                case PeopleFilters.Phone:
                    return {
                        completedTransactionTypes: peopleTransactions[PeopleFilters.Phone],
                        pendingTransactionTypes: peopleTransactions[PeopleFilters.Phone],
                    };
                case PeopleFilters.Role:
                    return {
                        completedTransactionTypes: peopleTransactions[PeopleFilters.Role],
                        pendingTransactionTypes: peopleTransactions[PeopleFilters.Role],
                    };
                case PeopleFilters.TPD:
                    return {
                        completedTransactionTypes: peopleTransactions[PeopleFilters.TPD],
                        pendingTransactionTypes: peopleTransactions[PeopleFilters.TPD],
                    };
                default:
                    return {
                        completedTransactionTypes: peopleTransactions.all,
                        pendingTransactionTypes: peopleTransactions.all,
                    };
            }

        default:
            return {
                completedTransactionTypes: allTransactions.all,
                pendingTransactionTypes: allTransactions.all,
            };
    }
};

export const getTransactions = async ({ historyFilters, policy, setIsLoading, setTransactions }: GetTransactionsProps) => {
    setIsLoading(true);
    const { eventFilter, yearFilter } = historyFilters;
    const { completedTransactionTypes, pendingTransactionTypes } = getEvents(eventFilter);

    const [completedAndCanceledResults, pendingResults] = await Promise.all([
        getPolicyTransactions({
            transactionTypes: completedTransactionTypes,
            id: policy.policyNumber,
            limit: 30,
            offset: 0,
            planCode: policy.product?.planCode,
            status: 'Completed,Canceled' as TransactionStatus,
            ...(hasFilter(yearFilter) && { year: yearFilter }),
        }),
        getPolicyTransactions({
            transactionTypes: pendingTransactionTypes,
            id: policy.policyNumber,
            limit: 10,
            offset: 0,
            planCode: policy.product?.planCode,
            status: 'Pending' as TransactionStatus,
            sortOrder: 'DESC',
            ...(hasFilter(yearFilter) && { year: yearFilter }),
        }),
    ]);
    const combinedResults = [...(completedAndCanceledResults ?? [])].sort(
        (a, b) => dayjs(b.effectiveDate).unix() - dayjs(a.effectiveDate).unix()
    );

    setTransactions({
        completed: combinedResults ?? [],
        upcoming: pendingResults ?? [],
    });

    setIsLoading(false);
};
