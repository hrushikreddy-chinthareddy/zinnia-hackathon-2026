import { Button } from '@zinnia/bloom/components';
import { TFunction, useTranslation } from 'next-i18next';
import { useMemo } from 'react';

import TempNavInactive from '@deps/components/nav-element/temp-nav-inactive/temp-nav-inactive';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { usePolicyDataContext } from '@deps/contexts/PolicyDataContext';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { useViewState } from '@deps/contexts/ViewStateContext';
import { useTransactionPermissionCheck } from '@deps/hooks/useTransactionPermissionCheck';
import { TransactionPermission } from '@deps/utils/auth';
import { getCarrierNameByClientId } from '@deps/utils/carriers';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import {
    Transaction,
    TransactionStatus,
    TransactionType,
} from '@zinnia/api-types/types/sor';

import {
    TRANSACTION_TYPES_ELIGIBLE_FOR_CANCEL,
    TRANSACTION_TYPES_ELIGIBLE_FOR_REVERSAL,
    TransactionSidesheetViews,
} from './utils';

const isTransactionEligibleForReversal = (
    transaction: Transaction
): boolean => {
    return (
        transaction?.status === TransactionStatus.COMPLETED &&
        !!transaction?.transactionType &&
        TRANSACTION_TYPES_ELIGIBLE_FOR_REVERSAL.includes(
            transaction?.transactionType
        )
    );
};

const isTransactionEligibleForCancel = (transaction: Transaction): boolean => {
    return (
        transaction?.status === TransactionStatus.PENDING &&
        !!transaction?.transactionType &&
        TRANSACTION_TYPES_ELIGIBLE_FOR_CANCEL.includes(
            transaction.transactionType
        )
    );
};

const getCancelCta = (transaction: Transaction, t: TFunction): string => {
    switch (transaction?.transactionType) {
        case TransactionType.FULL_SURRENDER:
            return t('policy.history.sidesheet.cancelSurrender');
        case TransactionType.NEW_LOAN:
            return t('policy.history.sidesheet.cancelLoan');
        case TransactionType.ONE_TIME_PREMIUM:
        case TransactionType.PAYMENT_ONE_TIME_PREMIUM:
            return t('policy.history.sidesheet.cancelPayment');
        default:
            return t('allFields.cancel');
    }
};

// overkill for now since all go to reverse payment, but I like patterns
const getReverseCta = (transaction: Transaction, t: TFunction): string => {
    switch (transaction?.transactionType) {
        default:
            return t('policy.history.reverseRecreateSidesheet.reversePayment');
    }
};

export default function TransactionSidesheetActions({
    transaction,
}: {
    transaction: Transaction;
}) {
    const { featureFlags } = useOptimizely();
    const { changeSideSheetContent } = useSideSheetContext();
    const { setViewState } = useViewState();
    const { policyDetails } = usePolicyDataContext();
    const { t } = useTranslation();

    const { isPermissioned: canWritePolicy } = useTransactionPermissionCheck(
        TransactionPermission.WritePolicy,
        policyDetails?.policyNumber,
        policyDetails?.planCode
    );

    const showReverse = useMemo(() => {
        const isReverseEnabled =
            featureFlags[FEATURE_FLAGS.REVERSE_RECREATE_ENABLED];

        return (
            isReverseEnabled && isTransactionEligibleForReversal(transaction)
        );
    }, [featureFlags, transaction]);

    const showCancel = useMemo(() => {
        return isTransactionEligibleForCancel(transaction);
    }, [transaction]);

    const cancelCta = getCancelCta(transaction, t);
    const reverseCta = getReverseCta(transaction, t);

    return (
        <div>
            {showReverse &&
                (canWritePolicy ? (
                    <Button
                        onClick={() => {
                            changeSideSheetContent(
                                t(
                                    'policy.history.reverseRecreateSidesheet.title'
                                )
                            );
                            setViewState(TransactionSidesheetViews.reverse);
                        }}
                        mode="link"
                        size="small"
                    >
                        {reverseCta}
                    </Button>
                ) : (
                    <TempNavInactive
                        tooltipBody={t(
                            'policy.history.reverseRecreateSidesheet.transactions.permissionDeniedTooltip',
                            {
                                carrier: getCarrierNameByClientId(
                                    policyDetails?.carrierId
                                ),
                            }
                        )}
                    >
                        <Button disabled mode="link" size="small">
                            {reverseCta}
                        </Button>
                    </TempNavInactive>
                ))}
            {showCancel &&
                (canWritePolicy ? (
                    <Button
                        onClick={() => {
                            setViewState(TransactionSidesheetViews.cancel);
                        }}
                        mode="link"
                        size="small"
                    >
                        {cancelCta}
                    </Button>
                ) : (
                    <TempNavInactive
                        tooltipBody={t(
                            'policy.history.reverseRecreateSidesheet.transactions.permissionDeniedTooltip',
                            {
                                carrier: getCarrierNameByClientId(
                                    policyDetails?.carrierId
                                ),
                            }
                        )}
                    >
                        <Button disabled mode="link" size="small">
                            {cancelCta}
                        </Button>
                    </TempNavInactive>
                ))}
        </div>
    );
}
