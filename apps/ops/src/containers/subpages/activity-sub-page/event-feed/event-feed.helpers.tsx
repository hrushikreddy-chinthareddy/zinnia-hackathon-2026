import { Transaction } from '@zinnia/api-types/types/sor';

import { hasFilter } from '@deps/components/history/filters/filter.helpers';
import {
    EventFilterKeys,
    EventFilters,
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
} from '@deps/helpers/transaction-types.helpers';

export interface Transactions {
    completed: Transaction[] | [];
    upcoming: Transaction[] | [];
}

export const getEvents = (
    eventFilter?: EventFilters,
    multiTransactionTypes = false
) => {
    if (!hasFilter(eventFilter) || eventFilter === undefined) {
        return allTransactionTypes;
    }
    const filters = Object.entries(eventFilter);

    if (multiTransactionTypes) {
        return filters
            .flatMap(([filterName, subfilterNames]) => {
                return subfilterNames.map((subfilterName: string) => {
                    const filter =
                        allTransactions[
                            filterName as keyof typeof allTransactions
                        ];
                    return filter[subfilterName as keyof typeof filter];
                });
            })
            .flat();
    } else {
        const [filterName, subfilterName] = filters[0];
        switch (filterName) {
            case EventFilterKeys.Policy:
                switch (subfilterName) {
                    case PolicyFilters.Anniversary:
                        return policyTransactions[PolicyFilters.Anniversary];
                    case PolicyFilters.Coverage:
                        return policyTransactions[PolicyFilters.Coverage];
                    case PolicyFilters.Fees:
                        return policyTransactions[PolicyFilters.Fees];
                    case PolicyFilters.KeyDates:
                        return policyTransactions[PolicyFilters.KeyDates];
                    default:
                        return policyTransactions.all;
                }

            case EventFilterKeys.Transactions:
                switch (subfilterName) {
                    case TransactionFilters.Loans:
                        return financialTransactions[TransactionFilters.Loans];
                    case TransactionFilters.Premiums:
                        return financialTransactions[
                            TransactionFilters.Premiums
                        ];
                    case TransactionFilters.SystematicPrograms:
                        return financialTransactions[
                            TransactionFilters.SystematicPrograms
                        ];
                    case TransactionFilters.Withdrawals:
                        return financialTransactions[
                            TransactionFilters.Withdrawals
                        ];
                    default:
                        return financialTransactions.all;
                }

            case EventFilterKeys.People:
                switch (subfilterName) {
                    case PeopleFilters.Address:
                        return peopleTransactions[PeopleFilters.Address];
                    case PeopleFilters.BankAccount:
                        return peopleTransactions[PeopleFilters.BankAccount];
                    case PeopleFilters.Beneficiary:
                        return peopleTransactions[PeopleFilters.Beneficiary];
                    case PeopleFilters.CommunicationPreference:
                        return peopleTransactions[
                            PeopleFilters.CommunicationPreference
                        ];
                    case PeopleFilters.Email:
                        return peopleTransactions[PeopleFilters.Email];
                    case PeopleFilters.Name:
                        return peopleTransactions[PeopleFilters.Name];
                    case PeopleFilters.Phone:
                        return peopleTransactions[PeopleFilters.Phone];
                    case PeopleFilters.Role:
                        return peopleTransactions[PeopleFilters.Role];
                    case PeopleFilters.TPD:
                        return peopleTransactions[PeopleFilters.TPD];
                    default:
                        return peopleTransactions.all;
                }
            case EventFilterKeys.All: {
                return allTransactionTypes;
            }

            default:
                return allTransactions.all;
        }
    }
};
