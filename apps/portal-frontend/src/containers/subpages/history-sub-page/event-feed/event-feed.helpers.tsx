import dayjs from 'dayjs';
import { Dispatch, SetStateAction } from 'react';

import CardInfo from '@deps/components/card/card-info/card-info';
import { hasFilter } from '@deps/components/history/filters/filter.helpers';
import HistoryEventCard from '@deps/components/history-event-card/history-event-card';
import { getEventCardValues } from '@deps/components/history-event-card/history-event-card.helper';
import {
    EventFilterKeys,
    EventFilters,
    HistoryFilters,
    PeopleFilters,
    PolicyFilters,
    TransactionFilters,
} from '@deps/contexts/HistoryFiltersContext';
import {
    allCompletedTransactionTypes,
    allPendingTransactionTypes,
    completedTransactionTypes,
    pendingTransactionTypes,
} from '@deps/helpers/transaction-types.helper';
import { Policy, Status, Transaction, TransactionStatus, TransactionType } from '@deps/models/policy/sor-policy';
import { getPolicyTransactions } from '@deps/queries/api/policies';
import { ReactComponent as HistoryEvent } from '@deps/styles/elements/icons/content/history-event.svg';

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
            completedTransactionTypes: allCompletedTransactionTypes,
            pendingTransactionTypes: allPendingTransactionTypes,
        };
    }

    const [filterName, subfilterName] = Object.entries(eventFilter as EventFilters)[0];

    switch (filterName) {
        case EventFilterKeys.Policy:
            switch (subfilterName) {
                case PolicyFilters.Anniversary:
                    return {
                        completedTransactionTypes: [TransactionType.Anniversary],
                        pendingTransactionTypes: [TransactionType.Anniversary],
                    };
                case PolicyFilters.Coverage:
                    return {
                        completedTransactionTypes: [TransactionType.DeathClaim],
                        pendingTransactionTypes: [TransactionType.DeathClaim],
                    };
                case PolicyFilters.KeyDates:
                    return {
                        completedTransactionTypes: [TransactionType.Activation, TransactionType.Lapse],
                        pendingTransactionTypes: [TransactionType.Activation, TransactionType.Lapse],
                    };
                default:
                    return {
                        completedTransactionTypes: [
                            TransactionType.Activation,
                            TransactionType.Anniversary,
                            TransactionType.DeathClaim,
                            TransactionType.Lapse,
                        ],
                        pendingTransactionTypes: [
                            TransactionType.Activation,
                            TransactionType.Anniversary,
                            TransactionType.DeathClaim,
                            TransactionType.Lapse,
                        ],
                    };
            }

        case EventFilterKeys.Transactions:
            switch (subfilterName) {
                case TransactionFilters.Loans:
                    return {
                        completedTransactionTypes: [
                            'LoanRepaymentOneTime' as TransactionType,
                            TransactionType.SystematicLoanRepayment,
                            TransactionType.NewLoan,
                        ],
                        pendingTransactionTypes: [
                            TransactionType.PaymentLoanRepaymentOneTime,
                            TransactionType.PaymentSystematicLoanRepayment,
                            TransactionType.NewLoan,
                        ],
                    };
                case TransactionFilters.Premiums:
                    return {
                        completedTransactionTypes: [
                            TransactionType.InitialPremium,
                            TransactionType.SubsequentPremium,
                            TransactionType.OneTimePremium,
                            TransactionType.PaymentOneTimePremium,
                        ],
                        pendingTransactionTypes: [
                            TransactionType.PaymentInitialPremium,
                            TransactionType.SubsequentPayment,
                            TransactionType.PaymentOneTimePremium,
                        ],
                    };
                case TransactionFilters.Withdrawals:
                    return {
                        completedTransactionTypes: [TransactionType.FullSurrender, TransactionType.PartialWithdrawalOneTime],
                        pendingTransactionTypes: [TransactionType.FullSurrender, TransactionType.PartialWithdrawalOneTime],
                    };
                default:
                    return {
                        completedTransactionTypes: [
                            ...completedTransactionTypes,
                            TransactionType.FullSurrender,
                            TransactionType.PartialWithdrawalOneTime,
                        ],
                        pendingTransactionTypes: [
                            ...pendingTransactionTypes,
                            TransactionType.FullSurrender,
                            TransactionType.PartialWithdrawalOneTime,
                        ],
                    };
            }

        case EventFilterKeys.People:
            switch (subfilterName) {
                case PeopleFilters.Address:
                    return {
                        completedTransactionTypes: [TransactionType.AddressChange],
                        pendingTransactionTypes: [TransactionType.AddressChange],
                    };
                case PeopleFilters.BankAccount:
                    return {
                        completedTransactionTypes: [TransactionType.BankAccountChange],
                        pendingTransactionTypes: [TransactionType.BankAccountChange],
                    };
                // case PeopleFilters.CommunicationPreference: BPB - TODO: DEPU-2218
                //     return {
                //         completedTransactionTypes: [TransactionType.CommunicationPreferenceChange],
                //         pendingTransactionTypes: [TransactionType.CommunicationPreferenceChange],
                //         canceledTransactionTypes: [],
                //     };
                case PeopleFilters.Email:
                    return {
                        completedTransactionTypes: [TransactionType.EmailChange],
                        pendingTransactionTypes: [TransactionType.EmailChange],
                    };
                case PeopleFilters.Phone:
                    return {
                        completedTransactionTypes: [TransactionType.PhoneNumberChange],
                        pendingTransactionTypes: [TransactionType.PhoneNumberChange],
                    };
                default:
                    return {
                        completedTransactionTypes: [
                            TransactionType.AddressChange,
                            TransactionType.BankAccountChange,
                            // TransactionType.CommunicationPreferenceChange, BPB - TODO: DEPU-2218
                            TransactionType.EmailChange,
                            TransactionType.PhoneNumberChange,
                        ],
                        pendingTransactionTypes: [
                            TransactionType.AddressChange,
                            TransactionType.BankAccountChange,
                            // TransactionType.CommunicationPreferenceChange, BPB - TODO: DEPU-2218
                            TransactionType.EmailChange,
                            TransactionType.PhoneNumberChange,
                        ],
                    };
            }

        default:
            return {
                completedTransactionTypes: allCompletedTransactionTypes,
                pendingTransactionTypes: allPendingTransactionTypes,
                
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
export const EmptyState = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div className="flex h-[232px] w-full items-center justify-center rounded border-2 border-dashed border-gray-200 bg-gray-50">
        <CardInfo icon={<HistoryEvent width={50} height={50} className="text-gray-300" />} title={title} subtitle={subtitle} />
    </div>
);

export const EventItem = ({
    transaction,
    policy,
    refreshTransactions,
}: {
    transaction?: Transaction;
    policy: Policy;
    refreshTransactions: () => void;
}) => {
    const { amount, caption, eventBody, eventTitle, isClickable, isPending, sideSheetContent, sideSheetTitle } = getEventCardValues(
        policy,
        transaction,
        refreshTransactions
    );

    return (
        <HistoryEventCard
            status={transaction?.status as Status}
            amount={amount || transaction?.transactionAmounts?.requestedAmount}
            caption={caption}
            eventBody={eventBody}
            eventTitle={eventTitle}
            isClickable={isClickable}
            isPending={isPending}
            sideSheetTitle={sideSheetTitle}
            sideSheetContent={sideSheetContent}
            processDate={transaction?.processDate}
        />
    );
};