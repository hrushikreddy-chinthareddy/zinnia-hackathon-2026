import clsx from 'clsx';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';

import ChipStatus from '@deps/components/chip-status/chip-status';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import SideSheetFinancialTransaction from '@deps/components/side-sheet/side-sheet-transaction/side-sheet-financial-transaction';
import SideSheetNonFinancialTransaction from '@deps/components/side-sheet/side-sheet-transaction/side-sheet-non-financial-transaction';
import {
    financialTransactionTypes,
    getTransactionSideSheetTitle,
} from '@deps/components/side-sheet/side-sheet-transaction/side-sheet-transaction.helper';
import { TranslationFiles } from '@deps/config/translations';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { AccessibleFormattedAmount } from '@deps/helpers/numbers.helper';
import { Statuses } from '@deps/models/case/case';
import { Policy, Transaction, TransactionStatus, TransactionType } from '@deps/models/policy/sor-policy';
import { ReactComponent as ChevronRightIcon } from '@deps/styles/elements/icons/icons_outlined/chevron-right.svg';

import { getHistoryEventCardValues } from './history-event-card.helper';
import SideSheetNewLoanTransaction from '../side-sheet/side-sheet-transaction/side-sheet-new-loan-transaction';

export interface HistoryEventCardProps {
    refreshTransactions?: () => void;
    policy?: Policy;
    transaction?: Transaction;
}

const HistoryEventCard = ({ refreshTransactions, policy, transaction }: HistoryEventCardProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);
    const sideSheet = useSideSheetContext();
    const { processDate, status } = transaction || {};

    const { amount, caption, eventBody, eventTitle, isClickable, isPending } = getHistoryEventCardValues(
        policy as Policy,
        transaction as Transaction
    );
    const openTransactionSidesheet = () => {
        if (!transaction) {
            return;
        }

        const { transactionType } = transaction;
        const title = getTransactionSideSheetTitle(transaction as Transaction, t);

        let content;

        if (transactionType === TransactionType.NewLoan) {
            content = (
                <SideSheetNewLoanTransaction
                    policy={policy as Policy}
                    // refreshTransactions={refreshTransactions}
                    transaction={transaction as Transaction}
                />
            );
        } else if (financialTransactionTypes.includes(transactionType as TransactionType)) {
            content = (
                <SideSheetFinancialTransaction
                    policy={policy as Policy}
                    refreshTransactions={refreshTransactions}
                    transaction={transaction as Transaction}
                />
            );
        } else {
            content = (
                <SideSheetNonFinancialTransaction
                    policy={policy as Policy}
                    refreshTransactions={refreshTransactions}
                    transaction={transaction as Transaction}
                />
            );
        }

        sideSheet.changeSideSheetContent(title, content);
        sideSheet.handleOpen(true);
    };

    const containerClasses = clsx(
        'flex w-full flex-col rounded border-2 p-4',
        isPending ? 'border-dashed border-gray-300 bg-gray-100' : 'border-gray-100 bg-white',
        isClickable ? 'hover:border-yellow-400' : 'pointer-events-none'
    );

    return (
        <li>
            <button aria-disabled={!isClickable} className={containerClasses} onClick={openTransactionSidesheet}>
                <div className="flex min-h-[62px] w-full items-center justify-between gap-4">
                    <div className="flex grow flex-col items-start">
                        <div className="text-content-caption font-medium text-gray-500">{caption}</div>

                        <div className="flex items-center gap-2">
                            <div className="font-primary text-label-lg font-semibold">{eventTitle}</div>
                            {status && status === TransactionStatus.Canceled && (
                                <ChipStatus
                                    status={status as unknown as Statuses}
                                    statusText={t('status.canceledOn', { date: dayjs(processDate).format('M/DD/YYYY') }) as string}
                                    classNames="border-semantic-info bg-semantic-info-light w-fit"
                                />
                            )}
                        </div>

                        {eventBody && (
                            <div className="font-secondary text-body-sm">
                                <PiiWrapper>{eventBody}</PiiWrapper>
                            </div>
                        )}
                    </div>

                    {!!amount && (
                        <div className="font-bold md:text-content-value">
                            <AccessibleFormattedAmount amount={amount} />
                        </div>
                    )}

                    {isClickable && <ChevronRightIcon className="text-secondary" height={24} width={24} />}
                </div>
            </button>
        </li>
    );
};

export default HistoryEventCard;
