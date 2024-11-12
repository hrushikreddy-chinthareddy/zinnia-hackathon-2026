import { Tag, TagProps, TagVariant } from '@zinnia/bloom/components';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';

import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import SideSheetFinancialTransaction from '@deps/components/side-sheet/side-sheet-transaction/financial/side-sheet-financial-transaction';
import SideSheetNonFinancialTransaction from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/side-sheet-non-financial-transaction';
import {
    getTransactionSideSheetTitle,
} from '@deps/components/side-sheet/side-sheet-transaction/side-sheet-transaction.helper';
import { TranslationFiles } from '@deps/config/translations';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { AccessibleFormattedAmount } from '@deps/helpers/numbers.helper';
import { Statuses } from '@deps/models/case/case';
import { Policy, Transaction, TransactionStatus, TransactionType } from '@deps/models/policy/sor-policy';
import { ReactComponent as ChevronRightIcon } from '@deps/styles/elements/icons/icons_outlined/chevron-right.svg';
import { DEFAULT_DATE_FORMAT } from '@deps/types/constants';

import { getHistoryEventCardValues } from './history-event-card.helper';
import SideSheetNewLoanTransaction from '../side-sheet/side-sheet-transaction/loan/side-sheet-new-loan-transaction';
import { FinancialTransactionTypes, SideSheetTransactionProps } from '../side-sheet/side-sheet-transaction/types';

export interface HistoryEventCardProps {
    refreshTransactions?: () => void;
    policy: Policy;
    transaction?: Transaction;
}

const getDate = (date?: Date | string) => {
    if (date) return dayjs(date).format(DEFAULT_DATE_FORMAT);
    return '';
};

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

        let Component: (props: SideSheetTransactionProps) => JSX.Element;

        const props: SideSheetTransactionProps = {
            policy: policy,
            transaction: transaction,
            refreshTransactions: refreshTransactions,
        };

        if (transactionType === TransactionType.NewLoan) {
            props.refreshTransactions = undefined;
            Component = SideSheetNewLoanTransaction;
        } else if (transactionType && FinancialTransactionTypes.includes(transactionType)) {
            Component = SideSheetFinancialTransaction;
        } else {
            Component = SideSheetNonFinancialTransaction;
        }

        sideSheet.changeSideSheetContent(title, <Component {...props} />);
        sideSheet.handleOpen(true);
    };

    const statusMap: Partial<Record<TransactionStatus | Statuses, TagProps>> = {
        [Statuses.Canceled]: {
            variant: TagVariant.Information,
            text: `${t('status.canceledOn', { date: getDate(processDate) })}`,
        },
        [TransactionStatus.Canceled]: {
            variant: TagVariant.Information,
            text: `${t('status.canceledOn', { date: getDate(processDate) })}`,
        },
        [TransactionStatus.Reversed]: {
            variant: TagVariant.Default,
            text: `${t('status.reversed')}`,
        },
    };

    const containerClasses = clsx(
        'flex w-full flex-col rounded border-2 p-4',
        isPending ? 'border-dashed border-gray-300 bg-gray-100' : 'border-gray-100 bg-white',
        isClickable ? 'hover:border-yellow-400' : 'pointer-events-none'
    );

    // Sidesheet Support

    let tagProps: TagProps | undefined;

    if (status) {
        tagProps = statusMap[status];
    }

    return (
        <li>
            <button aria-disabled={!isClickable} className={containerClasses} onClick={openTransactionSidesheet}>
                <div className="flex min-h-[62px] w-full items-center justify-between gap-4">
                    <div className="flex grow flex-col items-start">
                        <div className="text-content-caption font-medium text-gray-500">{caption}</div>

                        <div className="flex items-center gap-2">
                            <div className="font-primary text-label-lg font-semibold">{eventTitle}</div>
                            {tagProps && <Tag {...tagProps} />}
                        </div>

                        {eventBody && (
                            <div className="font-secondary text-body-sm">
                                <PiiWrapper>{eventBody}</PiiWrapper>
                            </div>
                        )}
                    </div>
                    {amount !== undefined && (
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
