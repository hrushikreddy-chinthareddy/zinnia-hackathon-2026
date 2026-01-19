import { useQuery } from '@tanstack/react-query';
import {
    AssistiveText,
    AssistiveTextVariant,
    SideSheet,
} from '@zinnia/bloom/components';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';

import EventsLoader from '@deps/components/events-loader/events-loader';
import { ViewStateProvider } from '@deps/contexts/ViewStateContext';
import { toTitleCase } from '@deps/helpers/string.helpers';
import { useTransactionByIdQuery } from '@deps/hooks/useTransactionByIdQuery';
import { Collapse, TreeStateProvider } from '@deps/hooks/useTreeState';
import {
    getAccountingEntries,
    getAccountingEntriesQueryKey,
} from '@deps/queries/tanstack/policyQueries/policyQueries';
import { TransactionType } from '@zinnia/api-types/types/sor';

import { TransactionSidesheetContent } from './content/transaction-sidesheet-content';

/**
 * A Sidesheet component that displays all key-value pairs of a policy.
 *
 * When opened, it displays a date picker to select a date, and a search field to search
 * key-value pairs. The date picker is disabled for future dates, and the search field
 * filters down the key-value pairs based on the search value.
 *
 * @param {string} transaction - the plan code of the policy
 * @returns {JSX.Element} - the rendered component
 */
export const FindAllKeyValuesTransactionSidesheet = ({
    onOpenChange,
    open,
    planCode,
    policyNumber,
    transactionId,
    onTransactionSubmit,
}: {
    open: boolean;
    policyNumber: string | undefined;
    planCode: string | undefined;
    onOpenChange: Dispatch<SetStateAction<boolean>>;
    transactionId: string | undefined;
    transactionType: TransactionType | undefined;
    onTransactionSubmit?: () => void;
}) => {
    const { t } = useTranslation();
    const {
        data: transaction,
        isLoading,
        isError,
    } = useTransactionByIdQuery({
        transactionId,
        policyNumber,
        planCode,
    });
    const { data: accountingEntries, isLoading: isLoadingAccountingEntries } =
        useQuery({
            queryKey: [
                getAccountingEntriesQueryKey,
                planCode,
                policyNumber,
                transactionId,
            ],
            queryFn: () =>
                getAccountingEntries({
                    limit: 50, // API will 500 without a limit or offset.  Per Maureen, there should never be more than ~8 entries per transaction
                    offset: 0,
                    planCode: planCode,
                    policyNumber: policyNumber,
                    transactionId: transactionId,
                }),
            select: (data) => data?.data,
            enabled: !!planCode && !!policyNumber && !!transactionId,
        });

    if (!transaction) {
        return null;
    }

    return (
        <SideSheet
            trigger={null}
            header={
                <span className="typography-desktop-headline-2-d">
                    {toTitleCase(
                        t(
                            `enums.${transaction?.transactionType}`,
                            transaction?.transactionType ?? ''
                        ) ?? ''
                    )}
                </span>
            }
            open={open}
            onOpenChange={onOpenChange}
            preventCloseOnOutsideClick={false}
        >
            <ViewStateProvider>
                {(isLoading || isLoadingAccountingEntries) && (
                    <EventsLoader
                        message={t('allFields.loadingTransactionDetails')}
                    />
                )}
                {isError && !isLoading && !transaction && (
                    <AssistiveText
                        text={t('allFields.transactionDetailsError')}
                        variant={AssistiveTextVariant.Error}
                    />
                )}
                {!isError &&
                    !isLoading &&
                    !isLoadingAccountingEntries &&
                    !!transaction && (
                        <TreeStateProvider initialTreeState={Collapse}>
                            <TransactionSidesheetContent
                                accountingEntries={accountingEntries}
                                onTransactionSubmit={onTransactionSubmit}
                                transaction={transaction}
                            />
                        </TreeStateProvider>
                    )}
            </ViewStateProvider>
        </SideSheet>
    );
};
